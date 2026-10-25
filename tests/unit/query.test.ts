import { expect, test } from 'vitest'
import {
  copyFilters,
  equalQueryValue,
  snapshotFilters,
} from '../../src/core/query.js'

test('query equality preserves false/zero/dates and compares repeated plain values structurally', () => {
  const value = { code: 0 }
  expect(equalQueryValue([value, value], [{ code: 0 }, { code: 0 }])).toBe(true)
  expect(
    equalQueryValue(
      [false, 0, new Date('2026-01-01')],
      [false, 0, new Date('2026-01-01')],
    ),
  ).toBe(true)
  expect(equalQueryValue([], new Array(1))).toBe(false)
  expect(equalQueryValue(false, 0)).toBe(false)
})

test('watch snapshots retain past nested values while local select copies retain business identity', () => {
  const selected = { code: 'chosen' }
  const filters = { status: { operator: 'in' as const, value: [selected] } }
  const local = copyFilters(filters)
  const snapshot = snapshotFilters(filters)
  expect(local.status.value).not.toBe(filters.status.value)
  expect(local.status.value).toEqual([selected])
  expect(Array.isArray(local.status.value) && local.status.value[0]).toBe(
    selected,
  )
  selected.code = 'changed'
  expect(equalQueryValue(snapshot, snapshotFilters(filters))).toBe(false)
})
