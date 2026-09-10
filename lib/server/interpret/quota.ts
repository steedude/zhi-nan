import type { Locale } from '@/types/i18n'
import { jsonError } from '@/lib/server/api-errors'
import {
  isAnonDailyLimited,
  isMemberDailyLimited,
  isMinuteLimited,
} from '@/lib/server/rate-limit'
import type { InterpretSession } from '@/lib/server/interpret/session'

interface QuotaInput {
  ip: string
  locale: Locale
  session: InterpretSession
}

/**
 * 檢查成本保護：
 * 1. 所有人都套每分鐘 IP 限流。
 * 2. 會員以 user id、訪客以 IP 在 Redis 原子扣除每日額度。
 * 3. 用量獨立於歷史紀錄；刪除紀錄不會恢復額度。
 */
export async function checkInterpretQuota({
  ip,
  locale,
  session,
}: QuotaInput): Promise<Response | null> {
  try {
    if (await isMinuteLimited(ip)) return jsonError('RATE_LIMITED', locale, 429)

    if (session.supabase && session.user) {
      return (await isMemberDailyLimited(session.user.id))
        ? jsonError('MEMBER_QUOTA_EXCEEDED', locale, 429)
        : null
    }

    return (await isAnonDailyLimited(ip))
      ? jsonError('ANON_QUOTA_EXCEEDED', locale, 429)
      : null
  } catch (cause) {
    // 無法確認用量時暫停生成，避免 Redis 故障讓額度保護失效。
    return jsonError('QUOTA_SERVICE_UNAVAILABLE', locale, 503, {
      report: true,
      cause,
      context: { tags: { route: 'api.interpret', phase: 'quota' } },
    })
  }
}
