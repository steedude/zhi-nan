import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { expect, it } from 'vitest'
import InterpretationCard from '@/components/InterpretationCard'
import { zhTW } from '@/locales/zh-TW'

it('keeps received text readable when the stream fails', () => {
  render(
    <NextIntlClientProvider locale="zh-TW" messages={zhTW} timeZone="Asia/Taipei">
      <InterpretationCard
        text="【方向】先整理工作目標"
        streaming={false}
        error="連線中斷"
      />
    </NextIntlClientProvider>,
  )
  expect(screen.getByRole('alert')).toHaveTextContent('連線中斷')
  expect(screen.getByRole('heading', { name: '方向' })).toBeVisible()
  expect(screen.getByText('先整理工作目標')).toBeVisible()
  expect(screen.queryByText(zhTW.interpretation.generating)).not.toBeInTheDocument()
})
