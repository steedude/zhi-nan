'use client'

import type { User } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { createContext, useCallback, useEffect, useState } from 'react'
import AuthDialog from '@/components/AuthDialog'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  loading: boolean
  openAuth: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

/** 全站共用一份登入狀態與登入視窗。 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [authOpen, setAuthOpen] = useState(false)
  const openAuth = useCallback(() => setAuthOpen(true), [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    let authChanged = false
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authChanged = true
      if (active) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })
    // 不讓較晚完成的初始查詢覆蓋登入／登出事件。
    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active && !authChanged) setUser(data.user)
      })
      .catch(() => {
        if (active && !authChanged) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, openAuth }}>
      {children}
      {isSupabaseConfigured && authOpen && (
        <AuthDialog open onClose={() => setAuthOpen(false)} />
      )}
    </AuthContext.Provider>
  )
}
