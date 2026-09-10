'use client'

import type { Gender } from '@/types/bazi'
import type { Locale as AppLocale } from '@/types/i18n'
import type { Locale as DateFnsLocale } from 'date-fns'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { enUS, zhTW } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import StepCard from '@/components/StepCard'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatDateInput, parseDateInput } from '@/utils/date'

const DATE_PICKER_LOCALES = {
  'zh-TW': zhTW,
  en: enUS,
} satisfies Record<AppLocale, DateFnsLocale>

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
  const locale = useLocale() as AppLocale
  const [dateOpen, setDateOpen] = useState(false)
  const selectedDate = parseDateInput(date)
  const [hour = '12', minute = '00'] = time.split(':')

  function updateTime(nextHour: string, nextMinute: string) {
    onTimeChange(`${nextHour}:${nextMinute}`)
  }

  return (
    <StepCard title={t('title')} description={t('desc')} className="space-y-4">
      <div>
        <Label htmlFor="birth-date" className="mb-1 block text-secondary-foreground">
          {t('dateLabel')}
        </Label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              id="birth-date"
              type="button"
              variant="outline"
              className="h-11 w-full justify-start rounded-xl border-input bg-card/90 px-3 text-left font-normal text-foreground"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {selectedDate ? (
                formatDateInput(selectedDate)
              ) : (
                <span className="text-muted-foreground">YYYY-MM-DD</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[20rem] max-w-[calc(100vw-2rem)] p-3"
            align="start"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              defaultMonth={selectedDate}
              locale={DATE_PICKER_LOCALES[locale]}
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
              disabled={{ before: new Date(1900, 0, 1), after: new Date(2100, 11, 31) }}
              onSelect={(nextDate) => {
                if (nextDate) {
                  onDateChange(formatDateInput(nextDate))
                  setDateOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label
          id="birth-time-label"
          htmlFor="birth-hour"
          className="mb-1 block text-secondary-foreground"
        >
          {t('timeLabel')}
        </Label>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Select value={hour} onValueChange={(nextHour) => updateTime(nextHour, minute)}>
            <SelectTrigger
              id="birth-hour"
              aria-label={t('hourLabel')}
              className="bg-card/90"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => {
                const value = String(i).padStart(2, '0')
                return (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select
            value={minute}
            onValueChange={(nextMinute) => updateTime(hour, nextMinute)}
          >
            <SelectTrigger
              id="birth-minute"
              aria-label={t('minuteLabel')}
              className="bg-card/90"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }, (_, i) => {
                const value = String(i).padStart(2, '0')
                return (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1 block text-secondary-foreground">{t('genderLabel')}</Label>
        <ToggleGroup
          type="single"
          value={gender}
          onValueChange={(value) => {
            if (value === 'female' || value === 'male') onGenderChange(value)
          }}
          className="grid grid-cols-2 gap-3"
        >
          {(['female', 'male'] as const).map((g) => (
            <ToggleGroupItem key={g} value={g} size="lg">
              {g === 'female' ? t('female') : t('male')}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

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
    </StepCard>
  )
}
