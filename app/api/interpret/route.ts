import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { BaziChart } from '@/types/bazi'
import type { Locale } from '@/types/i18n'
import { GoogleGenAI } from '@google/genai'
import { GEMINI_MODEL, GENERATION_CONFIG } from '@/configs/gemini'
import { ANON_DAILY_LIMIT, MEMBER_DAILY_LIMIT, PER_MINUTE_LIMIT } from '@/configs/quota'
import { computeBazi } from '@/lib/bazi'
import { buildUserContent, SYSTEM_INSTRUCTION } from '@/lib/prompt'
import {
  createClient as createSupabase,
  isSupabaseConfiguredOnServer,
} from '@/lib/supabase/server'
import { interpretRequestSchema, type InterpretRequest } from '@/lib/validation/interpret'
import { isLocale } from '@/locales'
import { todayTaipei } from '@/utils/date'

/**
 * 解讀 API(串流)
 *
 * 流程:驗證輸入 → 額度檢查 → 伺服器端確定性排盤 → Gemini 串流回傳
 *      → (會員)解讀完成後自動存入 readings。
 *
 * 額度設計(變現基礎):
 *   訪客 每日 ANON_DAILY_LIMIT 次(記憶體計數,per IP)
 *   會員 每日 MEMBER_DAILY_LIMIT 次(以 readings 資料表計數,跨實例準確)
 */

export const maxDuration = 60 // Vercel:AI 生成可能超過預設函式逾時

// ── API 錯誤訊息(依請求語系回覆)──────────────────────────

const MESSAGES = {
  noApiKey: {
    'zh-TW': '伺服器尚未設定 GEMINI_API_KEY,請參考 README 完成設定。',
    en: 'GEMINI_API_KEY is not configured on the server. See README.',
  },
  tooFrequent: {
    'zh-TW': '請求太頻繁了,請稍候一分鐘再試。',
    en: 'Too many requests. Please wait a minute and try again.',
  },
  badRequest: {
    'zh-TW': '請確認問題與出生時間都已正確填寫。',
    en: 'Please check that the question and birth time are filled in correctly.',
  },
  memberQuota: {
    'zh-TW': `今日 ${MEMBER_DAILY_LIMIT} 次解讀額度已用完,明天再來吧。`,
    en: `You've used all ${MEMBER_DAILY_LIMIT} readings for today. Come back tomorrow.`,
  },
  anonQuota: {
    'zh-TW': `訪客每日可免費解讀 ${ANON_DAILY_LIMIT} 次,登入會員可提高至每日 ${MEMBER_DAILY_LIMIT} 次。`,
    en: `Guests get ${ANON_DAILY_LIMIT} free readings per day. Sign in to raise it to ${MEMBER_DAILY_LIMIT}.`,
  },
  aiUnavailable: {
    'zh-TW': 'AI 解讀服務暫時無法使用,請稍後再試。',
    en: 'The AI reading service is temporarily unavailable. Please try again later.',
  },
} satisfies Record<string, Record<Locale, string>>

type MessageKey = keyof typeof MESSAGES

function jsonError(key: MessageKey, locale: Locale, status: number): Response {
  return Response.json({ error: MESSAGES[key][locale] }, { status })
}

// ── 額度與限流 ──────────────────────────────────────────

// 記憶體計數在 serverless 多實例下是「盡力而為」的成本保護;
// 會員額度走資料庫計數,不受此限。
const minuteHits = new Map<string, number[]>()
const dayHits = new Map<string, { date: string; count: number }>()

function isMinuteLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (minuteHits.get(ip) ?? []).filter((t) => now - t < 60_000)
  recent.push(now)
  minuteHits.set(ip, recent)
  return recent.length > PER_MINUTE_LIMIT
}

function isAnonDailyLimited(ip: string): boolean {
  const today = todayTaipei()
  const entry = dayHits.get(ip)
  if (!entry || entry.date !== today) {
    dayHits.set(ip, { date: today, count: 1 })
    return false
  }
  entry.count++
  return entry.count > ANON_DAILY_LIMIT
}

/** 會員今日已用次數(readings 表計數,受 RLS 保護只算得到自己的) */
async function memberUsedToday(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const startOfToday = `${todayTaipei()}T00:00:00+08:00`
  const { count } = await supabase
    .from('readings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfToday)
  return count ?? 0
}

// ── 輸入驗證 ────────────────────────────────────────────

function parseBody(body: unknown): InterpretRequest | null {
  const result = interpretRequestSchema.safeParse(body)
  return result.success ? result.data : null
}

// ── 紀錄保存 ────────────────────────────────────────────

async function saveReading(
  supabase: SupabaseClient,
  user: User,
  body: InterpretRequest,
  chart: BaziChart,
  interpretation: string,
): Promise<void> {
  const { error } = await supabase.from('readings').insert({
    user_id: user.id,
    category: body.category,
    question: body.question,
    gender: body.gender,
    solar_date: chart.solarDate,
    chart,
    interpretation,
  })
  if (error) console.error('saveReading failed:', error.message)
}

// ── 主流程 ──────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return jsonError('badRequest', 'zh-TW', 400)
  }

  // 語系僅影響錯誤訊息與 AI 回覆語言,解析失敗時退回繁中
  const locale: Locale = isLocale((raw as Record<string, unknown>)?.locale)
    ? ((raw as Record<string, unknown>).locale as Locale)
    : 'zh-TW'

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return jsonError('noApiKey', locale, 500)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local'
  if (isMinuteLimited(ip)) return jsonError('tooFrequent', locale, 429)

  const body = parseBody(raw)
  if (!body) return jsonError('badRequest', locale, 400)

  // 取得登入狀態(未設定 Supabase 時視為訪客)
  let supabase: SupabaseClient | null = null
  let user: User | null = null
  if (isSupabaseConfiguredOnServer()) {
    supabase = await createSupabase()
    user = (await supabase.auth.getUser()).data.user
  }

  // 每日額度
  if (supabase && user) {
    const used = await memberUsedToday(supabase, user.id)
    if (used >= MEMBER_DAILY_LIMIT) return jsonError('memberQuota', locale, 429)
  } else if (isAnonDailyLimited(ip)) {
    return jsonError('anonQuota', locale, 429)
  }

  // 確定性排盤(與前端顯示用的是同一套程式)
  const chart = computeBazi(body)

  try {
    const ai = new GoogleGenAI({ apiKey })
    const stream = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: buildUserContent(
        body.question,
        body.category,
        body.gender,
        chart,
        body.locale,
      ),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION, // 固定前綴,利於隱式快取
        ...GENERATION_CONFIG,
      },
    })

    // Gemini 串流 → HTTP 純文字串流;完成後(會員)保存全文
    const encoder = new TextEncoder()
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let fullText = ''
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              fullText += chunk.text
              controller.enqueue(encoder.encode(chunk.text))
            }
          }
          if (supabase && user && fullText) {
            await saveReading(supabase, user, body, chart, fullText)
          }
          controller.close()
        } catch (err) {
          console.error('Gemini stream error:', err)
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Gemini API error:', err)
    return jsonError('aiUnavailable', locale, 502)
  }
}
