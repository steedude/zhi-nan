import { describe, expect, it } from 'vitest'
import { computeBazi } from '@/lib/bazi'

describe('computeBazi', () => {
  it('returns a deterministic chart shape for valid birth data', () => {
    const chart = computeBazi({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      gender: 'female',
    })

    expect(chart.solarDate).toBe('1990-01-01 12:00')
    expect(chart.pillars).toHaveLength(4)
    expect(chart.dayMaster).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/)
    expect(Object.keys(chart.wuXingCount)).toEqual(['木', '火', '土', '金', '水'])
  })
})
