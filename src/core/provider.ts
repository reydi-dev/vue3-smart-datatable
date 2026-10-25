/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
import type {
  DataProviderRequest,
  DataRow,
  NormalizedData,
  ResponseNormalizer,
} from '../types/index.js'

/** Validate the transport shape. Business Row fields belong to the consumer's normalizer. */
export function defaultResponseNormalizer<Row extends object = DataRow>(
  raw: unknown,
): NormalizedData<Row> {
  let items: unknown
  let total: unknown
  let meta: unknown
  if (Array.isArray(raw)) {
    items = raw
    total = raw.length
  } else if (
    raw !== null &&
    typeof raw === 'object' &&
    'items' in raw &&
    'total' in raw
  ) {
    items = raw.items
    total = raw.total
    meta = 'meta' in raw ? raw.meta : undefined
  }
  if (
    !Array.isArray(items) ||
    !Array.from(items).every(
      (row: unknown) =>
        row !== null && typeof row === 'object' && !Array.isArray(row),
    ) ||
    typeof total !== 'number' ||
    !Number.isInteger(total) ||
    total < items.length
  ) {
    throw new TypeError(
      'Expected { items: object[], total: nonnegative finite integer >= items.length, meta?: unknown }',
    )
  }
  // The single trusted boundary assertion follows container validation. TypeScript
  // cannot validate arbitrary consumer business fields; see docs/api.md.
  return { items: [...items] as Row[], total, meta }
}

export function normalizeProviderResponse<Row extends object = DataRow>(
  raw: unknown,
  request: DataProviderRequest,
  normalizer?: ResponseNormalizer<Row>,
): NormalizedData<Row> {
  return defaultResponseNormalizer<Row>(
    normalizer ? normalizer(raw, request) : raw,
  )
}
