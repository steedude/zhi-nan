export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zhinan.3854335.com',
)

export const siteConfig = {
  name: '指南',
  alternateName: 'Zhi Nan',
  title: '指南 | AI 八字決策指引',
  description:
    '輸入你的困惑與出生資料，結合傳統八字排盤與 AI 解讀，為感情、工作、財運與人生方向提供參考。',
  url: SITE_URL.origin,
  ogImage: '/opengraph-image',
  twitterImage: '/twitter-image',
  keywords: [
    '指南',
    'Zhi Nan',
    'AI 算命',
    'AI 八字',
    '八字解讀',
    '八字排盤',
    '命盤分析',
    '人生方向',
    '感情占卜',
    '工作決策',
    '財運分析',
  ],
} as const

export function getSiteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}
