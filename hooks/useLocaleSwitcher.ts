'use client'

import type { Locale } from '@/types/i18n'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

const STORAGE_KEY = 'locale'

/** 切換 next-intl 使用的 cookie locale，並刷新 Server/Client messages。 */
export function useLocaleSwitcher() {
  const router = useRouter()

  return useCallback(
    (next: Locale) => {
      document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`
      document.documentElement.lang = next === 'en' ? 'en' : 'zh-Hant'
      router.refresh()
    },
    [router],
  )
}
