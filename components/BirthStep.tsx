'use client'

import type { Gender } from '@/types/bazi'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <Card className="animate-fade-up">
      <CardHeader className="p-6 pb-5 sm:p-8 sm:pb-5">
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('desc')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-6 pt-0 sm:p-8 sm:pt-0">
        <div>
          <Label htmlFor="birth-date" className="mb-1 block text-stone-600">
            {t('dateLabel')}
          </Label>
          <Input
            id="birth-date"
            type="date"
            value={date}
            min="1900-01-01"
            max="2100-12-31"
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="birth-time" className="mb-1 block text-stone-600">
            {t('timeLabel')}
          </Label>
          <Input
            id="birth-time"
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-1 block text-stone-600">{t('genderLabel')}</Label>
          <div className="grid grid-cols-2 gap-3">
            {(['female', 'male'] as const).map((g) => (
              <Button
                key={g}
                type="button"
                variant={gender === g ? 'secondary' : 'outline'}
                onClick={() => onGenderChange(g)}
                className={`h-12 rounded-xl ${
                  gender === g
                    ? 'border border-teal-600 bg-teal-50 text-teal-800 shadow-[0_2px_10px_rgba(13,148,136,.12)] hover:bg-teal-50'
                    : 'border-stone-300 text-stone-500 hover:border-stone-400 hover:text-stone-700'
                }`}
              >
                {g === 'female' ? t('female') : t('male')}
              </Button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" onClick={onBack} disabled={loading} variant="outline">
            {t('back')}
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            variant="brand"
            className="flex-1"
          >
            {loading ? t('submitting') : t('submit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
