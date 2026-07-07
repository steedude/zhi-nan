'use client'

import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

/** 取得目前登入的使用者,並訂閱登入狀態變化 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  // 未設定 Supabase 時沒有任何非同步查詢,直接視為載入完成
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
