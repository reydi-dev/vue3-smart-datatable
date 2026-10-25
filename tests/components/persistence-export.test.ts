import { afterEach, expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import StateHarness from './StateHarness.vue'
import type { FixtureRow } from './state-fixture.js'
import { createCsvExporter } from '../../src/adapters/exporters/csv.js'
import type {
  DataProviderRequest,
  ExporterContext,
  NormalizedData,
  PersistedColumnState,
  PersistenceAdapter,
  SmartDataTableProps,
} from '../../src/types/index.js'

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name' },
]
const items: FixtureRow[] = [
  { id: 0, name: 'Alpha' },
  { id: 1, name: 'Beta' },
]
const cleanups: Array<() => void> = []
afterEach(() => {
  for (const stop of cleanups.splice(0)) stop()
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
  const promise = new Promise<T>((yes) => {
    resolve = yes
  })
  return { promise, resolve }
}
function adapter(load: PersistenceAdapter['load']): PersistenceAdapter {
  return { load, save: vi.fn(async () => {}), remove: vi.fn(async () => {}) }
}

test('late visibility restores cannot overwrite user or controlled-parent intent', async () => {
  const saved = deferred<PersistedColumnState | null>()
  const storage = adapter(() => saved.promise)
  const wrapper = fixture({
    persistenceAdapter: storage,
    persistenceKey: 'table',
  })
  await wrapper.vm.setVisibleColumns(['id'])
  saved.resolve({ version: 1, visibleColumns: ['name'] })
  await flushPromises()
  expect(wrapper.vm.state.visibleColumns).toEqual(['id'])
  const parentSaved = deferred<PersistedColumnState | null>()
  await wrapper.setProps({
    persistenceKey: 'parent',
    persistenceAdapter: adapter(() => parentSaved.promise),
  })
  await wrapper.setProps({ visibleColumns: [] })
  parentSaved.resolve({ version: 1, visibleColumns: ['id'] })
  await flushPromises()
  expect(wrapper.vm.state.visibleColumns).toEqual([])
})

test('replacing the persistence key ignores an older restore and applies only the current saved state', async () => {
  const old = deferred<PersistedColumnState | null>()
  const fresh = deferred<PersistedColumnState | null>()
  const storage = adapter((key) =>
    key === 'old' ? old.promise : fresh.promise,
  )
  const wrapper = fixture({
    persistenceAdapter: storage,
    persistenceKey: 'old',
  })
  await wrapper.setProps({ persistenceKey: 'new' })
  fresh.resolve({ version: 1, visibleColumns: ['name'] })
  old.resolve({ version: 1, visibleColumns: ['id'] })
  await flushPromises()
  expect(wrapper.vm.state.visibleColumns).toEqual(['name'])
  expect(wrapper.emitted('update:visibleColumns')).toBeUndefined()
  expect(wrapper.emitted('column-visibility-change')).toBeUndefined()
})

test('serializes asynchronous writes so an old completion cannot become the final persisted columns', async () => {
  const first = deferred<void>()
  const written: Array<readonly string[]> = []
  let calls = 0
  const save = vi.fn(async (_key: string, state: PersistedColumnState) => {
    if (++calls === 1) await first.promise
    written.push(state.visibleColumns)
  })
  const storage: PersistenceAdapter = {
    load: async () => null,
    save,
    remove: async () => {},
  }
  const wrapper = fixture({
    persistenceAdapter: storage,
    persistenceKey: 'table',
  })
  const oldSave = wrapper.vm.setVisibleColumns(['id'])
  await flushPromises()
  const newSave = wrapper.vm.setVisibleColumns(['name'])
  await flushPromises()
  expect(save).toHaveBeenCalledTimes(1)
  first.resolve()
  await Promise.all([oldSave, newSave])
  expect(written).toEqual([['id'], ['name']])
})

test('reset respects newer intent while removal is pending; unchanged defaults are still persisted', async () => {
  const removal = deferred<void>()
  const storage: PersistenceAdapter = {
    load: async () => null,
    save: vi.fn(async () => {}),
    remove: vi.fn(() => removal.promise),
  }
  const wrapper = fixture({
    persistenceAdapter: storage,
    persistenceKey: 'table',
  })
  const reset = wrapper.vm.exposed.resetColumnVisibility()
  await nextTick()
  const change = wrapper.vm.setVisibleColumns(['name'])
  removal.resolve()
  await Promise.all([reset, change])
  expect(wrapper.vm.state.visibleColumns).toEqual(['name'])
  await wrapper.vm.exposed.resetColumnVisibility()
  expect(wrapper.vm.state.visibleColumns).toEqual(['id', 'name'])
  expect(storage.save).toHaveBeenLastCalledWith('table', {
    version: 1,
    visibleColumns: ['id', 'name'],
  })
  const savedCount = vi.mocked(storage.save).mock.calls.length
  await wrapper.vm.exposed.resetColumnVisibility()
  expect(storage.save).toHaveBeenCalledTimes(savedCount + 1)
})

test('schema changes keep mandatory columns, add new default-visible columns only when uncontrolled, and clear removed sort', async () => {
  const wrapper = fixture()
  await wrapper.vm.setVisibleColumns([])
  wrapper.vm.setSort('id')
  await nextTick()
  await wrapper.setProps({
    columns: [
      { key: 'name', label: 'Name', hideable: false },
      { key: 'extra', label: 'Extra' },
    ],
  })
  expect(wrapper.vm.state.visibleColumns).toEqual(['name', 'extra'])
  expect(wrapper.vm.state.sort).toBeNull()
  await wrapper.setProps({ visibleColumns: [] })
  await wrapper.setProps({
    columns: [
      { key: 'name', label: 'Name', hideable: false },
      { key: 'extra', label: 'Extra' },
      { key: 'third', label: 'Third' },
    ],
  })
  expect(wrapper.vm.state.visibleColumns).toEqual(['name'])
  await wrapper.setProps({ columns: [...columns] })
  expect(wrapper.vm.state.sort).toBeNull()
})

test('exports all server results with a fixed query while live filters/page change, without navigating the table', async () => {
  const gate = deferred<void>()
  const exportRequests: DataProviderRequest[] = []
  const provider = vi.fn(async (request: DataProviderRequest) => {
    if (request.reason === 'export') {
      exportRequests.push(request)
      if (request.page === 1) await gate.promise
    }
    const start = (request.page - 1) * request.itemsPerPage
    return {
      items: items.slice(start, start + request.itemsPerPage),
      total: items.length,
    }
  })
  const download = vi.fn()
  const wrapper = fixture({
    mode: 'server',
    dataProvider: provider,
    exporters: [createCsvExporter<FixtureRow>({ pageSize: 1, download })],
    filterDebounce: 0,
  })
  await flushPromises()
  await wrapper.vm.setVisibleColumns(['name'])
  const pending = wrapper.vm.exposed.exportData('csv', 'all')
  await flushPromises()
  await wrapper.vm.setVisibleColumns(['id'])
  wrapper.vm.setFilters({ name: { operator: 'eq', value: 'new' } })
  await flushPromises()
  gate.resolve()
  await pending
  expect(exportRequests).toHaveLength(2)
  expect(
    exportRequests.every(
      (r) => Object.keys(r.filters).length === 0 && r.reason === 'export',
    ),
  ).toBe(true)
  expect(wrapper.vm.state.filters).toEqual({
    name: { operator: 'eq', value: 'new' },
  })
  expect(wrapper.vm.state.page).toBe(1)
  expect(new TextDecoder().decode(download.mock.calls[0][0])).toBe(
    '"Name"\r\n"Alpha"\r\n"Beta"\r\n',
  )
  expect(wrapper.emitted('export-success')).toHaveLength(1)
  expect(wrapper.vm.exporting).toBe(false)
})

test('concurrent export is rejected, progress is bounded, and source replacement aborts an ignoring adapter promptly', async () => {
  const ignored = deferred<void>()
  let context: ExporterContext<FixtureRow> | undefined
  const wrapper = fixture({
    exporters: [
      {
        key: 'slow',
        label: 'Slow',
        scopes: ['current'],
        export: async (input) => {
          context = input
          await ignored.promise
        },
      },
    ],
  })
  const pending = wrapper.vm.exposed.exportData('slow')
  const aborted = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  expect(wrapper.vm.exporting).toBe(true)
  context?.reportProgress(500)
  expect(wrapper.vm.exportProgress).toBe(100)
  context?.reportProgress(NaN)
  expect(wrapper.vm.exportProgress).toBe(100)
  await expect(wrapper.vm.exposed.exportData('slow')).rejects.toThrow(/already/)
  await wrapper.setProps({ providerContext: { different: true } })
  await aborted
  expect(wrapper.emitted('export-error')).toHaveLength(1)
  expect(wrapper.vm.exportProgress).toBe(0)
  ignored.resolve()
  await flushPromises()
  expect(wrapper.emitted('export-success')).toBeUndefined()
})

test('pending/failed/stale server data cannot be exported; manual refresh and exports still work when disabled', async () => {
  const pending = deferred<NormalizedData<FixtureRow>>()
  const download = vi.fn()
  const wrapper = fixture({
    mode: 'server',
    autoLoad: false,
    disabled: true,
    dataProvider: () => pending.promise,
    exporters: [createCsvExporter<FixtureRow>({ download })],
  })
  await expect(wrapper.vm.exposed.exportData('csv')).rejects.toThrow(/stale/)
  const load = wrapper.vm.exposed.refresh()
  await expect(wrapper.vm.exposed.exportData('csv')).rejects.toThrow(/pending/)
  pending.resolve({ items, total: 2 })
  await load
  await wrapper.vm.exposed.exportData('csv')
  expect(download).toHaveBeenCalledTimes(1)
  await wrapper.setProps({
    filters: { name: { operator: 'eq', value: 'new' } },
  })
  await expect(wrapper.vm.exposed.exportData('csv')).rejects.toThrow(/stale/)
})

test('unmount suppresses late restore/export results and cancels work without emitting late events', async () => {
  const restore = deferred<PersistedColumnState | null>()
  const job = deferred<void>()
  const wrapper = fixture({
    persistenceAdapter: adapter(() => restore.promise),
    persistenceKey: 'table',
    exporters: [
      {
        key: 'slow',
        label: 'Slow',
        scopes: ['current'],
        export: () => job.promise,
      },
    ],
  })
  const pending = wrapper.vm.exposed.exportData('slow')
  const aborted = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  wrapper.unmount()
  restore.resolve({ version: 1, visibleColumns: ['name'] })
  job.resolve()
  await aborted
  await flushPromises()
  expect(wrapper.emitted('export-error')).toBeUndefined()
  expect(wrapper.emitted('export-success')).toBeUndefined()
  expect(wrapper.emitted('column-visibility-change')).toBeUndefined()
})

test('optional async persistence failures do not become table errors or unhandled rejections', async () => {
  const fail = async () => {
    throw new Error('storage blocked')
  }
  const wrapper = fixture({
    persistenceAdapter: { load: fail, save: fail, remove: fail },
    persistenceKey: 'table',
  })
  await flushPromises()
  await wrapper.vm.setVisibleColumns(['id'])
  await wrapper.vm.exposed.resetColumnVisibility()
  expect(wrapper.vm.error).toBeNull()
  expect(wrapper.vm.state.visibleColumns).toEqual(['id', 'name'])
})

test('queued persistence writes do not begin after disposal', async () => {
  const first = deferred<void>()
  const save = vi.fn(() => first.promise)
  const wrapper = fixture({
    persistenceAdapter: {
      load: async () => null,
      save,
      remove: async () => {},
    },
    persistenceKey: 'table',
  })
  const old = wrapper.vm.setVisibleColumns(['id'])
  await flushPromises()
  const fresh = wrapper.vm.setVisibleColumns(['name'])
  await flushPromises()
  expect(save).toHaveBeenCalledTimes(1)
  wrapper.unmount()
  first.resolve()
  await Promise.all([old, fresh])
  expect(save).toHaveBeenCalledTimes(1)
})

test('restoring a key waits for its earlier write before reading saved columns', async () => {
  const write = deferred<void>()
  const stored = new Map<string, PersistedColumnState>([
    ['a', { version: 1, visibleColumns: ['id'] }],
    ['b', { version: 1, visibleColumns: ['id'] }],
  ])
  const storage: PersistenceAdapter = {
    load: async (key) => stored.get(key) ?? null,
    save: async (key, value) => {
      await write.promise
      stored.set(key, value)
    },
    remove: async () => {},
  }
  const wrapper = fixture({ persistenceAdapter: storage, persistenceKey: 'a' })
  await flushPromises()
  const saving = wrapper.vm.setVisibleColumns(['name'])
  await flushPromises()
  await wrapper.setProps({ persistenceKey: 'b' })
  await flushPromises()
  await wrapper.setProps({ persistenceKey: 'a' })
  write.resolve()
  await saving
  await flushPromises()
  expect(wrapper.vm.state.visibleColumns).toEqual(['name'])
})
