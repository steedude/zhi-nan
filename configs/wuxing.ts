import type { WuXing } from '@/types/bazi'

export const WUXING_ELEMENTS = [
  '木',
  '火',
  '土',
  '金',
  '水',
] as const satisfies readonly WuXing[]

export const WUXING_STYLES = {
  木: { text: 'text-emerald-600', bar: 'bg-emerald-500', color: '#10b981' },
  火: { text: 'text-red-500', bar: 'bg-red-400', color: '#f87171' },
  土: { text: 'text-amber-600', bar: 'bg-amber-500', color: '#f59e0b' },
  金: { text: 'text-yellow-600', bar: 'bg-yellow-400', color: '#eab308' },
  水: { text: 'text-sky-600', bar: 'bg-sky-500', color: '#0ea5e9' },
} satisfies Record<WuXing, { text: string; bar: string; color: string }>
