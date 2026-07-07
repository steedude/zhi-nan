'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { parseSections } from '@/utils/interpretation'

/**
 * 解讀卡片:串流顯示 AI 文字、複製結果
 *
 * AI 依提示詞規範以【標題】分段輸出;utils/interpretation 把每段解析出來,
 * 標題渲染成帶飾線的小節標。串流中最後一段可能還不完整,一樣照常渲染。
 */

interface Props {
  text: string
  /** AI 是否仍在生成中(顯示閃爍游標) */
  streaming: boolean
  error: string
}

export default function InterpretationCard({ text, streaming, error }: Props) {
  const t = useTranslations('interpretation')
  const [copied, setCopied] = useState(false)
  const sections = parseSections(text)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(setCopied, 2000, false)
    } catch {
      // 剪貼簿權限被拒時靜默失敗
    }
  }

  return (
    <Card className="animate-fade-up">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-stone-800">{t('title')}</h2>
          {!streaming && text && (
            <Button
              type="button"
              onClick={copy}
              variant="outline"
              size="sm"
              className="h-8 border-stone-300 text-xs text-stone-500 hover:text-stone-700"
            >
              {copied ? t('copied') : t('copy')}
            </Button>
          )}
        </div>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : text ? (
          <div className={streaming ? 'streaming-caret' : ''}>
            {sections.map((s, i) => (
              <div key={s.title ?? 'preamble'} className={i > 0 ? 'mt-6' : ''}>
                {s.title && (
                  <h3 className="font-display mb-2 flex items-center gap-2 text-base text-teal-800">
                    <span className="h-4 w-[3px] rounded-full bg-gradient-to-b from-teal-500 to-teal-700" />
                    {s.title}
                  </h3>
                )}
                <p className="whitespace-pre-wrap text-[15px] leading-7 text-stone-700">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="streaming-caret text-stone-500">{t('generating')}</p>
        )}

        <p className="mt-7 border-t border-stone-200 pt-4 text-xs text-stone-400">
          {t('disclaimer')}
        </p>
      </CardContent>
    </Card>
  )
}
