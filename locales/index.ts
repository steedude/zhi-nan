import type { Dictionary, Locale } from '@/types/i18n'
import { en } from './en'
import { zhTW } from './zh-TW'

export const dictionaries: Record<Locale, Dictionary> = {
  'zh-TW': zhTW,
  en,
}

export const DEFAULT_LOCALE: Locale = 'zh-TW'

export function isLocale(value: unknown): value is Locale {
  return value === 'zh-TW' || value === 'en'
}
