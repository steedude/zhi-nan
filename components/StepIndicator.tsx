'use client'

import { useTranslations } from 'next-intl'

/** 三步驟進度指示:問題 → 生辰 → 解讀 */

export default function StepIndicator({ current }: { current: 0 | 1 | 2 }) {
  const t = useTranslations()
  const steps = t.raw('steps') as string[]

  return (
    <ol className="mb-8 flex items-center justify-center gap-0 text-xs">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center">
          {i > 0 && (
            <span
              className={`mx-2 h-px w-8 sm:w-12 ${
                i <= current ? 'bg-teal-600' : 'bg-stone-300'
              }`}
            />
          )}
          <span className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                i < current
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : i === current
                    ? 'border-teal-600 text-teal-700'
                    : 'border-stone-300 text-stone-400'
              }`}
            >
              {i + 1}
            </span>
            <span className={i === current ? 'text-teal-700' : 'text-stone-400'}>
              {label}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}
