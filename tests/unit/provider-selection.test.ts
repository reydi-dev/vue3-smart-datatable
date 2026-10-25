/** Behavioral cases adapted from vue2-smart-datatable v0.3.1 and extended for
 * the accepted Vue 3 contract. MIT, copyright 2026 Mohammad Reza Dehghani. */
import { expect, test } from 'vitest'
import {
  defaultResponseNormalizer,
  normalizeProviderResponse,
} from '../../src/core/provider.js'
import {
  normalizeSelection,
  toggleKey,
  togglePageKeys,
} from '../../src/core/selection.js'
import type { DataProviderRequest } from '../../src/types/index.js'
const request: DataProviderRequest = {
  page: 1,
  itemsPerPage: 25,
  sort: null,
  filters: {},
  reason: 'initial',
}

test('normalizes canonical and array responses without owning business field validation', () => {
  const input = Object.freeze([Object.freeze({ code: 'x' })])
  const result = defaultResponseNormalizer(input)
  expect(result).toMatchObject({ items: input, total: 1 })
  expect(result.items).not.toBe(input)
  expect(
    defaultResponseNormalizer({ items: [], total: 4, meta: { cursor: 'x' } })
      .meta,
  ).toEqual({ cursor: 'x' })
  expect(
    normalizeProviderResponse({ data: input, count: 3 }, request, () => ({
      items: input,
      total: 3,
    })),
  ).toMatchObject({ items: input, total: 3 })
})

test('rejects malformed containers, invalid totals, primitives, sparse rows and dishonest normalizers', () => {
  for (const raw of [
    null,
    {},
    { items: [] },
    [1, 2],
    [null],
    [[]],
    new Array(2),
    { items: [{}], total: 0 },
  ])
    expect(() => defaultResponseNormalizer(raw)).toThrow(TypeError)
  for (const total of [-1, 1.5, NaN, Infinity, '1'])
    expect(() => defaultResponseNormalizer({ items: [], total })).toThrow(
      TypeError,
    )
  expect(() =>
    normalizeProviderResponse({}, request, () => ({ items: [], total: -1 })),
  ).toThrow(TypeError)
})

test('deduplicates selection, retains key types and changes only the requested page', () => {
  const keys = Object.freeze([9, 0, '0', 9])
  expect(normalizeSelection(keys)).toEqual([9, 0, '0'])
  expect(toggleKey(keys, 0)).toEqual([9, '0'])
  expect(toggleKey(keys, 2, false)).toEqual([9, 0, '0'])
  expect(togglePageKeys(keys, [1, 2], true)).toEqual([9, 0, '0', 1, 2])
  expect(togglePageKeys([9, 0, '0', 1, 2], [1, 2], false)).toEqual([9, 0, '0'])
  expect(() => normalizeSelection([NaN])).toThrow(TypeError)
})
