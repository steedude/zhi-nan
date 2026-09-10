import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { ANON_DAILY_LIMIT, MEMBER_DAILY_LIMIT, PER_MINUTE_LIMIT } from '@/configs/quota'
import { CONSUME_DAILY_QUOTA } from '@/lib/server/daily-quota'
import { env, isUpstashEnvConfigured } from '@/env'
import { todayTaipei } from '@/utils/date'

const minuteHits = new Map<string, number[]>()
const dayHits = new Map<string, { date: string; count: number }>()

const redis = isUpstashEnvConfigured()
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

const minuteLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(PER_MINUTE_LIMIT, '1 m'),
    prefix: 'zhi-nan:minute',
  })

export async function isMinuteLimited(ip: string): Promise<boolean> {
  if (minuteLimiter) {
    const result = await minuteLimiter.limit(ip)
    return !result.success
  }

  const now = Date.now()
  const recent = (minuteHits.get(ip) ?? []).filter((t) => now - t < 60_000)
  recent.push(now)
  minuteHits.set(ip, recent)
  return recent.length > PER_MINUTE_LIMIT
}

export async function isAnonDailyLimited(ip: string): Promise<boolean> {
  return isDailyLimited(`anon:${ip}`, ANON_DAILY_LIMIT)
}

export async function isMemberDailyLimited(userId: string): Promise<boolean> {
  return isDailyLimited(`member:${userId}`, MEMBER_DAILY_LIMIT)
}

async function isDailyLimited(identity: string, limit: number): Promise<boolean> {
  const today = todayTaipei()
  if (redis) {
    const allowed = await redis.eval<[number], number>(
      CONSUME_DAILY_QUOTA,
      [`zhi-nan:daily:${identity}:${today}`],
      [limit],
    )
    return allowed !== 1
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Daily quota requires Upstash Redis in production')
  }

  // 記憶體備援僅供本機開發，不能作為正式環境的跨實例額度。
  for (const [key, value] of dayHits) {
    if (value.date !== today) dayHits.delete(key)
  }
  const entry = dayHits.get(identity)
  if (!entry || entry.date !== today) {
    dayHits.set(identity, { date: today, count: 1 })
    return false
  }
  if (entry.count >= limit) return true
  entry.count++
  return false
}
