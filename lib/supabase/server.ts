import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase 伺服器端 client(Route Handler / Server Component 用)
 *
 * 以 cookie 綁定使用者 session,所有查詢都受 RLS(Row Level Security)保護,
 * 伺服器只用 publishable key,不需要 service role key。
 */

export function isSupabaseConfiguredOnServer(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // 在 Server Component 中呼叫 set 會丟錯,可安全忽略
            // (session 刷新由 proxy.ts 處理)
          }
        },
      },
    },
  )
}
