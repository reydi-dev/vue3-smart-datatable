/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
import type {
  PersistedColumnState,
  PersistenceAdapter,
} from '../../types/index.js'

export interface LocalStoragePersistenceOptions {
  prefix?: string
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
}

function isColumnState(value: unknown): value is PersistedColumnState {
  return (
    value !== null &&
    typeof value === 'object' &&
    'version' in value &&
    value.version === 1 &&
    'visibleColumns' in value &&
    Array.isArray(value.visibleColumns) &&
    value.visibleColumns.every((key: unknown) => typeof key === 'string')
  )
}

export function createLocalStoragePersistenceAdapter(
  options: LocalStoragePersistenceOptions = {},
): PersistenceAdapter {
  const prefix = options.prefix ?? 'smart-data-table:'
  // Browser storage can throw even when merely accessed; resolve it inside each try.
  const storage = () =>
    options.storage ??
    (typeof window === 'undefined' ? null : window.localStorage)
  return {
    async load(key) {
      try {
        const raw = storage()?.getItem(prefix + key)
        if (!raw) return null
        const value: unknown = JSON.parse(raw)
        return isColumnState(value)
          ? { version: 1, visibleColumns: [...new Set(value.visibleColumns)] }
          : null
      } catch {
        return null
      }
    },
    async save(key, value) {
      try {
        if (isColumnState(value))
          storage()?.setItem(
            prefix + key,
            JSON.stringify({
              version: 1,
              visibleColumns: [...new Set(value.visibleColumns)],
            }),
          )
      } catch {
        /* Persistence is optional; callers retain in-memory state. */
      }
    },
    async remove(key) {
      try {
        storage()?.removeItem(prefix + key)
      } catch {
        /* Optional persistence. */
      }
    },
  }
}
