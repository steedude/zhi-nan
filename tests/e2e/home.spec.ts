import { expect, test } from '@playwright/test'

test('home page shows the first decision step', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /問\s*命/ })).toBeVisible()
  await expect(page.getByText('你現在最想問的是什麼?')).toBeVisible()
  await expect(page.getByRole('button', { name: '下一步:填寫生辰' })).toBeDisabled()
})
