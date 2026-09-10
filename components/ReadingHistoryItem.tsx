'use client'

import { useLocale, useTranslations } from 'next-intl'
import BaziChartCard from '@/components/BaziChartCard'
import InterpretationContent from '@/components/InterpretationContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Reading } from '@/hooks/useReadings'

export default function ReadingHistoryItem({
  reading,
  expanded,
  removing,
  deleteDisabled,
  onToggle,
  onRemove,
}: {
  reading: Reading
  expanded: boolean
  removing: boolean
  deleteDisabled: boolean
  onToggle: () => void
  onRemove: () => void
}) {
  const locale = useLocale()
  const history = useTranslations('historyPage')
  const question = useTranslations('question')
  const contentId = `reading-${reading.id}`
  return (
    <Card asChild className="animate-fade-up overflow-hidden">
      <li>
        <Button
          type="button"
          onClick={onToggle}
          variant="ghost"
          aria-expanded={expanded}
          aria-controls={expanded ? contentId : undefined}
          className="h-auto w-full items-start justify-between gap-3 rounded-none p-5 text-left"
        >
          <span className="min-w-0">
            <span className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-2 py-0.5">
                {question(`categories.${reading.category}`)}
              </span>
              <span>
                {new Date(reading.created_at).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </span>
            <span className="block truncate text-body">{reading.question}</span>
          </span>
          <span className="mt-1 shrink-0 text-muted-foreground">
            {expanded ? history('collapse') : history('expand')}
          </span>
        </Button>
        {expanded && (
          <CardContent id={contentId} className="space-y-4 border-t border-border p-5">
            <BaziChartCard chart={reading.chart} />
            <InterpretationContent text={reading.interpretation} />
            <Button
              type="button"
              onClick={onRemove}
              disabled={deleteDisabled}
              variant="link"
              className="h-auto p-0 text-xs text-destructive hover:text-destructive/80"
            >
              {removing ? history('removing') : history('remove')}
            </Button>
          </CardContent>
        )}
      </li>
    </Card>
  )
}
