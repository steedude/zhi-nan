/**
 * 八字領域型別
 *
 * 所有與命盤相關的資料結構統一定義於此,
 * 供 lib/(計算)、components/(顯示)、app/api/(傳輸)共用。
 */

export type Gender = 'male' | 'female'

export interface Pillar {
  /** 年柱 / 月柱 / 日柱 / 時柱 */
  label: string
  gan: string
  zhi: string
  ganWuXing: string
  zhiWuXing: string
  /** 地支藏干 */
  hideGan: string[]
  /** 天干十神(日柱為「日主」) */
  shiShenGan: string
  /** 藏干十神,與 hideGan 一一對應 */
  shiShenZhi: string[]
}

export interface DaYun {
  startAge: number
  startYear: number
  ganZhi: string
}

export interface BaziChart {
  solarDate: string
  lunarDate: string
  shengXiao: string
  pillars: Pillar[]
  dayMaster: string
  dayMasterWuXing: string
  /** 八字(四干四支)五行分布,鍵為 木火土金水 */
  wuXingCount: Record<string, number>
  /** 大運前六步 */
  daYun: DaYun[]
}

export interface BirthInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender
}
