import { afterEach, expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, shallowReactive } from 'vue'
import StateHarness from './StateHarness.vue'
import type { FixtureRow } from './state-fixture.js'
import type {
  DataProviderRequest,
  DataTableColumn,
  NormalizedData,
  SmartDataTableProps,
} from '../../src/types/index.js'

const columns: readonly DataTableColumn<FixtureRow>[] = [
  { key: 'id', label: 'ID', sortable: true, type: 'number' },
  { key: 'name', label: 'Name', filterable: true },
]
const items: FixtureRow[] = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  name: i < 40 ? 'Alpha' : 'Beta',
}))
const cleanups: Array<() => void> = []
afterEach(() => {
  for (const stop of cleanups.splice(0)) stop()
  vi.useRealTimers()
})
function fixture(props: Partial<SmartDataTableProps<FixtureRow>> = {}) {
  const wrapper = mount(StateHarness, { props: { columns, items, ...props } })
  cleanups.push(() => {
    if (wrapper.exists()) wrapper.unmount()
  })
  return wrapper
}
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function controlled(initial: Partial<SmartDataTableProps<FixtureRow>>) {
  const models = shallowReactive<SmartDataTableProps<FixtureRow>>({
    columns,
    items,
    ...initial,
  })
  const order: string[] = []
  const parent = mount(
    defineComponent({
      setup: () => () =>
        h(StateHarness, {
          ...models,
          'onUpdate:page': (page: number) => {
            order.push('page')
            models.page = page
          },
          'onUpdate:itemsPerPage': (size: number) => {
            order.push('size')
            models.itemsPerPage = size
          },
          'onUpdate:filters': (filters) => {
            order.push('filters')
            models.filters = filters
          },
          onOptionsChange: () => order.push('options'),
        }),
    }),
  )
  cleanups.push(() => parent.unmount())
  return { wrapper: parent.findComponent(StateHarness), models, order }
}

test('distinguishes omitted and explicit empty models, supports ownership handoff and independent snapshots', async () => {
  const wrapper = fixture({
    selectable: true,
    modelValue: [],
    visibleColumns: [],
  })
  wrapper.vm.selectPage(true)
  await nextTick()
  expect(wrapper.vm.state.selectedKeys).toEqual([])
  expect(wrapper.emitted('selection-change')).toBeUndefined()
  expect(wrapper.emitted('update:modelValue')?.[0][0]).toHaveLength(25)
  expect(wrapper.vm.visibleColumns).toEqual([])
  await wrapper.setProps({ modelValue: [0, '0'], visibleColumns: ['id'] })
  await wrapper.setProps({ modelValue: undefined, visibleColumns: undefined })
  expect(wrapper.vm.state.selectedKeys).toEqual([0, '0'])
  wrapper.vm.exposed.clearSelection()
  await nextTick()
  expect(wrapper.vm.state.selectedKeys).toEqual([])
  const snapshot = wrapper.vm.exposed.getState()
  snapshot.page = 999
  Reflect.set(snapshot.selectedKeys, 0, 'changed')
  Reflect.set(snapshot.visibleColumns, 0, 'changed')
  expect(wrapper.vm.exposed.getState()).toMatchObject({
    page: 1,
    selectedKeys: [],
    visibleColumns: ['id'],
  })
})

test('coalesces accepted filter/page transactions after the parent flush and never echoes model props', async () => {
  const provider = vi.fn(async (request: DataProviderRequest) => ({
    items: items.slice(0, request.itemsPerPage),
    total: 80,
  }))
  const { wrapper, models, order } = controlled({
    mode: 'server',
    page: 3,
    itemsPerPage: 10,
    filters: {},
    dataProvider: provider,
    filterDebounce: 0,
  })
  await flushPromises()
  order.length = 0
  wrapper.vm.setFilters({ name: { operator: 'contains', value: 'Alpha' } })
  await flushPromises()
  expect(order).toEqual(['filters', 'page', 'options'])
  expect(provider).toHaveBeenCalledTimes(2)
  expect(provider.mock.calls[1][0]).toMatchObject({
    page: 1,
    itemsPerPage: 10,
    reason: 'filter',
  })
  const proposals = wrapper.emitted('update:filters')?.length
  models.filters = { name: { operator: 'contains', value: 'Beta' } }
  models.page = 2
  await flushPromises()
  expect(provider).toHaveBeenCalledTimes(3)
  expect(provider.mock.calls[2][0].page).toBe(2)
  expect(wrapper.emitted('update:filters')?.length).toBe(proposals)
  order.length = 0
  wrapper.vm.setPageSize(5)
  await flushPromises()
  expect(order).toEqual(['size', 'page', 'options'])
  expect(provider).toHaveBeenCalledTimes(4)
  expect(provider.mock.calls[3][0]).toMatchObject({
    page: 1,
    itemsPerPage: 5,
    reason: 'page-size',
  })
  wrapper.vm.setSort('id')
  await flushPromises()
  expect(provider).toHaveBeenCalledTimes(5)
  expect(provider.mock.calls[4][0]).toMatchObject({
    reason: 'sort',
    sort: { columnKey: 'id', direction: 'asc', field: 'id' },
  })
})

test('a rejected controlled query proposal does not load its proposed value', async () => {
  const provider = vi.fn(async (request: DataProviderRequest) => ({
    items: [items[0]],
    total: 80,
    meta: request.reason,
  }))
  const wrapper = fixture({
    mode: 'server',
    filters: {},
    dataProvider: provider,
    filterDebounce: 0,
  })
  await flushPromises()
  wrapper.vm.setFilters({ name: { operator: 'eq', value: 'rejected' } })
  await flushPromises()
  expect(provider).toHaveBeenCalledTimes(1)
  expect(wrapper.emitted('options-change')).toBeUndefined()
  expect(wrapper.vm.state.filters).toEqual({})
})

test('invalidates during debounce, ignores old successes/errors, and keeps one replacement loading interval', async () => {
  vi.useFakeTimers()
  const old = deferred<NormalizedData<FixtureRow>>()
  const latest = deferred<NormalizedData<FixtureRow>>()
  const provider = vi
    .fn()
    .mockReturnValueOnce(old.promise)
    .mockReturnValueOnce(latest.promise)
  const wrapper = fixture({
    mode: 'server',
    dataProvider: provider,
    filterDebounce: 100,
  })
  wrapper.vm.setFilters({ name: { operator: 'contains', value: 'A' } })
  await nextTick()
  expect(provider.mock.calls[0][0].signal?.aborted).toBe(true)
  old.resolve({ items: [{ id: 999, name: 'Old' }], total: 1 })
  await flushPromises()
  expect(wrapper.vm.rows).toEqual([])
  expect(wrapper.emitted('load-success')).toBeUndefined()
  expect(wrapper.emitted('loading-change')).toEqual([[true]])
  wrapper.vm.setFilters({ name: { operator: 'contains', value: 'AB' } })
  await nextTick()
  await vi.advanceTimersByTimeAsync(100)
  expect(provider).toHaveBeenCalledTimes(2)
  latest.resolve({ items: [{ id: 2, name: 'Latest' }], total: 1 })
  await flushPromises()
  expect(wrapper.vm.rows[0].name).toBe('Latest')
  expect(wrapper.emitted('load-success')).toHaveLength(1)
  expect(wrapper.emitted('loading-change')).toEqual([[true], [false]])
})

test('autoLoad=false suppresses prop/provider/context loads while explicit refresh works when disabled', async () => {
  const provider = vi.fn(async (request: DataProviderRequest) => ({
    items: [items[0]],
    total: 80,
    meta: request.reason,
  }))
  const wrapper = fixture({
    mode: 'server',
    autoLoad: false,
    disabled: true,
    dataProvider: provider,
  })
  await wrapper.setProps({ page: 2, providerContext: { account: 'other' } })
  expect(provider).not.toHaveBeenCalled()
  await wrapper.vm.exposed.refresh()
  expect(provider).toHaveBeenCalledTimes(1)
  expect(provider.mock.calls[0][0]).toMatchObject({
    page: 2,
    reason: 'refresh',
  })
  wrapper.vm.setPageSize(10)
  await nextTick()
  expect(wrapper.vm.state.itemsPerPage).toBe(25)
  await wrapper.setProps({ autoLoad: true })
  await flushPromises()
  expect(provider).toHaveBeenCalledTimes(2)
  await wrapper.setProps({ autoLoad: false })
  expect(wrapper.vm.rows).toHaveLength(1)
  expect(wrapper.vm.loading).toBe(false)
})

test('disabling autoLoad does not abort an explicit in-flight refresh', async () => {
  const pending = deferred<NormalizedData<FixtureRow>>()
  const provider = vi.fn((request: DataProviderRequest) => {
    expect(request.signal).toBeDefined()
    return pending.promise
  })
  const wrapper = fixture({
    mode: 'server',
    autoLoad: false,
    dataProvider: provider,
  })
  await wrapper.setProps({ autoLoad: true })
  const refresh = wrapper.vm.exposed.refresh()
  await wrapper.setProps({ autoLoad: false })
  expect(provider.mock.calls.at(-1)?.[0].signal?.aborted).toBe(false)
  pending.resolve({ items: [items[0]], total: 1 })
  await refresh
  expect(wrapper.vm.rows).toEqual([items[0]])
  expect(wrapper.vm.loading).toBe(false)
})

test('provider/normalizer/context and mode replacements cancel old work; missing providers surface an error', async () => {
  const manual = fixture({
    mode: 'server',
    autoLoad: false,
    dataProvider: undefined,
  })
  expect(manual.vm.error).toBeInstanceOf(Error)
  expect(manual.emitted('load-start')).toBeUndefined()
  const pending = deferred<NormalizedData<FixtureRow>>()
  const provider = vi.fn((request: DataProviderRequest) => {
    expect(request.signal).toBeDefined()
    return pending.promise
  })
  const wrapper = fixture({ mode: 'server', dataProvider: provider })
  await wrapper.setProps({ providerContext: { tenant: 2 } })
  expect(provider).toHaveBeenCalledTimes(2)
  expect(provider.mock.calls[0][0].signal?.aborted).toBe(true)
  await wrapper.setProps({ mode: 'local' })
  pending.reject(new Error('stale failure'))
  await flushPromises()
  expect(wrapper.vm.rows).toHaveLength(25)
  expect(wrapper.emitted('load-error')).toBeUndefined()
  await wrapper.setProps({ mode: 'server', dataProvider: undefined })
  await flushPromises()
  expect(wrapper.vm.error).toBeInstanceOf(Error)
  expect(wrapper.vm.loading).toBe(false)
  const replacement = vi.fn(async () => ({ items: [items[1]], total: 1 }))
  await wrapper.setProps({ dataProvider: replacement })
  await flushPromises()
  expect(wrapper.vm.rows).toEqual([items[1]])
  await wrapper.setProps({
    normalizeResponse: () => ({ items: [items[2]], total: 1 }),
  })
  await flushPromises()
  expect(replacement).toHaveBeenCalledTimes(2)
  expect(wrapper.vm.rows).toEqual([items[2]])
})

test('coalesces a query changed and restored in the same flush without getting stuck pending', async () => {
  const provider = vi.fn(async () => ({ items: [items[0]], total: 80 }))
  const wrapper = fixture({
    mode: 'server',
    dataProvider: provider,
    filterDebounce: 0,
  })
  await flushPromises()
  wrapper.vm.setFilters({ name: { operator: 'eq', value: 'temporary' } })
  wrapper.vm.setFilters({})
  await flushPromises()
  expect(provider).toHaveBeenCalledTimes(2)
  expect(wrapper.vm.loading).toBe(false)
  expect(wrapper.emitted('options-change')).toBeUndefined()
})

test('current errors clear rows, retry uses the accepted query, and malformed responses are validated', async () => {
  const provider = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ items: [items[1]], total: 1 })
    .mockResolvedValueOnce({ items: [null], total: 1 })
  const wrapper = fixture({ mode: 'server', dataProvider: provider })
  await flushPromises()
  expect(wrapper.vm.rows).toEqual([])
  expect(wrapper.emitted('load-error')).toHaveLength(1)
  await wrapper.vm.exposed.refresh()
  expect(wrapper.vm.rows).toEqual([items[1]])
  expect(wrapper.vm.error).toBeNull()
  await wrapper.vm.exposed.refresh()
  expect(wrapper.vm.error).toBeInstanceOf(TypeError)
  expect(wrapper.vm.rows).toEqual([])
})

test('consumer request mutation cannot change accepted paging or lifecycle snapshots', async () => {
  const provider = vi.fn(async (request: DataProviderRequest) => {
    request.page = 999
    return { items: [items[0]], total: 1 }
  })
  const wrapper = fixture({ mode: 'server', dataProvider: provider })
  await flushPromises()
  expect(wrapper.vm.rows).toEqual([items[0]])
  expect(wrapper.vm.state.page).toBe(1)
  expect(wrapper.emitted('load-success')?.[0]).toMatchObject([
    { request: { page: 1 } },
  ])
})

test('corrects out-of-range pages once and does not loop when a controlled parent refuses', async () => {
  const local = fixture({ page: 8, items: [items[0]] })
  await nextTick()
  expect(local.emitted('update:page')).toEqual([[1]])
  expect(local.vm.rows).toEqual([])
  const provider = vi.fn(async () => ({ items: [], total: 2 }))
  const remote = fixture({ mode: 'server', page: 8, dataProvider: provider })
  await flushPromises()
  expect(provider).toHaveBeenCalledTimes(1)
  expect(remote.emitted('update:page')).toEqual([[1]])
  const accepted = controlled({
    mode: 'server',
    page: 8,
    dataProvider: provider,
  })
  await flushPromises()
  expect(accepted.models.page).toBe(1)
  expect(provider).toHaveBeenCalledTimes(3)
})

test('preserves off-page selection, emits displayed selected rows only, and clears on row-key change', async () => {
  const wrapper = fixture({ selectable: true })
  wrapper.vm.selectRow(items[0], true)
  await nextTick()
  wrapper.vm.setPage(2)
  await nextTick()
  wrapper.vm.selectRow(items[25], true)
  await nextTick()
  expect(wrapper.vm.state.selectedKeys).toEqual([0, 25])
  const events = wrapper.emitted('selection-change')
  expect(events?.at(-1)).toEqual([{ keys: [0, 25], rows: [items[25]] }])
  await wrapper.setProps({ rowKey: (row) => `new:${row.id}` })
  await nextTick()
  expect(wrapper.vm.state.selectedKeys).toEqual([])
})

test('disposal aborts requests, removes debounce work, and emits nothing after unmount', async () => {
  vi.useFakeTimers()
  const pending = deferred<NormalizedData<FixtureRow>>()
  const provider = vi.fn((request: DataProviderRequest) => {
    expect(request.signal).toBeDefined()
    return pending.promise
  })
  const wrapper = fixture({
    mode: 'server',
    dataProvider: provider,
    filterDebounce: 100,
  })
  wrapper.vm.setFilters({ name: { operator: 'eq', value: 'waiting' } })
  await nextTick()
  const success = wrapper.emitted('load-success')?.length ?? 0
  wrapper.unmount()
  await vi.advanceTimersByTimeAsync(200)
  pending.resolve({ items: [items[0]], total: 1 })
  await flushPromises()
  expect(provider).toHaveBeenCalledTimes(1)
  expect(wrapper.emitted('load-success')?.length ?? 0).toBe(success)
  expect(wrapper.emitted('load-error')).toBeUndefined()
})
