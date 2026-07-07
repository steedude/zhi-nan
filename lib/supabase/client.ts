import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase 瀏覽器端 client
 *
 * 會員功能為「可選配置」:兩個環境變數都設定後自動啟用;
 * 未設定時全站仍可正常使用(僅隱藏登入與紀錄功能)。
 */

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
