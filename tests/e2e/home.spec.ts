import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-10T04:00:00Z'))
})

async function fillBirthDetails(page: Page) {
  await page
    .getByRole('textbox', { name: '你現在最想問的是什麼?' })
    .fill('我最近卡在工作選擇，想知道下一步方向。')
  await page.getByRole('button', { name: '下一步:填寫生辰' }).click()
  await page.locator('#birth-date').click()
  const calendar = page.getByRole('dialog')
  await calendar.locator('select:has(option[value="1990"])').selectOption('1990')
  await calendar.locator('select:has(option[value="0"])').selectOption('0')
  await calendar.getByRole('button').filter({ hasText: /^15$/ }).click()
  await expect(page.locator('#birth-date')).toContainText('1990-01-15')
  await page.getByRole('combobox', { name: '出生小時' }).click()
  await page.getByRole('option', { name: '09', exact: true }).click()
  await page.getByRole('combobox', { name: '出生分鐘' }).click()
  await page.getByRole('option', { name: '30', exact: true }).click()
}

test('home page shows the first decision step', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /指\s*南/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: '你現在最想問的是什麼?' })).toBeVisible()
  await expect(page.getByRole('button', { name: '下一步:填寫生辰' })).toBeDisabled()
  await page.screenshot({ path: testInfo.outputPath('home-desktop.png'), fullPage: true })
})

test('visitor completes a deterministic reading without calling the AI service', async ({
  page,
}, testInfo) => {
  let requests = 0
  await page.route('**/api/interpret', async (route) => {
    requests++
    expect(route.request().postDataJSON()).toMatchObject({
      year: 1990,
      month: 1,
      day: 15,
      hour: 9,
      minute: 30,
    })
    await route.fulfill({
      status: 200,
      contentType: 'text/plain; charset=utf-8',
      body: '【你的命盤】測試命盤解讀【給你的方向】先整理工作目標，再逐步行動。',
    })
  })
  await page.goto('/')
  await fillBirthDetails(page)
  await page.getByRole('button', { name: '排盤解讀' }).click()
  await expect(
    page.getByRole('heading', { name: '給你的方向', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('先整理工作目標，再逐步行動。')).toBeVisible()
  await expect(page.getByRole('button', { name: '再問一次', exact: true })).toBeEnabled()
  expect(requests).toBe(1)
  await page.screenshot({
    path: testInfo.outputPath('reading-desktop.png'),
    fullPage: true,
  })
  await page.getByRole('button', { name: '再問一次', exact: true }).click()
  await expect(page.getByRole('textbox', { name: '你現在最想問的是什麼?' })).toHaveValue(
    '',
  )
})

test('quota error is visible and the user can restart', async ({ page }) => {
  await page.route('**/api/interpret', (route) =>
    route.fulfill({
      status: 429,
      json: { message: '今日額度已用完，明天再來。' },
    }),
  )
  await page.goto('/')
  await fillBirthDetails(page)
  await page.getByRole('button', { name: '排盤解讀' }).click()
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    '今日額度已用完，明天再來。',
  )
  await expect(page.getByRole('button', { name: '再問一次', exact: true })).toBeEnabled()
})

test('mobile reading fits the viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/api/interpret', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/plain; charset=utf-8',
      body: '【給你的方向】先整理工作目標，再逐步行動。',
    }),
  )
  await page.goto('/')
  await fillBirthDetails(page)
  await page.getByRole('button', { name: '排盤解讀' }).click()
  await expect(page.getByText('先整理工作目標，再逐步行動。')).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('reading-mobile.png'),
    fullPage: true,
  })
})

test('language switch updates the form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Switch language' }).click()
  await expect(
    page.getByRole('heading', { name: 'What weighs on your mind right now?' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next: birth details' })).toBeDisabled()
})
