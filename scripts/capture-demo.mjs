import { mkdir } from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'
const url =
  process.env.DEMO_URL || 'http://127.0.0.1:4185/vue3-smart-datatable/'
await mkdir('docs/media', { recursive: true })
await mkdir('test-results/demo-capture', { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
})
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
  })
  await page.goto(url)
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page.screenshot({ path: 'docs/media/desktop.png', fullPage: true })
  const box = await page.locator('.sdt-root').boundingBox()
  if (!box) throw new Error('Demo table not visible')
  async function frame(index) {
    await page.screenshot({
      path: `test-results/demo-capture/${index}.png`,
      clip: box,
    })
  }
  await frame(0)
  await page
    .getByRole('checkbox', { name: 'Select row 1', exact: true })
    .check()
  await frame(1)
  await page.getByRole('button', { name: 'Customer', exact: true }).click()
  await frame(2)
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.getByLabel('Customer · Value', { exact: true }).fill('Ada')
  await expect(page.locator('tbody tr')).toHaveCount(8)
  await frame(3)
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await frame(4)
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await frame(5)
  await page.setViewportSize({ width: 390, height: 920 })
  await page.goto(url + '#rtl')
  await page.getByRole('button', { name: 'تم تیره', exact: true }).click()
  await page.locator('.sdt-mobile__disclosure > summary').first().click()
  await page.screenshot({ path: 'docs/media/mobile.png' })
  console.log(
    'Captured real production demo screenshots and six interaction frames.',
  )
} finally {
  await browser.close()
}
