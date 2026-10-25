/** Behavioral cases adapted from vue2-smart-datatable v0.3.1 and extended for
 * the accepted Vue 3 contract. MIT, copyright 2026 Mohammad Reza Dehghani. */
import { expect, test } from 'vitest'
import {
  applyFilters,
  matchesFilter,
  withoutEmptyFilters,
} from '../../src/core/filters.js'
import type { FilterState } from '../../src/types/index.js'

test('retains reference text, numeric, date and membership operators', () => {
  for (const [operator, value] of [
    ['contains', 'LP'],
    ['startsWith', 'al'],
    ['endsWith', 'HA'],
  ] as const)
    expect(matchesFilter('Alpha', { operator, value })).toBe(true)
  for (const [operator, value] of [
    ['eq', 5],
    ['neq', 4],
    ['gt', 4],
    ['gte', 5],
    ['lt', 6],
    ['lte', 5],
  ] as const)
    expect(matchesFilter(5, { operator, value }, 'number')).toBe(true)
  expect(
    matchesFilter(
      '2026-02-01',
      { operator: 'gt', value: '2026-01-01' },
      'date',
    ),
  ).toBe(true)
  expect(
    matchesFilter('bad date', { operator: 'gt', value: '2026-01-01' }, 'date'),
  ).toBe(false)
  expect(
    matchesFilter(false, { operator: 'in', value: [false, 0] }, 'select'),
  ).toBe(true)
  expect(matchesFilter('0', { operator: 'in', value: [0] }, 'select')).toBe(
    false,
  )
})

test('does not confuse missing numeric data with zero or boolean false', () => {
  for (const missing of [null, undefined, '', NaN])
    expect(matchesFilter(missing, { operator: 'eq', value: 0 }, 'number')).toBe(
      false,
    )
  expect(matchesFilter(0, { operator: 'eq', value: 0 }, 'number')).toBe(true)
  expect(matchesFilter(false, { operator: 'eq', value: false }, 'select')).toBe(
    true,
  )
  expect(matchesFilter(-0, { operator: 'eq', value: 0 }, 'number')).toBe(true)
})

test('retains incomplete range clauses but keeps them inactive locally, as in the reference', () => {
  const partial: FilterState = { amount: { operator: 'between', from: 0 } }
  expect(withoutEmptyFilters(partial)).toEqual(partial)
  expect(matchesFilter(20, partial.amount, 'number')).toBe(true)
  expect(
    matchesFilter(0, { operator: 'between', from: 0, to: 5 }, 'number'),
  ).toBe(true)
  expect(
    matchesFilter(6, { operator: 'between', from: 0, to: 5 }, 'number'),
  ).toBe(false)
  expect(
    matchesFilter(null, { operator: 'between', from: 0, to: 5 }, 'number'),
  ).toBe(false)
})

test('cleans only empty clauses, copies clause containers, and ignores unknown local column keys', () => {
  const filters: FilterState = Object.freeze({
    zero: Object.freeze({ operator: 'eq', value: 0 }),
    no: Object.freeze({ operator: 'eq', value: false }),
    empty: { operator: 'contains', value: '' },
    emptyList: { operator: 'in', value: [] },
  })
  const clean = withoutEmptyFilters(filters)
  expect(Object.keys(clean)).toEqual(['zero', 'no'])
  expect(clean.zero).not.toBe(filters.zero)
  const rows = [{ user: { name: 'Alice' } }, { user: { name: 'Bob' } }]
  expect(
    applyFilters(rows, [{ key: 'name', label: 'Name', field: 'user.name' }], {
      name: { operator: 'contains', value: 'ali' },
      backendOnly: { operator: 'eq', value: 1 },
    }),
  ).toEqual([rows[0]])
})
