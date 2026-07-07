import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

/**
 * Proxy(Next.js 16 的 middleware 檔案慣例)
 *
 * 職責:在每個請求前刷新 Supabase session token,
 * 讓 Server Component 與 Route Handler 讀到的登入狀態不過期。
 * 未設定 Supabase 環境變數時直接放行。
 */

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // 觸發 token 刷新(結果不需使用)
  await supabase.auth.getUser()

  return response
}

export const config = {
  // 排除靜態資源,其餘請求都經過 session 刷新
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
