import type { Metadata } from 'next'
import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Header from '@/components/Header'
import './globals.css'

/** 內文:黑體;標題與干支:明朝體(古籍感) */
const sans = Noto_Sans_TC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  preload: false,
  variable: '--font-sans-tc',
})

const serif = Noto_Serif_TC({
  weight: ['600', '700'],
  subsets: ['latin'],
  preload: false,
  variable: '--font-serif-tc',
})

export const metadata: Metadata = {
  title: '問命|AI 八字解讀',
  description: '輸入你的困惑與生辰,由傳統八字排盤結合 AI,給你一點人生方向。',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale === 'en' ? 'en' : 'zh-Hant'}
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div className="flex-1">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
