'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export type Reading = Database['public']['Tables']['readings']['Row']
type HistoryError = 'load' | 'remove' | null

/** 掛載於以 userId 為 key 的元件，避免帳號切換時混用資料。 */
export function useReadings(userId: string) {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<HistoryError>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const active = useRef(false)
  const requestId = useRef(0)
  const deleting = useRef(false)

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await createClient()
        .from('readings')
        .select(
          'id, user_id, created_at, category, question, gender, solar_date, chart, interpretation',
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      if (active.current && currentRequest === requestId.current) setReadings(data ?? [])
    } catch {
      if (active.current && currentRequest === requestId.current) setError('load')
    } finally {
      if (active.current && currentRequest === requestId.current) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    active.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
    return () => {
      active.current = false
    }
  }, [reload])

  async function remove(id: string) {
    if (deleting.current) return
    deleting.current = true
    setRemovingId(id)
    setError(null)
    try {
      const { data, error } = await createClient()
        .from('readings')
        .delete()
        .eq('user_id', userId)
        .eq('id', id)
        .select('id')
      if (error || !data?.some((reading) => reading.id === id))
        throw error ?? new Error('Reading not deleted')
      if (active.current)
        setReadings((previous) => previous.filter((reading) => reading.id !== id))
    } catch {
      if (active.current) setError('remove')
    } finally {
      deleting.current = false
      if (active.current) setRemovingId(null)
    }
  }

  return { readings, loading, error, removingId, reload, remove }
}
