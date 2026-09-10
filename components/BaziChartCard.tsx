'use client'

import type { BaziChart, Pillar, WuXing } from '@/types/bazi'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { WUXING_ELEMENTS, WUXING_STYLES } from '@/configs/wuxing'

/** 命盤專有名詞保留漢字；周邊標籤使用目前語系。 */
export default function BaziChartCard({ chart }: { chart: BaziChart }) {
  const t = useTranslations('chart')
  return (
    <Card className="animate-fade-up">
      <CardContent className="p-6 sm:p-8">
        <h2 className="font-display mb-1 text-xl text-foreground">{t('title')}</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          {chart.solarDate}・{chart.lunarDate}・{t('zodiacPrefix')}
          {chart.shengXiao}
        </p>
        <div className="grid grid-cols-4 gap-2 text-center sm:gap-3">
          {chart.pillars.map((pillar) => (
            <PillarCard key={pillar.label} pillar={pillar} />
          ))}
        </div>
        <div className="mt-5 space-y-3">
          <div className="text-sm text-secondary-foreground">
            {t('dayMaster')}:
            <span
              className={`font-display text-base ${WUXING_STYLES[chart.dayMasterWuXing].text}`}
            >
              {chart.dayMaster}
            </span>
            <span className="ml-1 text-muted-foreground">({chart.dayMasterWuXing})</span>
          </div>
          <WuXingDistribution counts={chart.wuXingCount} />
        </div>
        {chart.daYun.length > 0 && (
          <div className="mt-5 border-t border-border/70 pt-4">
            <div className="mb-2 text-sm text-muted-foreground">{t('daYun')}</div>
            <div className="flex flex-wrap gap-2">
              {chart.daYun.map((daYun) => (
                <span
                  key={daYun.startYear}
                  className="rounded-lg border border-border/70 bg-card/70 px-3 py-1 text-sm text-secondary-foreground"
                  title={`${daYun.startYear}${t('startYearSuffix')}`}
                >
                  {t('agePrefix')}
                  {daYun.startAge}
                  {t('ageSuffix')} <span className="font-display">{daYun.ganZhi}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const t = useTranslations('chart')
  const ganStyle = WUXING_STYLES[pillar.ganWuXing]
  const zhiStyle = WUXING_STYLES[pillar.zhiWuXing]
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/80 pb-4 shadow-pillar transition-transform duration-200 hover:-translate-y-0.5">
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, ${ganStyle.color}, ${zhiStyle.color})`,
        }}
      />
      <div className="mt-3 text-xs text-muted-foreground">{pillar.label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{pillar.shiShenGan}</div>
      <div
        className={`font-display mt-1 text-2xl font-semibold sm:text-3xl ${ganStyle.text}`}
      >
        {pillar.gan}
      </div>
      <div className={`font-display text-2xl font-semibold sm:text-3xl ${zhiStyle.text}`}>
        {pillar.zhi}
      </div>
      <div className="mt-2 text-[11px] leading-4 text-muted-foreground">
        {t('hiddenPrefix')}
        {pillar.hideGan.join('・')}
      </div>
    </div>
  )
}

function WuXingDistribution({ counts }: { counts: Record<WuXing, number> }) {
  const t = useTranslations('chart')
  const total = WUXING_ELEMENTS.reduce((sum, element) => sum + counts[element], 0)
  const missing = WUXING_ELEMENTS.filter((element) => counts[element] === 0)
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
        <span>{t('wuxingTitle')}</span>
        <span>
          {missing.map((element) => `${t('lackPrefix')}${element}`).join('、') ||
            t('wuxingAll')}
        </span>
      </div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {WUXING_ELEMENTS.filter((element) => counts[element] > 0).map((element) => (
          <div
            key={element}
            className={WUXING_STYLES[element].bar}
            style={{ flexGrow: counts[element] / total }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex gap-3 text-xs">
        {WUXING_ELEMENTS.map((element) => (
          <span key={element} className="text-muted-foreground">
            <span className={WUXING_STYLES[element].text}>{element}</span>{' '}
            {counts[element]}
          </span>
        ))}
      </div>
    </div>
  )
}
