import { expect, test } from '@playwright/test'

test('production examples are runnable, localized and separate from test fixtures', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await expect(
    page.getByRole('heading', { name: 'Customer directory', exact: true }),
  ).toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page
    .getByRole('combobox', { name: 'Rows per page', exact: true })
    .selectOption('25')
  await expect(page.locator('tbody tr')).toHaveCount(25)
  await expect(
    page.getByRole('region', { name: 'Demo settings', exact: true }),
  ).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Async provider', exact: true })
    .click()
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.getByLabel('Customer · Value', { exact: true }).fill('Ada')
  await expect(page.locator('tbody tr')).toHaveCount(8)
  await page
    .getByRole('button', { name: 'Cells & actions', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Inspect Ada Morgan 1', exact: true })
    .click()
  await expect(
    page.getByText('Inspecting Ada Morgan 1', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'فارسی / RTL', exact: true }).click()
  await expect(page.locator('.sdt-root')).toHaveAttribute('dir', 'rtl')
  await page.getByRole('button', { name: 'تم تیره', exact: true }).click()
  await expect(page.locator('.sdt-root')).toHaveAttribute(
    'data-sdt-theme',
    'dark',
  )
  await page.getByText('View example source', { exact: true }).click()
  await expect(page.locator('.showcase-source>pre')).toContainText(
    'DataTableMessages',
  )
  await page.reload()
  await expect(page.locator('.sdt-root')).toHaveAttribute('dir', 'rtl')
  expect(errors).toEqual([])
})
