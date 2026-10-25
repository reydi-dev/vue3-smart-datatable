/** Behavioral cases adapted from vue2-smart-datatable v0.3.1 and extended for
 * the accepted Vue 3 contract. MIT, copyright 2026 Mohammad Reza Dehghani. */
import { expect, test } from 'vitest'
import {
  formatColumnValue,
  getPathValue,
  normalizeColumns,
  resolveColumnValue,
  resolveRowKey,
  resolveVisibleColumns,
  validateRowKeys,
} from '../../src/core/columns.js'
import { processLocalData, stableSort } from '../../src/core/local-data.js'
import {
  normalizePage,
  normalizePageSize,
  parsePageInput,
} from '../../src/core/pagination.js'
import type { DataTableColumn } from '../../src/types/index.js'

interface Row {
  id: number
  name: string
  score: number | null | undefined
}
const columns: readonly DataTableColumn<Row>[] = Object.freeze([
  Object.freeze({ key: 'name', label: 'Name' }),
  Object.freeze({ key: 'score', label: 'Score', type: 'number' as const }),
])

test('filters, stably sorts, and pages frozen inputs with the filtered total', () => {
  const rows = Object.freeze(
    [
      { id: 3, name: 'A', score: 3 },
      { id: 1, name: 'A', score: 1 },
      { id: 2, name: 'B', score: 2 },
    ].map((row) => Object.freeze(row)),
  )
  const filters = Object.freeze({
    name: Object.freeze({ operator: 'eq' as const, value: 'A' }),
  })
  expect(
    processLocalData(
      rows,
      columns,
      filters,
      { columnKey: 'score', direction: 'asc' },
      2,
      1,
    ),
  ).toEqual({ items: [rows[0]], total: 2 })
  expect(rows.map((row) => row.id)).toEqual([3, 1, 2])
  expect(processLocalData(rows, columns, {}, null, 10, 25)).toEqual({
    items: [],
    total: 3,
  })
  expect(processLocalData([], columns, {}, null, 1, 25)).toEqual({
    items: [],
    total: 0,
  })
})

test('keeps nullish/invalid sort values last and equal values stable in both directions', () => {
  const rows = [
    { id: 1, name: 'A', score: null },
    { id: 2, name: 'B', score: undefined },
    { id: 3, name: 'C', score: 2 },
    { id: 4, name: 'D', score: 2 },
    { id: 5, name: 'E', score: 0 },
  ]
  expect(
    stableSort(rows, columns, { columnKey: 'score', direction: 'asc' }).map(
      (r) => r.id,
    ),
  ).toEqual([5, 3, 4, 1, 2])
  expect(
    stableSort(rows, columns, { columnKey: 'score', direction: 'desc' }).map(
      (r) => r.id,
    ),
  ).toEqual([3, 4, 5, 1, 2])
  expect(
    stableSort(rows, columns, { columnKey: 'missing', direction: 'asc' }),
  ).toEqual(rows)
  const dates = [
    { date: 'bad' },
    { date: new Date('2026-01-01') },
    { date: '2025-01-01' },
  ]
  expect(
    stableSort(dates, [{ key: 'date', label: 'Date', type: 'date' }], {
      columnKey: 'date',
      direction: 'desc',
    }),
  ).toEqual([dates[1], dates[2], dates[0]])
})

test('normalizes columns without mutation and treats explicit empty visibility independently of defaults', () => {
  const schema = Object.freeze([
    Object.freeze({
      key: 'id',
      label: 'ID',
      hideable: false,
      hiddenByDefault: true,
    }),
    Object.freeze({ key: 'name', label: 'Name' }),
    Object.freeze({ key: 'hidden', label: 'Hidden', hiddenByDefault: true }),
  ])
  expect(normalizeColumns(schema)[1]).toMatchObject({
    type: 'text',
    align: 'start',
    hideable: true,
  })
  expect(resolveVisibleColumns(schema)).toEqual(['id', 'name'])
  expect(resolveVisibleColumns(schema, [])).toEqual(['id'])
  expect(
    resolveVisibleColumns(schema, ['hidden', 'missing', 'name', 'name']),
  ).toEqual(['id', 'name', 'hidden'])
  for (const bad of [
    [{ key: '', label: 'Empty' }],
    [
      { key: 'x', label: 'A' },
      { key: 'x', label: 'B' },
    ],
  ])
    expect(() => normalizeColumns(bad)).toThrow()
})

test('preserves zero/false and resolves typed getters, nested paths and formatter/export boundaries', () => {
  const row = { id: 0, nested: { enabled: false, code: '001' } }
  expect(getPathValue(row, 'nested.enabled')).toBe(false)
  expect(getPathValue(row, 'absent.path')).toBeUndefined()
  expect(
    resolveColumnValue(
      { key: 'code', label: 'Code', field: (r: typeof row) => r.nested.code },
      row,
    ),
  ).toBe('001')
  expect(
    formatColumnValue({ key: 'id', label: 'ID', type: 'number' }, row),
  ).toBe('0')
  expect(
    formatColumnValue(
      { key: 'enabled', label: 'Enabled', field: 'nested.enabled' },
      row,
    ),
  ).toBe(false)
  expect(
    formatColumnValue(
      { key: 'id', label: 'ID', formatter: (_v, r) => `#${r.id}` },
      row,
    ),
  ).toBe('#0')
  expect(
    formatColumnValue(
      {
        key: 'id',
        label: 'ID',
        type: 'select',
        options: [{ value: 0, label: 'Zero' }],
      },
      row,
    ),
  ).toBe('Zero')
  expect(formatColumnValue({ key: 'missing', label: 'Missing' }, row)).toBe('')
  expect(
    formatColumnValue(
      { key: 'date', label: 'Date', type: 'date' },
      { date: 'not a date' },
    ),
  ).toBe('')
})

test('validates displayed row identities without coercing numeric and string keys', () => {
  expect(validateRowKeys([{ id: 0 }, { id: '0' }])).toEqual([0, '0'])
  expect(resolveRowKey({ key: 'custom' }, (row) => row.key)).toBe('custom')
  for (const key of [null, undefined, false, NaN, Infinity])
    expect(() => resolveRowKey({ id: key })).toThrow()
  expect(() => validateRowKeys([{ id: 1 }, { id: 1 }])).toThrow(/Duplicate/)
})

test('parses explicit localized page jumps and falls back for invalid numeric models', () => {
  for (const input of ['30', '۳۰', '٣٠', ' 30 '])
    expect(parsePageInput(input, 100)).toBe(30)
  for (const input of [
    '',
    '0',
    '-1',
    '101',
    '1.5',
    '3e1',
    '0x20',
    'hello',
    '9007199254740993',
  ])
    expect(parsePageInput(input, 100)).toBeNull()
  for (const invalid of [undefined, 0, -1, 1.5, NaN, Infinity, '2']) {
    expect(normalizePage(invalid)).toBe(1)
    expect(normalizePageSize(invalid)).toBe(25)
  }
  expect(normalizePageSize(7)).toBe(7)
})
