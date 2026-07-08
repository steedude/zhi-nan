'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/types/i18n'
import { useLocaleSwitcher } from '@/hooks/useLocaleSwitcher'
import { useUser } from '@/hooks/useUser'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import AuthDialog from './AuthDialog'

/** 頁首:品牌、語系切換與會員入口 */
export default function Header() {
  const { user } = useUser()
  const locale = useLocale() as Locale
  const setLocale = useLocaleSwitcher()
  const t = useTranslations('common')
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    const open = () => setAuthOpen(true)
    window.addEventListener('open-auth', open)
    return () => window.removeEventListener('open-auth', open)
  }, [])

  async function signOut() {
    await createClient().auth.signOut()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f6f4ee]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/favicon.ico"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-[6px] shadow-[0_2px_8px_rgba(15,143,131,.28)]"
            priority
          />
          <span className="font-display text-lg font-semibold tracking-[0.25em] text-stone-800">
            {t('siteName')}
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === 'zh-TW' ? 'en' : 'zh-TW')}
            className="h-8 px-2 text-xs text-stone-500 hover:text-teal-700"
            aria-label="Switch language"
          >
            {locale === 'zh-TW' ? 'EN' : '中'}
          </Button>

          {isSupabaseConfigured &&
            (user ? (
              <>
                <Link
                  href="/history"
                  className="text-stone-500 transition hover:text-teal-700"
                >
                  {t('history')}
                </Link>
                <Button
                  type="button"
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-stone-300 text-stone-500 hover:text-stone-700"
                >
                  {t('logout')}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setAuthOpen(true)}
                variant="brand"
                size="sm"
              >
                {t('login')}
              </Button>
            ))}
        </nav>
      </div>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}
