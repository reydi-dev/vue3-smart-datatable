/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
import { isRowKey } from './columns.js'
import type { RowKey } from '../types/index.js'

export function normalizeSelection(keys: readonly RowKey[]): RowKey[] {
  if (!Array.from(keys).every(isRowKey))
    throw new TypeError('Selection requires string or finite number keys')
  return [...new Set(keys)]
}

export function toggleKey(
  keys: readonly RowKey[],
  key: RowKey,
  selected?: boolean,
): RowKey[] {
  const next = normalizeSelection([...keys, key])
  const shouldSelect = selected ?? !keys.includes(key)
  return shouldSelect ? next : next.filter((item) => item !== key)
}

export function togglePageKeys(
  keys: readonly RowKey[],
  pageKeys: readonly RowKey[],
  selected: boolean,
): RowKey[] {
  const page = new Set(normalizeSelection(pageKeys))
  const next = normalizeSelection(keys)
  return selected
    ? normalizeSelection([...next, ...page])
    : next.filter((key) => !page.has(key))
}
