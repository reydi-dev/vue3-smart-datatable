import { expect, test, type Page } from '@playwright/test'

async function noPageOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
}
async function paletteContrast(page: Page) {
  const ratios = await page.locator('.sdt-root').evaluate((el) => {
    const style = getComputedStyle(el)
    function luminance(hex: string) {
      const raw = hex.trim().replace('#', '')
      const value = raw.length === 3 ? [...raw].map((x) => x + x).join('') : raw
      const rgb = [0, 2, 4]
        .map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
    }
    function ratio(a: string, b: string) {
      const x = luminance(style.getPropertyValue(a)),
        y = luminance(style.getPropertyValue(b))
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
    }
    return [
      ratio('--sdt-text-color', '--sdt-surface'),
      ratio('--sdt-muted-color', '--sdt-tint-color'),
      ratio('--sdt-muted-color', '--sdt-surface'),
      ratio('--sdt-accent', '--sdt-surface'),
      ratio('--sdt-error-color', '--sdt-tint-color'),
    ]
  })
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5)
}

test('mobile server layout keeps state/details on resize and supports keyboard, narrow RTL/dark and disabled reading', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./?fixture=interaction')
  await page
    .getByRole('combobox', { name: 'Data source', exact: true })
    .selectOption('server')
  await expect(page.locator('.sdt-mobile__row')).toHaveCount(10)
  await page
    .getByRole('checkbox', { name: 'Select row 1', exact: true })
    .check()
  const first = page.locator('.sdt-mobile__row').first()
  const disclosure = first.locator('.sdt-mobile__disclosure')
  await disclosure.locator(':scope > summary').focus()
  await page.keyboard.press('Space')
  await expect(disclosure).toHaveAttribute('open', '')
  await expect(page.locator('.demo-feedback')).toHaveText('No row opened')
  await first.getByRole('button', { name: 'Open row 1', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.demo-feedback')).toContainText('Opened')
  await first.getByRole('button', { name: 'View', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.demo-feedback')).toContainText('View:')
  const requests = await page.getByText(/^Server requests:/).textContent()
  await page.setViewportSize({ width: 960, height: 900 })
  await expect(page.locator('table')).toBeVisible()
  await expect(
    page.getByRole('checkbox', { name: 'Select row 1', exact: true }),
  ).toBeChecked()
  await page.setViewportSize({ width: 375, height: 900 })
  await expect(disclosure).toHaveAttribute('open', '')
  await expect(page.getByText(/^Server requests:/)).toHaveText(requests!)
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.getByLabel('Customer · Value', { exact: true }).fill('Avery')
  await expect(page.locator('.sdt-pagination__count')).toHaveText('1–10 of 16')
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(page.locator('.sdt-mobile__row')).toHaveCount(6)
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(page.locator('tbody tr')).toHaveCount(6)
  await expect(page.locator('.sdt-pagination__page')).toHaveText('2 of 2')
  await page.setViewportSize({ width: 375, height: 900 })
  await expect(page.locator('.sdt-pagination__page')).toHaveText('2 of 2')
  await expect(page.getByText('1 selected', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page
    .getByRole('combobox', { name: 'Direction', exact: true })
    .selectOption('rtl')
  await page
    .getByRole('combobox', { name: 'Theme', exact: true })
    .selectOption('dark')
  await paletteContrast(page)
  await noPageOverflow(page)
  await page.getByLabel('Disable table', { exact: true }).check()
  await expect(
    page.getByRole('button', { name: 'Open row 1', exact: true }),
  ).toBeDisabled()
  await page
    .locator('.sdt-mobile__disclosure')
    .first()
    .locator(':scope > summary')
    .focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.sdt-mobile__disclosure').first()).toHaveAttribute(
    'open',
    '',
  )
  await page.setViewportSize({ width: 320, height: 900 })
  await noPageOverflow(page)
  expect(errors).toEqual([])
})

test('RTL/LTR and light/dark stay scoped, keyboard dialog traps focus, long text wraps and screenshots show real layouts', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('./?fixture=interaction')
  await page.evaluate(() => document.body.classList.add('theme--dark'))
  await expect(page.locator('.sdt-root')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  )
  const columns = page.getByRole('button', { name: 'Columns', exact: true })
  await columns.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Columns', exact: true })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Close', exact: true }).focus()
  await page.keyboard.press('Shift+Tab')
  await expect(
    dialog.getByRole('button', { name: 'Apply', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    dialog.getByRole('button', { name: 'Close', exact: true }),
  ).toBeFocused()
  await dialog.getByLabel('Notes', { exact: true }).check()
  await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(columns).toBeFocused()
  await page
    .getByRole('combobox', { name: 'Direction', exact: true })
    .selectOption('rtl')
  await expect(page.locator('.sdt-root')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.demo-controls')).toHaveCSS('direction', 'ltr')
  await paletteContrast(page)
  const nextPath = await page
    .getByRole('button', { name: 'Next page', exact: true })
    .locator('path')
    .getAttribute('d')
  expect(nextPath).toBe('m15 5-7 7 7 7')
  const sort = page.getByRole('button', { name: 'Customer', exact: true })
  await sort.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('th[aria-sort]')).toHaveAttribute(
    'aria-sort',
    'ascending',
  )
  await page.keyboard.press('Space')
  await expect(page.locator('th[aria-sort]')).toHaveAttribute(
    'aria-sort',
    'descending',
  )
  await page.screenshot({
    path: 'test-results/desktop-rtl-light.png',
    fullPage: true,
  })
  await page
    .getByRole('combobox', { name: 'Theme', exact: true })
    .selectOption('dark')
  await paletteContrast(page)
  await expect(page.locator('.sdt-root')).toHaveCSS(
    'background-color',
    'rgb(32, 43, 38)',
  )
  await page.screenshot({
    path: 'test-results/desktop-rtl-dark.png',
    fullPage: true,
  })
  await page.setViewportSize({ width: 375, height: 900 })
  const first = page.locator('.sdt-mobile__row').first()
  await first.locator('.sdt-mobile__disclosure > summary').click()
  await expect(first.locator('dd').last()).toContainText('longer customer note')
  await noPageOverflow(page)
  await page.screenshot({
    path: 'test-results/mobile-rtl-dark.png',
    fullPage: true,
  })
  await first.screenshot({ path: 'test-results/mobile-rtl-dark-card.png' })
  await page
    .getByRole('combobox', { name: 'Direction', exact: true })
    .selectOption('ltr')
  await page
    .getByRole('combobox', { name: 'Theme', exact: true })
    .selectOption('light')
  await paletteContrast(page)
  await noPageOverflow(page)
  await page.screenshot({
    path: 'test-results/mobile-ltr-light.png',
    fullPage: true,
  })
  await first.screenshot({ path: 'test-results/mobile-ltr-light-card.png' })
  // Add long unbroken plain text to the real visible DOM for wrapping inspection.
  await first.locator('.demo-customer strong').evaluate((el) => {
    el.textContent = 'نام مشتری با متن بلند — ' + 'LongUnbrokenValue'.repeat(12)
  })
  await noPageOverflow(page)
  expect(errors).toEqual([])
})
