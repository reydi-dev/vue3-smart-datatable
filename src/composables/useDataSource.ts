import {
  computed,
  onMounted,
  onScopeDispose,
  shallowRef,
  watch,
  type ComputedRef,
} from 'vue'
import { validateRowKeys } from '../core/columns.js'
import {
  equalQueryValue,
  copyFilters,
  copyRequest,
  snapshotFilters,
} from '../core/query.js'
import { normalizeProviderResponse } from '../core/provider.js'
import type {
  DataProviderRequest,
  SmartDataTableProps,
} from '../types/index.js'
import { withAbort, type TableEmit } from './lifecycle.js'

export interface TableQuery {
  page: number
  itemsPerPage: number
  sort: DataProviderRequest['sort']
  filters: DataProviderRequest['filters']
}
type Reason = DataProviderRequest['reason']

export function useDataSource<Row extends object>(
  props: SmartDataTableProps<Row>,
  query: ComputedRef<TableQuery>,
  configurationError: ComputedRef<unknown>,
  correctPage: (page: number) => void,
  emit: TableEmit<Row>,
) {
  const rows = shallowRef<readonly Row[]>([])
  const total = shallowRef(0)
  const error = shallowRef<unknown>(null)
  const pending = shallowRef(false)
  const stale = shallowRef(true)
  const missingProvider = new Error('dataProvider is required in server mode')
  let alive = true
  let mounted = false
  let requestId = 0
  let controller: AbortController | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let loadingNotified = false
  let invalidated = false
  let automatic = false
  let suppressUntilFlush = false

  const mode = () => props.mode ?? 'local'
  const autoLoad = () => props.autoLoad !== false
  const sources = () =>
    [
      { ...query.value, filters: snapshotFilters(query.value.filters) },
      mode(),
      props.dataProvider,
      props.normalizeResponse,
      props.providerContext,
      autoLoad(),
      props.rowKey,
      configurationError.value,
    ] as const
  let observed = sources()

  function notifyLoading(value: boolean) {
    if (loadingNotified === value) return
    loadingNotified = value
    if (alive) emit('loading-change', value)
  }

  function invalidate(holdLoading = false) {
    ++requestId
    controller?.abort()
    controller = undefined
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    pending.value = holdLoading
    if (!holdLoading) notifyLoading(false)
  }

  function request(reason: Reason, signal?: AbortSignal): DataProviderRequest {
    const current = query.value
    return {
      ...current,
      sort: current.sort ? { ...current.sort } : null,
      filters: copyFilters(current.filters),
      context: props.providerContext,
      reason,
      ...(signal ? { signal } : {}),
    }
  }

  async function load(reason: Reason, isAutomatic: boolean) {
    if (!alive || !mounted || mode() !== 'server') return
    invalidate(true)
    automatic = isAutomatic
    error.value = null
    if (configurationError.value || !props.dataProvider) {
      error.value =
        configurationError.value ||
        new Error('dataProvider is required in server mode')
      pending.value = false
      notifyLoading(false)
      return
    }
    const provider = props.dataProvider
    const normalize = props.normalizeResponse
    const rowKey = props.rowKey ?? 'id'
    const active = new AbortController()
    controller = active
    const id = requestId
    const current = () => alive && id === requestId && !active.signal.aborted
    const input = request(reason, active.signal)
    emit('load-start', copyRequest(input))
    notifyLoading(true)
    try {
      active.signal.throwIfAborted()
      const raw = await withAbort(
        Promise.resolve(provider(copyRequest(input))),
        active.signal,
      )
      if (!current()) return
      const result = normalizeProviderResponse<Row>(
        raw,
        copyRequest(input),
        normalize,
      )
      validateRowKeys(result.items, rowKey)
      if (!current()) return
      total.value = result.total
      const lastPage = Math.max(1, Math.ceil(result.total / input.itemsPerPage))
      if (input.page > lastPage) {
        rows.value = []
        correctPage(lastPage)
        if (!current()) return
      } else rows.value = [...result.items]
      stale.value = false
      emit('load-success', {
        request: copyRequest(input),
        result: { ...result, items: [...result.items] },
      })
    } catch (failure: unknown) {
      if (!current()) return
      if (failure instanceof Error && failure.name === 'AbortError') return
      rows.value = []
      error.value = failure
      stale.value = true
      emit('load-error', { request: copyRequest(input), error: failure })
    } finally {
      if (alive && id === requestId) {
        controller = undefined
        pending.value = false
        notifyLoading(false)
      }
    }
  }

  function different(
    next: ReturnType<typeof sources>,
    previous: ReturnType<typeof sources>,
  ) {
    return (
      !equalQueryValue(next[0], previous[0]) ||
      next
        .slice(1)
        .some((value, index) => !Object.is(value, previous[index + 1]))
    )
  }

  // Invalidate immediately, even though replacement queries are coalesced after flush.
  watch(
    sources,
    (next, previous) => {
      if (!different(next, previous)) return
      const onlyAutoDisabled =
        next[5] === false &&
        previous[5] === true &&
        equalQueryValue(next[0], previous[0]) &&
        next.every(
          (value, index) =>
            index === 0 || index === 5 || Object.is(value, previous[index]),
        )
      if (onlyAutoDisabled && !automatic && controller) return
      invalidated = true
      const dataChanged =
        !equalQueryValue(next[0], previous[0]) ||
        next.some(
          (value, index) =>
            index > 0 && index !== 5 && !Object.is(value, previous[index]),
        )
      if (dataChanged) {
        stale.value = true
        error.value = null
      }
      const replace = mounted && next[1] === 'server' && next[5] && !next[7]
      invalidate(replace)
      if (next[1] === 'local') {
        rows.value = []
        total.value = 0
      }
    },
    { flush: 'sync' },
  )

  watch(
    sources,
    (next) => {
      const previous = observed
      observed = next
      const changed = different(next, previous)
      const needsReplacement = invalidated
      invalidated = false
      if (!alive || !mounted || (!changed && !needsReplacement)) return
      const queryChanged = !equalQueryValue(next[0], previous[0])
      const contextChanged = !Object.is(next[4], previous[4])
      let reason: Reason = 'refresh'
      if (!equalQueryValue(next[0].filters, previous[0].filters))
        reason = 'filter'
      else if (!equalQueryValue(next[0].sort, previous[0].sort)) reason = 'sort'
      else if (next[0].itemsPerPage !== previous[0].itemsPerPage)
        reason = 'page-size'
      else if (next[0].page !== previous[0].page) reason = 'page'
      if (queryChanged || contextChanged)
        emit('options-change', request(reason))
      if (suppressUntilFlush) {
        suppressUntilFlush = false
        return
      }
      if (mode() !== 'server' || !autoLoad() || configurationError.value) return
      if (previous[1] !== 'server') reason = 'initial'
      const configuredDelay = props.filterDebounce ?? 250
      const delay =
        reason === 'filter'
          ? Number.isFinite(configuredDelay) && configuredDelay >= 0
            ? configuredDelay
            : 250
          : 0
      if (delay)
        timer = setTimeout(() => {
          timer = undefined
          void load(reason, true)
        }, delay)
      else void load(reason, true)
    },
    { flush: 'post' },
  )

  onMounted(() => {
    mounted = true
    observed = sources()
    if (mode() === 'server' && autoLoad()) void load('initial', true)
  })
  onScopeDispose(() => {
    alive = false
    invalidate()
    rows.value = []
    pending.value = false
  })

  async function refresh() {
    if (!alive) return
    suppressUntilFlush = different(sources(), observed)
    await load('refresh', false)
  }

  return {
    rows: computed(() => rows.value),
    total: computed(() => total.value),
    error: computed(() =>
      mode() === 'server' && !props.dataProvider
        ? missingProvider
        : error.value,
    ),
    pending: computed(() => pending.value),
    stale: computed(() => stale.value),
    refresh,
  }
}
