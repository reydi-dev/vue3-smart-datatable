import { expect, test } from '@playwright/test'

test('local table: selection, sorting, filter reset, column dialog focus, keyboard rows and CSV', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page
    .getByRole('checkbox', { name: 'Select row 1', exact: true })
    .check()
  await expect(page.getByText('1 selected', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(page.locator('.sdt-pagination__page')).toHaveText('2 of 7')
  await expect(page.getByText('1 selected', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Amount', exact: true }).click()
  await expect(page.locator('th[aria-sort]')).toHaveAttribute(
    'aria-sort',
    'ascending',
  )
  await expect(page.locator('.sdt-pagination__page')).toHaveText('1 of 7')
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page
    .getByLabel('Customer · Value', { exact: true })
    .fill('no-such-customer')
  await expect(
    page.getByText('No matching items', { exact: true }),
  ).toBeVisible()
  await page
    .locator('.sdt-state')
    .getByRole('button', { name: 'Clear filters', exact: true })
    .click()
  await expect(page.locator('tbody tr')).toHaveCount(10)
  const columns = page.getByRole('button', { name: 'Columns', exact: true })
  await columns.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByLabel('Email', { exact: true }).uncheck()
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(columns).toBeFocused()
  await expect(
    page.getByRole('columnheader', { name: 'Email', exact: true }),
  ).toHaveCount(0)
  await columns.click()
  await page.keyboard.press('Escape')
  await expect(columns).toBeFocused()
  const secondRow = page.locator('tbody tr').nth(1)
  await secondRow.locator('summary').click()
  await secondRow.getByRole('button', { name: 'Archive', exact: true }).click()
  await expect(page.locator('.demo-feedback')).toContainText('Archive:')
  await secondRow.locator('summary').click()
  await page.locator('tbody tr').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.demo-feedback')).toContainText('Opened')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  await page
    .getByRole('button', { name: 'CSV — Current page', exact: true })
    .click()
  expect((await download).suggestedFilename()).toBe('export.csv')
  await expect(page.locator('.sdt-root')).toHaveAttribute('aria-busy', 'false')
  // Verify actual CSS from the library and no unexpected runtime failures.
  expect(
    await page
      .locator('.sdt-root')
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue('--sdt-accent').trim(),
      ),
  ).toBe('#087c63')
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.screenshot({
    path: 'test-results/desktop-local.png',
    fullPage: true,
  })
  expect(errors).toEqual([])
})

test('server table: pending navigation, failure/retry, debounced filter, page size and disabled controls', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await page
    .getByRole('combobox', { name: 'Data source', exact: true })
    .selectOption('server')
  await expect(page.getByText('Loading data…', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Next page', exact: true }),
  ).toBeDisabled()
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page.getByLabel('Fail next server request', { exact: true }).check()
  await page.getByRole('button', { name: 'Refresh data', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Unable to load data')
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.getByLabel('Customer · Value', { exact: true }).fill('Avery')
  await expect(page.locator('.sdt-pagination__count')).toHaveText('1–10 of 16')
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page
    .getByRole('combobox', { name: 'Rows per page', exact: true })
    .selectOption('25')
  await expect(page.locator('tbody tr')).toHaveCount(16)
  await page.getByLabel('Disable table', { exact: true }).check()
  await expect(
    page.getByRole('button', { name: 'Filters', exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole('checkbox', { name: 'Select row 1', exact: true }),
  ).toBeDisabled()
  expect(errors).toEqual([])
})
