'use client'

import type { QuestionCategory } from '@/configs/questions'
import { useTranslations } from 'next-intl'
import { QUESTION_CATEGORIES } from '@/configs/questions'
import { Button } from '@/components/ui/button'
import StepCard from '@/components/StepCard'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

/** 第一步:選擇問題類別、寫下困惑 */

interface Props {
  question: string
  category: QuestionCategory
  onQuestionChange: (value: string) => void
  onCategoryChange: (value: QuestionCategory) => void
  onNext: () => void
}

export default function QuestionStep({
  question,
  category,
  onQuestionChange,
  onCategoryChange,
  onNext,
}: Props) {
  const t = useTranslations('question')

  return (
    <StepCard title={t('title')} description={t('desc')}>
      {/* 問題類別 */}
      <ToggleGroup
        type="single"
        value={category}
        onValueChange={(value) => {
          if (QUESTION_CATEGORIES.includes(value as QuestionCategory)) {
            onCategoryChange(value as QuestionCategory)
          }
        }}
        className="mb-4"
      >
        {QUESTION_CATEGORIES.map((c) => (
          <ToggleGroupItem key={c} value={c} className="rounded-full">
            {t(`categories.${c}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Textarea
        aria-label={t('title')}
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        maxLength={500}
        rows={4}
        placeholder={t(`placeholders.${category}`)}
        className="resize-none p-4"
      />
      <div className="mt-1 text-right text-xs text-muted-foreground">
        {question.length}
        /500
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={!question.trim()}
        variant="brand"
        className="mt-4 w-full"
      >
        {t('next')}
      </Button>
    </StepCard>
  )
}
