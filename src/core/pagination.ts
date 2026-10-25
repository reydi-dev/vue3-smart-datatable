/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
export function normalizePage(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1
    ? value
    : 1
}

export function normalizePageSize(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1
    ? value
    : 25
}

/** Parse an explicitly submitted one-based page, including Persian and Arabic-Indic digits. */
export function parsePageInput(
  value: string,
  pageCount: number,
): number | null {
  const normalized = value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
  if (!/^\d+$/.test(normalized)) return null
  const page = Number(normalized)
  return Number.isSafeInteger(page) && page >= 1 && page <= pageCount
    ? page
    : null
}
