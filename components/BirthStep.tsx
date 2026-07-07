'use client'

import type { Gender } from '@/types/bazi'
import { useTranslations } from 'next-intl'

/** 第二步:輸入陽曆生辰與性別 */

interface Props {
  date: string
  time: string
  gender: Gender
  error: string
  loading: boolean
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  onGenderChange: (value: Gender) => void
  onBack: () => void
  onSubmit: () => void
}

export default function BirthStep({
  date,
  time,
  gender,
  error,
  loading,
  onDateChange,
  onTimeChange,
  onGenderChange,
  onBack,
  onSubmit,
}: Props) {
  const t = useTranslations('birth')

  return (
    <section className="card animate-fade-up p-6 sm:p-8">
      <h2 className="font-display mb-1 text-xl text-stone-800">{t('title')}</h2>
      <p className="mb-5 text-sm text-stone-500">{t('desc')}</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="birth-date" className="mb-1 block text-sm text-stone-600">
            {t('dateLabel')}
          </label>
          <input
            id="birth-date"
            type="date"
            value={date}
            min="1900-01-01"
            max="2100-12-31"
            onChange={(e) => onDateChange(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="birth-time" className="mb-1 block text-sm text-stone-600">
            {t('timeLabel')}
          </label>
          <input
            id="birth-time"
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <span className="mb-1 block text-sm text-stone-600">{t('genderLabel')}</span>
          <div className="grid grid-cols-2 gap-3">
            {(['female', 'male'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onGenderChange(g)}
                className={`rounded-xl border py-3 transition-all duration-200 ${
                  gender === g
                    ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-[0_2px_10px_rgba(13,148,136,.12)]'
                    : 'border-stone-300 text-stone-500 hover:border-stone-400 hover:text-stone-700'
                }`}
              >
                {g === 'female' ? t('female') : t('male')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button onClick={onBack} disabled={loading} className="btn-ghost px-5 py-3">
          {t('back')}
        </button>
        <button onClick={onSubmit} disabled={loading} className="btn-primary flex-1 py-3">
          {loading ? t('submitting') : t('submit')}
        </button>
      </div>
    </section>
  )
}
