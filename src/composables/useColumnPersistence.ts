import { onMounted, onScopeDispose, watch } from 'vue'
import type { PersistenceAdapter, SmartDataTableProps } from '../types/index.js'

export function useColumnPersistence<Row extends object>(
  props: SmartDataTableProps<Row>,
  restore: (keys: readonly string[]) => void,
) {
  let alive = true
  let mounted = false
  let revision = 0
  let restoreId = 0
  const queues = new WeakMap<PersistenceAdapter, Map<string, Promise<void>>>()
  const touch = () => ++revision

  function enqueue(
    operation: 'save' | 'remove',
    keys: readonly string[] = [],
  ): Promise<void> {
    const adapter = props.persistenceAdapter
    const key = props.persistenceKey
    if (!adapter || !key || !alive) return Promise.resolve()
    let byKey = queues.get(adapter)
    if (!byKey) {
      byKey = new Map()
      queues.set(adapter, byKey)
    }
    const previous = byKey.get(key) ?? Promise.resolve()
    const snapshot = [...keys]
    const next = previous
      .then(async () => {
        if (!alive) return
        if (operation === 'remove') await adapter.remove(key)
        else await adapter.save(key, { version: 1, visibleColumns: snapshot })
      })
      .catch(() => {
        /* Optional persistence must not affect data operations. */
      })
    byKey.set(key, next)
    void next.then(() => {
      if (byKey.get(key) === next) byKey.delete(key)
    })
    return next
  }

  async function load() {
    const id = ++restoreId
    const intent = revision
    const adapter = props.persistenceAdapter
    const key = props.persistenceKey
    if (
      !alive ||
      !mounted ||
      props.visibleColumns !== undefined ||
      !adapter ||
      !key
    )
      return
    try {
      await queues.get(adapter)?.get(key)
      if (
        !alive ||
        id !== restoreId ||
        intent !== revision ||
        props.visibleColumns !== undefined
      )
        return
      const saved = await adapter.load(key)
      if (
        !alive ||
        id !== restoreId ||
        intent !== revision ||
        props.visibleColumns !== undefined
      )
        return
      if (
        saved?.version === 1 &&
        Array.isArray(saved.visibleColumns) &&
        Array.from(saved.visibleColumns).every(
          (key: unknown) => typeof key === 'string',
        )
      )
        restore([...saved.visibleColumns])
    } catch {
      /* Retain current/default columns. */
    }
  }

  watch(() => props.visibleColumns, touch, { deep: true, flush: 'sync' })
  watch(() => props.columns, touch, { deep: true, flush: 'sync' })
  watch(
    [() => props.persistenceAdapter, () => props.persistenceKey],
    () => {
      ++restoreId
      if (mounted) void load()
    },
    { flush: 'sync' },
  )
  onMounted(() => {
    mounted = true
    void load()
  })
  onScopeDispose(() => {
    alive = false
    ++restoreId
  })
  return {
    touch,
    revision: () => revision,
    save: (keys: readonly string[]) => enqueue('save', keys),
    remove: () => enqueue('remove'),
  }
}
