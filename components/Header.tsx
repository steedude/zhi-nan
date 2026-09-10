'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/types/i18n'
import { useLocaleSwitcher } from '@/hooks/useLocaleSwitcher'
import { useUser } from '@/hooks/useUser'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

/** 頁首:品牌、語系切換與會員入口 */
export default function Header() {
  const { user, loading, openAuth } = useUser()
  const locale = useLocale() as Locale
  const setLocale = useLocaleSwitcher()
  const t = useTranslations('common')

  async function signOut() {
    await createClient().auth.signOut()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="page-container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/favicon.ico"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-[6px] shadow-brand"
            priority
          />
          <span className="font-display text-lg font-semibold tracking-[0.25em] text-foreground">
            {t('siteName')}
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === 'zh-TW' ? 'en' : 'zh-TW')}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
            aria-label="Switch language"
          >
            {locale === 'zh-TW' ? 'EN' : '中'}
          </Button>

          {isSupabaseConfigured &&
            !loading &&
            (user ? (
              <>
                <Link
                  href="/history"
                  className="text-muted-foreground transition hover:text-primary"
                >
                  {t('history')}
                </Link>
                <Button type="button" onClick={signOut} variant="outline" size="sm">
                  {t('logout')}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={openAuth} variant="brand" size="sm">
                {t('login')}
              </Button>
            ))}
        </nav>
      </div>
    </header>
  )
}
