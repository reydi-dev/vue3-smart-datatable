/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
import type {
  ClassValue,
  CellContext,
  DataRow,
  DataTableColumn,
  RowKey,
  RowKeyGetter,
} from '../types/index.js'

export function getPathValue(source: unknown, path: string): unknown {
  if (!path) return undefined
  return path.split('.').reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined
    return Reflect.get(value, key)
  }, source)
}

export function resolveColumnValue<Row extends object>(
  column: DataTableColumn<Row>,
  row: Row,
): unknown {
  return typeof column.field === 'function'
    ? column.field(row)
    : getPathValue(row, column.field || column.key)
}

export function formatColumnValue<Row extends object>(
  column: DataTableColumn<Row>,
  row: Row,
  locale = 'en',
): unknown {
  const value = resolveColumnValue(column, row)
  if (column.formatter) return column.formatter(value, row, column)
  if (value === null || value === undefined) return ''
  if (column.type === 'select')
    return (
      column.options?.find((option) => Object.is(option.value, value))?.label ??
      value
    )
  if (column.type === 'number') {
    const number = Number(value)
    return Number.isFinite(number)
      ? new Intl.NumberFormat(locale, column.numberFormat).format(number)
      : ''
  }
  if (column.type === 'date') {
    const date = value instanceof Date ? value : new Date(String(value))
    return Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(locale, column.dateFormat).format(date)
  }
  return value
}

export function normalizeColumns<Row extends object = DataRow>(
  columns: readonly DataTableColumn<Row>[],
): DataTableColumn<Row>[] {
  const keys = new Set<string>()
  return Array.from(columns, (column) => {
    if (
      !column ||
      typeof column.key !== 'string' ||
      !column.key ||
      keys.has(column.key)
    ) {
      throw new TypeError('Column keys must be non-empty and unique')
    }
    keys.add(column.key)
    return {
      type: 'text',
      sortable: false,
      filterable: false,
      hideable: true,
      align: 'start',
      ...column,
    }
  })
}

export function isRowKey(key: unknown): key is RowKey {
  return (
    typeof key === 'string' || (typeof key === 'number' && Number.isFinite(key))
  )
}

export function resolveRowKey<Row extends object>(
  row: Row,
  rowKey: string | RowKeyGetter<Row> = 'id',
): RowKey {
  const key =
    typeof rowKey === 'function' ? rowKey(row) : getPathValue(row, rowKey)
  if (!isRowKey(key))
    throw new TypeError(
      'Every row must resolve to a string or finite number row key',
    )
  return key
}

/** Validate only the displayed page; the same record may appear on other pages. */
export function validateRowKeys<Row extends object>(
  rows: readonly Row[],
  rowKey: string | RowKeyGetter<Row> = 'id',
): RowKey[] {
  const seen = new Set<RowKey>()
  return Array.from(rows, (row) => {
    if (row === null || typeof row !== 'object' || Array.isArray(row))
      throw new TypeError('Rows must be objects')
    const key = resolveRowKey(row, rowKey)
    if (seen.has(key)) throw new TypeError(`Duplicate row key: ${key}`)
    seen.add(key)
    return key
  })
}

export function resolveVisibleColumns<Row extends object>(
  columns: readonly DataTableColumn<Row>[],
  keys?: readonly string[],
): string[] {
  const requested = keys === undefined ? undefined : new Set(keys)
  return columns
    .filter(
      (column) =>
        column.hideable === false ||
        (requested ? requested.has(column.key) : !column.hiddenByDefault),
    )
    .map((column) => column.key)
}

export function resolveCellClass<Row extends object>(
  column: DataTableColumn<Row>,
  context: CellContext<Row>,
): ClassValue {
  return typeof column.cellClass === 'function'
    ? column.cellClass(context)
    : column.cellClass
}
