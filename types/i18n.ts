import type { zhTW } from '@/locales/zh-TW'

/** 支援的語系 */
export type Locale = 'zh-TW' | 'en'

/**
 * 字典型別以繁中版為準,其他語系必須提供完全相同的鍵,
 * 缺漏會在編譯期報錯(locales/en.ts 以 `satisfies Dictionary` 檢查)。
 */
export type Dictionary = typeof zhTW
