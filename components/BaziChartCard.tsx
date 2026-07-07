'use client'

import type { BaziChart } from '@/types/bazi'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'

/**
 * 命盤卡片:四柱、藏干、五行分布、大運
 *
 * 干支、十神為專有名詞,各語系皆以漢字呈現;周邊標籤走 i18n。
 */

/** 五行配色(文字,淺底適用的深色版) */
export const WUXING_TEXT: Record<string, string> = {
  木: 'text-emerald-600',
  火: 'text-red-500',
  土: 'text-amber-600',
  金: 'text-yellow-600',
  水: 'text-sky-600',
}

/** 五行配色(長條) */
const WUXING_BAR: Record<string, string> = {
  木: 'bg-emerald-500',
  火: 'bg-red-400',
  土: 'bg-amber-500',
  金: 'bg-yellow-400',
  水: 'bg-sky-500',
}

/** 五行配色(hex,用於漸層飾條) */
const WUXING_HEX: Record<string, string> = {
  木: '#10b981',
  火: '#f87171',
  土: '#f59e0b',
  金: '#eab308',
  水: '#0ea5e9',
}

/** 四干四支 */
const TOTAL_WUXING = 8

export default function BaziChartCard({ chart }: { chart: BaziChart }) {
  const t = useTranslations('chart')

  return (
    <Card className="animate-fade-up">
      <CardContent className="p-6 sm:p-8">
        <h2 className="font-display mb-1 text-xl text-stone-800">{t('title')}</h2>
        <p className="mb-5 text-sm text-stone-500">
          {chart.solarDate}・{chart.lunarDate}・{t('zodiacPrefix')}
          {chart.shengXiao}
        </p>

        {/* 四柱:頂部飾條為天干→地支的五行漸層 */}
        <div className="grid grid-cols-4 gap-2 text-center sm:gap-3">
          {chart.pillars.map((p) => (
            <div
              key={p.label}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white/80 pb-4 shadow-[0_2px_10px_rgba(68,60,48,.05)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div
                className="h-[3px] w-full"
                style={{
                  background: `linear-gradient(90deg, ${WUXING_HEX[p.ganWuXing]}, ${WUXING_HEX[p.zhiWuXing]})`,
                }}
              />
              <div className="mt-3 text-xs text-stone-500">{p.label}</div>
              <div className="mt-1 text-[11px] text-stone-400">{p.shiShenGan}</div>
              <div
                className={`font-display mt-1 text-2xl font-semibold sm:text-3xl ${WUXING_TEXT[p.ganWuXing]}`}
              >
                {p.gan}
              </div>
              <div
                className={`font-display text-2xl font-semibold sm:text-3xl ${WUXING_TEXT[p.zhiWuXing]}`}
              >
                {p.zhi}
              </div>
              <div className="mt-2 text-[11px] leading-4 text-stone-400">
                {t('hiddenPrefix')}
                {p.hideGan.join('・')}
              </div>
            </div>
          ))}
        </div>

        {/* 日主與五行分布 */}
        <div className="mt-5 space-y-3">
          <div className="text-sm text-stone-600">
            {t('dayMaster')}:
            <span
              className={`font-display text-base ${WUXING_TEXT[chart.dayMasterWuXing]}`}
            >
              {chart.dayMaster}
            </span>
            <span className="ml-1 text-stone-500">({chart.dayMasterWuXing})</span>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-xs text-stone-500">
              <span>{t('wuxingTitle')}</span>
              <span>
                {Object.entries(chart.wuXingCount)
                  .filter(([, v]) => v === 0)
                  .map(([k]) => `${t('lackPrefix')}${k}`)
                  .join('、') || t('wuxingAll')}
              </span>
            </div>
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
              {Object.entries(chart.wuXingCount).map(([element, count]) =>
                count > 0 ? (
                  <div
                    key={element}
                    className={WUXING_BAR[element]}
                    style={{ width: `${(count / TOTAL_WUXING) * 100}%` }}
                    title={`${element} ${count}`}
                  />
                ) : null,
              )}
            </div>
            <div className="mt-1.5 flex gap-3 text-xs">
              {Object.entries(chart.wuXingCount).map(([element, count]) => (
                <span key={element} className="text-stone-500">
                  <span className={WUXING_TEXT[element]}>{element}</span> {count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 大運 */}
        {chart.daYun.length > 0 && (
          <div className="mt-5 border-t border-stone-200 pt-4">
            <div className="mb-2 text-sm text-stone-500">{t('daYun')}</div>
            <div className="flex flex-wrap gap-2">
              {chart.daYun.map((d) => (
                <span
                  key={d.startYear}
                  className="rounded-lg border border-stone-200 bg-white/70 px-3 py-1 text-sm text-stone-600"
                  title={`${d.startYear}${t('startYearSuffix')}`}
                >
                  {t('agePrefix')}
                  {d.startAge}
                  {t('ageSuffix')} <span className="font-display">{d.ganZhi}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
