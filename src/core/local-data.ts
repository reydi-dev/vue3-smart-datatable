/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
import { applyFilters } from './filters.js'
import { resolveColumnValue } from './columns.js'
import { normalizePage, normalizePageSize } from './pagination.js'
import type { DataTableColumn, FilterState, SortState } from '../types/index.js'

function sortValue(value: unknown, type?: string): string | number | null {
  if (value === null || value === undefined) return null
  if (type === 'number') {
    const number = Number(value)
    return Number.isFinite(number) ? number : null
  }
  if (type === 'date') {
    const time =
      value instanceof Date
        ? value.getTime()
        : new Date(String(value)).getTime()
    return Number.isFinite(time) ? time : null
  }
  return String(value)
}

export function stableSort<Row extends object>(
  rows: readonly Row[],
  columns: readonly DataTableColumn<Row>[],
  sort: SortState | null,
): Row[] {
  const column = sort && columns.find((item) => item.key === sort.columnKey)
  if (!sort || !column) return [...rows]
  const direction = sort.direction === 'asc' ? 1 : -1
  return rows
    .map((row, index) => ({
      row,
      index,
      value: sortValue(resolveColumnValue(column, row), column.type),
    }))
    .sort((a, b) => {
      if (a.value === b.value) return a.index - b.index
      if (a.value === null) return 1
      if (b.value === null) return -1
      const result =
        typeof a.value === 'number' && typeof b.value === 'number'
          ? a.value - b.value
          : String(a.value).localeCompare(String(b.value), undefined, {
              numeric: true,
              sensitivity: 'base',
            })
      return result === 0 ? a.index - b.index : result * direction
    })
    .map(({ row }) => row)
}

export function processLocalData<Row extends object>(
  rows: readonly Row[],
  columns: readonly DataTableColumn<Row>[],
  filters: FilterState,
  sort: SortState | null,
  page: number,
  itemsPerPage: number,
): { items: Row[]; total: number } {
  const sorted = stableSort(applyFilters(rows, columns, filters), columns, sort)
  const size = normalizePageSize(itemsPerPage)
  const start = (normalizePage(page) - 1) * size
  return { items: sorted.slice(start, start + size), total: sorted.length }
}
