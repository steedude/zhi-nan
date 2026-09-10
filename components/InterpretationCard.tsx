'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import InterpretationContent from '@/components/InterpretationContent'

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
          <h2 className="font-display text-xl text-foreground">{t('title')}</h2>
          {!streaming && text && (
            <Button
              type="button"
              onClick={copy}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {copied ? t('copied') : t('copy')}
            </Button>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-4 text-sm text-destructive">
            {error}
          </p>
        )}
        {text ? (
          <InterpretationContent text={text} streaming={streaming} />
        ) : streaming ? (
          <p className="streaming-caret text-muted-foreground">{t('generating')}</p>
        ) : null}

        <p className="mt-7 border-t border-border/70 pt-4 text-xs text-muted-foreground">
          {t('disclaimer')}
        </p>
      </CardContent>
    </Card>
  )
}
