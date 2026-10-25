import {
  computed,
  nextTick,
  onMounted,
  onScopeDispose,
  shallowRef,
  watch,
} from 'vue'
import {
  normalizeColumns,
  resolveRowKey,
  resolveVisibleColumns,
  validateRowKeys,
} from '../core/columns.js'
import { normalizePage, normalizePageSize } from '../core/pagination.js'
import {
  normalizeSelection,
  toggleKey,
  togglePageKeys,
} from '../core/selection.js'
import { withoutEmptyFilters } from '../core/filters.js'
import { copyFilters, equalQueryValue } from '../core/query.js'
import { processLocalData } from '../core/local-data.js'
import { useColumnPersistence } from './useColumnPersistence.js'
import { useDataSource, type TableQuery } from './useDataSource.js'
import { useTableExport } from './useTableExport.js'
import type { TableEmit } from './lifecycle.js'
import type {
  DataTableState,
  FilterState,
  RowKey,
  SmartDataTableExpose,
  SmartDataTableProps,
  SortState,
} from '../types/index.js'

/** One local value only for the uncontrolled mode; controlled values are read directly. */
function optionalModel<Value>(
  read: () => Value | undefined,
  initial: Value,
  normalize: (value: Value) => Value,
  update: (value: Value) => void,
) {
  const local = shallowRef<Value>(initial)
  watch(
    read,
    (next, previous) => {
      if (next === undefined && previous !== undefined)
        local.value = normalize(previous)
    },
    { flush: 'sync' },
  )
  const value = computed(() => {
    const supplied = read()
    return normalize(supplied === undefined ? local.value : supplied)
  })
  return {
    value,
    setInternal(next: Value) {
      if (read() === undefined) local.value = normalize(next)
    },
    propose(next: Value) {
      const normalized = normalize(next)
      if (equalQueryValue(value.value, normalized)) return false
      if (read() === undefined) local.value = normalize(normalized)
      update(normalize(normalized))
      return true
    },
  }
}

/** Internal coordinator. It deliberately is not a package/headless export. */
export function useDataTable<Row extends object>(
  props: SmartDataTableProps<Row>,
  emit: TableEmit<Row>,
) {
  let alive = true
  let mounted = false
  const localRevision = shallowRef(0)
  const schema = computed(() => {
    try {
      return { columns: normalizeColumns(props.columns), error: null }
    } catch (error: unknown) {
      return { columns: [], error }
    }
  })
  const columns = computed(() => schema.value.columns)
  const page = optionalModel(
    () => props.page,
    1,
    normalizePage,
    (value) => emit('update:page', value),
  )
  const size = optionalModel(
    () => props.itemsPerPage,
    25,
    normalizePageSize,
    (value) => emit('update:itemsPerPage', value),
  )
  const sort = optionalModel<SortState | null>(
    () => props.sort,
    null,
    (value) =>
      value && columns.value.some((column) => column.key === value.columnKey)
        ? { ...value }
        : null,
    (value) => emit('update:sort', value),
  )
  const filters = optionalModel<FilterState>(
    () => props.filters,
    {},
    copyFilters,
    (value) => emit('update:filters', value),
  )
  const selected = optionalModel<readonly RowKey[]>(
    () => props.modelValue,
    [],
    normalizeSelection,
    (value) => emit('update:modelValue', value),
  )
  const visible = optionalModel<readonly string[]>(
    () => props.visibleColumns,
    resolveVisibleColumns(columns.value),
    (keys) => resolveVisibleColumns(columns.value, keys),
    (value) => emit('update:visibleColumns', value),
  )

  const local = computed(() => {
    void localRevision.value
    try {
      if (schema.value.error) throw schema.value.error
      if ((props.mode ?? 'local') !== 'local')
        return { items: [] as Row[], total: 0, error: null }
      const result = processLocalData(
        props.items ?? [],
        columns.value,
        filters.value.value,
        sort.value.value,
        page.value.value,
        size.value.value,
      )
      validateRowKeys(result.items, props.rowKey ?? 'id')
      return { ...result, error: null }
    } catch (error: unknown) {
      return { items: [] as Row[], total: 0, error }
    }
  })

  const query = computed<TableQuery>(() => {
    const value = sort.value.value
    const column =
      value && columns.value.find((column) => column.key === value.columnKey)
    return {
      page: page.value.value,
      itemsPerPage: size.value.value,
      sort: value
        ? {
            ...value,
            field: column
              ? column.sortKey ||
                (typeof column.field === 'string' ? column.field : column.key)
              : value.columnKey,
          }
        : null,
      filters: withoutEmptyFilters(filters.value.value),
    }
  })
  const data = useDataSource(
    props,
    query,
    computed(() => schema.value.error),
    (value) => page.propose(value),
    emit,
  )
  const rows = computed(() =>
    (props.mode ?? 'local') === 'local' ? local.value.items : data.rows.value,
  )
  const total = computed(() =>
    (props.mode ?? 'local') === 'local' ? local.value.total : data.total.value,
  )
  const error = computed(
    () =>
      schema.value.error ||
      ((props.mode ?? 'local') === 'local'
        ? local.value.error
        : data.error.value),
  )
  const loading = computed(() => !!props.loading || data.pending.value)
  const visibleColumns = computed(() =>
    columns.value.filter((column) => visible.value.value.includes(column.key)),
  )
  const persistence = useColumnPersistence(props, (keys) =>
    visible.setInternal(keys),
  )

  function correctLocalPage() {
    if (
      !alive ||
      !mounted ||
      (props.mode ?? 'local') !== 'local' ||
      local.value.error
    )
      return
    const last = Math.max(1, Math.ceil(local.value.total / size.value.value))
    if (page.value.value > last) page.propose(last)
  }
  watch(local, correctLocalPage, { flush: 'post' })
  watch(
    () => props.rowKey,
    () => {
      if (mounted) setSelection([], true)
    },
    { flush: 'post' },
  )
  watch(
    columns,
    (next, previous) => {
      if (props.sort === undefined) sort.setInternal(sort.value.value)
      if (props.visibleColumns !== undefined) return
      const oldKeys = new Set(previous.map((column) => column.key))
      visible.setInternal([
        ...visible.value.value,
        ...next
          .filter(
            (column) => !oldKeys.has(column.key) && !column.hiddenByDefault,
          )
          .map((column) => column.key),
      ])
    },
    { flush: 'sync' },
  )

  function getState(): DataTableState {
    return {
      page: page.value.value,
      itemsPerPage: size.value.value,
      sort: sort.value.value ? { ...sort.value.value } : null,
      filters: copyFilters(filters.value.value),
      selectedKeys: [...selected.value.value],
      visibleColumns: [...visible.value.value],
      total: total.value,
      loading: loading.value,
      error: error.value,
    }
  }

  let selectionQueued = false
  let visibilityQueued = false
  let visibilityForceSave = false
  function setSelection(keys: readonly RowKey[], force = false) {
    if (!alive || (!force && (props.disabled || !props.selectable))) return
    const before = [...selected.value.value]
    const changed = selected.propose(keys)
    if (!changed || selectionQueued) return
    selectionQueued = true
    void nextTick(() => {
      selectionQueued = false
      if (!alive || equalQueryValue(before, selected.value.value)) return
      const keys = [...selected.value.value]
      emit('selection-change', {
        keys,
        rows: rows.value.filter((row) =>
          keys.includes(resolveRowKey(row, props.rowKey ?? 'id')),
        ),
      })
    })
  }

  async function setVisibleColumns(
    keys: readonly string[],
    force = false,
    saveEvenUnchanged = false,
  ) {
    if (!alive || (!force && props.disabled)) return
    persistence.touch()
    const before = [...visible.value.value]
    visible.propose(keys)
    visibilityForceSave ||= saveEvenUnchanged
    if (visibilityQueued) return
    visibilityQueued = true
    await nextTick()
    visibilityQueued = false
    const save = visibilityForceSave
    visibilityForceSave = false
    if (!alive) return
    const accepted = [...visible.value.value]
    if (!equalQueryValue(before, accepted)) {
      emit('column-visibility-change', [...accepted])
      await persistence.save(accepted)
    } else if (
      save &&
      equalQueryValue(accepted, resolveVisibleColumns(columns.value, keys))
    )
      await persistence.save(accepted)
  }

  function setPage(value: number) {
    if (
      !alive ||
      props.disabled ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value > Math.max(1, Math.ceil(total.value / size.value.value))
    )
      return
    page.propose(value)
  }
  function setPageSize(value: number) {
    if (
      !alive ||
      props.disabled ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value === size.value.value
    )
      return
    size.propose(value)
    page.propose(1)
  }
  function setSort(columnKey: string) {
    if (
      !alive ||
      props.disabled ||
      !columns.value.some(
        (column) => column.key === columnKey && column.sortable,
      )
    )
      return
    sort.propose({
      columnKey,
      direction:
        sort.value.value?.columnKey === columnKey &&
        sort.value.value.direction === 'asc'
          ? 'desc'
          : 'asc',
    })
    page.propose(1)
  }
  function setFilters(value: FilterState, force = false) {
    if (
      !alive ||
      (!force && props.disabled) ||
      equalQueryValue(filters.value.value, value)
    )
      return
    filters.propose(value)
    page.propose(1)
  }

  const exports = useTableExport(
    props,
    () => ({
      request: {
        ...query.value,
        sort: query.value.sort ? { ...query.value.sort } : null,
        filters: copyFilters(query.value.filters),
        context: props.providerContext,
        reason: 'export',
      },
      columns: visibleColumns.value.map((column) => ({ ...column })),
      allColumns: columns.value.map((column) => ({ ...column })),
      rows: [...rows.value],
      total: total.value,
    }),
    () =>
      !loading.value &&
      !error.value &&
      ((props.mode ?? 'local') === 'local' || !data.stale.value),
    emit,
  )

  async function resetColumnVisibility() {
    if (!alive) return
    const intent = persistence.touch()
    await persistence.remove()
    if (alive && intent === persistence.revision())
      await setVisibleColumns(resolveVisibleColumns(columns.value), true, true)
  }
  const exposed: SmartDataTableExpose = {
    async refresh() {
      if (!alive) return
      ++localRevision.value
      await data.refresh()
    },
    resetFilters: () => setFilters({}, true),
    clearSelection: () => setSelection([], true),
    resetColumnVisibility,
    exportData: exports.exportData,
    getState,
  }
  onMounted(() => {
    mounted = true
    correctLocalPage()
  })
  onScopeDispose(() => {
    alive = false
    mounted = false
  })
  return {
    columns,
    visibleColumns,
    rows,
    total,
    error,
    loading,
    exporting: exports.exporting,
    exportProgress: exports.progress,
    state: computed(getState),
    exposed,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    setVisibleColumns,
    selectRow(row: Row, checked: boolean) {
      if (!alive || props.disabled || !props.selectable) return
      setSelection(
        toggleKey(
          selected.value.value,
          resolveRowKey(row, props.rowKey ?? 'id'),
          checked,
        ),
      )
    },
    selectPage(checked: boolean) {
      if (!alive || props.disabled || !props.selectable) return
      setSelection(
        togglePageKeys(
          selected.value.value,
          validateRowKeys(rows.value, props.rowKey ?? 'id'),
          checked,
        ),
      )
    },
  }
}
