/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
import { resolveColumnValue } from './columns.js'
import type {
  DataTableColumn,
  FilterClause,
  FilterOperator,
  FilterState,
} from '../types/index.js'

export const operatorDefaults: Readonly<
  Record<'text' | 'number' | 'date' | 'select', FilterOperator>
> = {
  text: 'contains',
  number: 'eq',
  date: 'eq',
  select: 'eq',
}
export const operatorsByType: Readonly<
  Record<'text' | 'number' | 'date' | 'select', readonly FilterOperator[]>
> = {
  text: ['contains', 'startsWith', 'endsWith', 'eq', 'neq'],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
  date: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
  select: ['eq', 'neq', 'in'],
}

export function isEmptyFilterValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

/** Missing data must not become numeric zero through Number(null). */
function comparable(value: unknown, type: string): unknown {
  if (isEmptyFilterValue(value)) return null
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
  return value
}

function orderedCompare(left: unknown, right: unknown): number | null {
  if (typeof left === 'number' && typeof right === 'number')
    return left === right ? 0 : left > right ? 1 : -1
  if (typeof left === 'string' && typeof right === 'string')
    return left === right ? 0 : left > right ? 1 : -1
  return null
}

export function matchesFilter(
  value: unknown,
  clause: Readonly<FilterClause>,
  type = 'text',
): boolean {
  if (clause.operator === 'between') {
    // Preserve reference behavior: incomplete ranges are retained but inactive locally.
    if (isEmptyFilterValue(clause.from) || isEmptyFilterValue(clause.to))
      return true
    const actual = comparable(value, type)
    const lower = orderedCompare(actual, comparable(clause.from, type))
    const upper = orderedCompare(actual, comparable(clause.to, type))
    return lower !== null && upper !== null && lower >= 0 && upper <= 0
  }
  if (isEmptyFilterValue(clause.value)) return true
  if (clause.operator === 'in')
    return (
      Array.isArray(clause.value) &&
      clause.value.some((item: unknown) => Object.is(item, value))
    )
  if (
    clause.operator === 'contains' ||
    clause.operator === 'startsWith' ||
    clause.operator === 'endsWith'
  ) {
    const actual = String(value ?? '').toLocaleLowerCase()
    const expected = String(clause.value).toLocaleLowerCase()
    if (clause.operator === 'contains') return actual.includes(expected)
    if (clause.operator === 'startsWith') return actual.startsWith(expected)
    return actual.endsWith(expected)
  }
  const actual = comparable(value, type)
  const expected = comparable(clause.value, type)
  if (actual === null || expected === null) return false
  if (clause.operator === 'eq') return actual === expected
  if (clause.operator === 'neq') return actual !== expected
  const order = orderedCompare(actual, expected)
  if (order === null) return false
  switch (clause.operator) {
    case 'gt':
      return order > 0
    case 'gte':
      return order >= 0
    case 'lt':
      return order < 0
    case 'lte':
      return order <= 0
    default:
      return true
  }
}

export function applyFilters<Row extends object>(
  rows: readonly Row[],
  columns: readonly DataTableColumn<Row>[],
  filters: FilterState,
): Row[] {
  const byKey = new Map(columns.map((column) => [column.key, column]))
  return rows.filter((row) =>
    Object.entries(filters).every(([key, clause]) => {
      const column = byKey.get(key)
      return (
        !column ||
        matchesFilter(
          resolveColumnValue(column, row),
          clause,
          column.filter?.type || column.type || 'text',
        )
      )
    }),
  )
}

export function withoutEmptyFilters(filters: FilterState): FilterState {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, clause]) =>
        clause.operator === 'between'
          ? !isEmptyFilterValue(clause.from) || !isEmptyFilterValue(clause.to)
          : !isEmptyFilterValue(clause.value),
      )
      .map(([key, clause]) => [key, { ...clause }]),
  )
}
