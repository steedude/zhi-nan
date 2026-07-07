'use client'

import type { QuestionCategory } from '@/configs/questions'
import { useTranslations } from 'next-intl'
import { QUESTION_CATEGORIES } from '@/configs/questions'

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
    <section className="card animate-fade-up p-6 sm:p-8">
      <h2 className="font-display mb-1 text-xl text-stone-800">{t('title')}</h2>
      <p className="mb-5 text-sm text-stone-500">{t('desc')}</p>

      {/* 問題類別 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {QUESTION_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-200 ${
              category === c
                ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-[0_2px_10px_rgba(13,148,136,.12)]'
                : 'border-stone-300 text-stone-500 hover:border-stone-400 hover:text-stone-700'
            }`}
          >
            {t(`categories.${c}`)}
          </button>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        maxLength={500}
        rows={4}
        placeholder={t(`placeholders.${category}`)}
        className="input-field resize-none p-4"
      />
      <div className="mt-1 text-right text-xs text-stone-400">
        {question.length}
        /500
      </div>

      <button
        onClick={onNext}
        disabled={!question.trim()}
        className="btn-primary mt-4 w-full py-3"
      >
        {t('next')}
      </button>
    </section>
  )
}
