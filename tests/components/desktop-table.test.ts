import { flushPromises, mount } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, test, vi } from 'vitest'
import SmartDataTable from '../../src/components/SmartDataTable.vue'
import type {
  CellContext,
  FilterSlotContext,
  ActionSlotContext,
  StateSlotContext,
  DataTableColumn,
  ExporterAdapter,
  RowAction,
  SmartDataTableExpose,
} from '../../src'

type Row = {
  id: number | string
  name: string
  amount: number
  active: boolean
  status: string
}
const items: Row[] = [
  { id: 0, name: 'Zero', amount: 0, active: false, status: 'off' },
  { id: '0', name: 'String zero', amount: 10, active: true, status: 'on' },
  { id: 2, name: 'Last', amount: 20, active: true, status: 'on' },
]
const columns: DataTableColumn<Row>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    filterable: true,
    hideable: false,
  },
  { key: 'amount', label: 'Amount', type: 'number', filterable: true },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    filterable: true,
    options: [
      { label: 'Disabled', value: 'off' },
      { label: 'Enabled', value: 'on' },
    ],
  },
]
const wrappers: ReturnType<typeof mount>[] = []
type MountOptions = NonNullable<
  Parameters<typeof mount<typeof SmartDataTable<Row>>>[1]
>
function table(
  options: Omit<MountOptions, 'props'> & {
    props?: Partial<NonNullable<MountOptions['props']>>
  } = {},
) {
  const w = mount(SmartDataTable<Row>, {
    ...options,
    props: { columns, items, ...options?.props },
  })
  wrappers.push(w)
  return w
}
function api(w: ReturnType<typeof table>) {
  return w.vm as unknown as SmartDataTableExpose
}
afterEach(() => {
  for (const w of wrappers.splice(0)) w.unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('actual desktop table', () => {
  test('uses real defaults, accepts model proposals, preserves typed row keys and validates page input', async () => {
    const w = table({
      props: { selectable: true, pageSizeOptions: [1, 2, 0, -1, 1.5] },
    })
    expect(w.find('.sdt-toolbar').exists()).toBe(true)
    expect(w.find('.sdt-pagination').exists()).toBe(true)
    await w.get('.sdt-pagination__size select').setValue('1')
    expect(w.findAll('tbody tr')).toHaveLength(1)
    await w.get('tbody input').setValue(true)
    await w.get('[aria-label="Next page"]').trigger('click')
    await w.get('tbody input').setValue(true)
    expect(api(w).getState().selectedKeys).toEqual([0, '0'])
    expect(w.get('thead input').element).toHaveProperty('checked', true)
    await w.get('.sdt-pagination__jump input').setValue('۰۳')
    await w.get('form').trigger('submit')
    expect(api(w).getState().page).toBe(3)
    await w.get('.sdt-pagination__jump input').setValue('1.5')
    await w.get('form').trigger('submit')
    expect(w.get('[role="alert"]').text()).toContain('1–3')
    expect(api(w).getState().page).toBe(3)
    await w.get('th button').trigger('click')
    expect(api(w).getState().page).toBe(1)
    expect(w.get('th[aria-sort]').attributes('aria-sort')).toBe('ascending')
    await w.get('th button').trigger('click')
    expect(w.get('th[aria-sort]').attributes('aria-sort')).toBe('descending')
    expect(w.emitted('update:itemsPerPage')).toEqual([[1]])
    expect(w.emitted('update:items-per-page')).toBeUndefined()
  })
  test('runs built-in text, number/range and typed select filters, then resets no-results', async () => {
    const w = table()
    await w.get('[aria-expanded]').trigger('click')
    const filters = w.findAll('.sdt-filter')
    await filters[0].get('input').setValue('missing')
    expect(w.get('[role="status"]').text()).toContain('No matching items')
    await w.get('.sdt-state button').trigger('click')
    expect(w.findAll('tbody tr')).toHaveLength(3)
    await filters[1].get('input').setValue('0')
    expect(api(w).getState().filters.amount.value).toBe(0)
    expect(w.findAll('tbody tr')).toHaveLength(1)
    await filters[1].get('.sdt-filter__clear').trigger('click')
    await filters[1].get('select').setValue('between')
    await filters[1].findAll('input')[0].setValue('5')
    expect(w.findAll('tbody tr')).toHaveLength(3)
    await filters[1].findAll('input')[1].setValue('15')
    expect(w.findAll('tbody tr')).toHaveLength(1)
    await filters[1].get('.sdt-filter__clear').trigger('click')
    await filters[2].findAll('select')[1].setValue('0')
    expect(api(w).getState().filters.status.value).toBe('off')
    expect(w.get('tbody').text()).toContain('Zero')
    await api(w).refresh()
    expect(w.findAll('tbody tr')).toHaveLength(1)
  })
  test('emits once for ordinary cells and keyboard rows, isolates controls and honors explicit activation/disabled', async () => {
    const click = vi.fn(),
      nativeClick = vi.fn()
    const actions: RowAction<Row>[] = [
      { key: 'open', label: 'Open', visible: (r) => r.active },
      { key: 'busy', label: 'Busy', loading: true },
      { key: 'blocked', label: 'Blocked', disabled: (r) => !r.active },
    ]
    const w = table({
      props: {
        columns: [
          ...columns,
          { key: 'name-copy', field: 'name', label: 'Copy', type: 'copy' },
        ],
        actions,
        selectable: true,
        onRowClick: click,
        onClick: nativeClick,
      },
    })
    await w.get('.sdt-cell').trigger('click')
    expect(click).not.toHaveBeenCalled()
    expect(nativeClick).toHaveBeenCalledTimes(1)
    await w.setProps({ rowClickable: true })
    await w.get('.sdt-cell').trigger('click')
    expect(click).toHaveBeenCalledTimes(1)
    expect(w.emitted('cell-click')).toHaveLength(2)
    await w.get('tbody tr').trigger('keydown', { key: 'Enter' })
    await w.get('tbody tr').trigger('keydown', { key: ' ' })
    expect(click).toHaveBeenCalledTimes(3)
    await w.get('tbody input').setValue(true)
    await w.findAll('tbody tr')[1].findAll('.sdt-action')[0].trigger('click')
    expect(w.emitted('row-action')).toHaveLength(1)
    expect(w.emitted('row-action')![0][0]).toMatchObject({
      rowKey: '0',
      action: { key: 'open' },
    })
    await w.get('.sdt-cell__icon-button').trigger('click')
    expect(click).toHaveBeenCalledTimes(3)
    await w.setProps({ disabled: true })
    await w.get('.sdt-cell').trigger('click')
    await w.get('tbody tr').trigger('keydown', { key: 'Enter' })
    expect(click).toHaveBeenCalledTimes(3)
    expect(
      w
        .findAll('button,input,select')
        .filter((e) => e.attributes('disabled') === undefined),
    ).toHaveLength(1) // Dialog close is always available.
    expect(w.get('tbody tr').attributes('tabindex')).toBeUndefined()
  })
  test('renders every cell kind safely, treats false/zero as data and handles clipboard/expansion', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    type CellRow = { id: number } & Record<string, unknown>
    const types = [
      'text',
      'number',
      'boolean',
      'date',
      'select',
      'chip',
      'icon',
      'image',
      'link',
      'copy',
      'expandable-text',
      'custom',
    ] as const
    const cols: DataTableColumn<CellRow>[] = types.map((type) => ({
      key: type,
      label: type,
      type,
      ...(type === 'select'
        ? { options: [{ label: 'Zero option', value: 0 }] }
        : {}),
    }))
    const row: CellRow = {
      id: 1,
      text: '<img src=x onerror=alert(1)>',
      number: 0,
      boolean: false,
      date: '2026-01-02',
      select: 0,
      chip: 'Tag',
      icon: { path: ['M0 0h10', 'M1 1v8'], viewBox: '0 0 10 10' },
      image: 'https://example.com/avatar.png',
      link: 'javascript:alert(1)',
      copy: 'Copy me',
      'expandable-text': 'Long note',
      custom: 'Fallback',
    }
    const w = mount(SmartDataTable<CellRow>, {
      props: { columns: cols, items: [row] },
    })
    wrappers.push(w)
    expect(w.findAll('tbody td')).toHaveLength(12)
    expect(w.findAll('img')).toHaveLength(1)
    expect(w.find('a').exists()).toBe(false)
    expect(w.text()).toContain('<img src=x onerror=alert(1)>')
    expect(w.text()).toContain('Zero option')
    expect(w.find('[aria-label="False"]').exists()).toBe(true)
    expect(w.findAll('svg[viewBox="0 0 10 10"] path')).toHaveLength(2)
    await w.get('[aria-label="Copy"]').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('Copy me')
    expect(w.text()).toContain('Copied')
    await w.get('[aria-label="Show full text"]').trigger('click')
    expect(
      w.get('[aria-label="Hide full text"]').attributes('aria-expanded'),
    ).toBe('true')
    await w.setProps({
      items: [{ ...row, link: 'https://example.com', icon: 'mdi-check' }],
    })
    expect(w.get('a').attributes('rel')).toBe('noopener noreferrer')
    expect(w.find('svg[viewBox="0 0 10 10"]').exists()).toBe(false)
    await w.setProps({ disabled: true })
    expect(w.find('a').exists()).toBe(false)
  })
  test('forwards specific slots before generic slots, filter setters/action triggers and replacement regions', async () => {
    const w = table({
      props: {
        actions: [{ key: 'open', label: 'Open' }],
        rowClass: (row, index) => [{ highlight: row.id === 0 }, `row-${index}`],
      },
      slots: {
        header: ({ column }: { column: DataTableColumn<Row> }) =>
          h('span', `Generic ${column.key}`),
        'header.name': () => h('b', 'Specific header'),
        cell: ({ value }: CellContext<Row>) =>
          h('span', `Generic ${String(value)}`),
        'cell.name': (context: CellContext<Row>) =>
          h(
            'b',
            `${context.row.name}:${context.rowKey}:${context.rowIndex}:${context.mobile}`,
          ),
        'filter.name': ({ setClause, disabled }: FilterSlotContext<Row>) =>
          h(
            'button',
            {
              disabled,
              onClick: () => setClause({ operator: 'eq', value: 'Zero' }),
            },
            'Custom filter',
          ),
        'action.open': ({ trigger, row, disabled }: ActionSlotContext<Row>) =>
          h(
            'button',
            { disabled, onClick: trigger },
            `Custom action ${row.id}`,
          ),
      },
    })
    expect(w.get('th').text()).toBe('Specific header')
    expect(w.get('tbody').text()).toContain('Zero:0:0:false')
    expect(w.get('tbody tr').classes()).toContain('highlight')
    await w.get('tbody button').trigger('click')
    expect(w.emitted('row-action')).toHaveLength(1)
    expect(w.emitted('row-click')).toBeUndefined()
    await w.get('[aria-expanded]').trigger('click')
    await w.get('.sdt-filter button').trigger('click')
    expect(api(w).getState().filters.name.value).toBe('Zero')
    expect(w.findAll('tbody tr')).toHaveLength(1)
    const custom = ref(true)
    const dynamic = mount({
      setup: () => () =>
        h(
          SmartDataTable<Row>,
          { columns, items },
          custom.value ? { 'cell.name': () => h('b', 'Dynamic cell') } : {},
        ),
    })
    wrappers.push(dynamic)
    expect(dynamic.get('tbody').text()).toContain('Dynamic cell')
    custom.value = false
    await nextTick()
    expect(dynamic.get('tbody').text()).not.toContain('Dynamic cell')
    expect(dynamic.get('tbody').text()).toContain('Zero')
    const replacement = table({
      props: {
        actions: [{ key: 'open', label: 'Open' }],
        showToolbar: false,
        showPagination: false,
        columnVisibility: false,
      },
      slots: {
        toolbar: ({ state }: StateSlotContext) =>
          h('p', `Toolbar page ${state.page}`),
        footer: () => h('p', 'Custom footer'),
        'row-actions': () => h('span', 'Custom row actions'),
      },
    })
    expect(replacement.text()).toContain('Toolbar page 1')
    expect(replacement.text()).toContain('Custom footer')
    expect(replacement.get('tbody').text()).toContain('Custom row actions')
    expect(replacement.find('.sdt-pagination').exists()).toBe(false)
    expect(replacement.find('dialog').exists()).toBe(false)
  })
  test('opens/applies/resets column choices while retaining mandatory columns', async () => {
    const w = table({ attachTo: document.body })
    await w.get('[aria-haspopup="dialog"]').trigger('click')
    expect(w.get('dialog').attributes()).toHaveProperty('open')
    await w.get('dialog input').setValue(false)
    await w.get('dialog .sdt-control--primary').trigger('click')
    await flushPromises()
    expect(api(w).getState().visibleColumns).toEqual(['name', 'status'])
    expect(w.find('dialog[open]').exists()).toBe(false)
    await api(w).resetColumnVisibility()
    await nextTick()
    expect(api(w).getState().visibleColumns).toEqual([
      'name',
      'amount',
      'status',
    ])
    const keys = Object.keys((w.vm.$ as unknown as { exposed: object }).exposed)
    expect(keys.sort()).toEqual(
      [
        'refresh',
        'resetFilters',
        'clearSelection',
        'resetColumnVisibility',
        'exportData',
        'getState',
      ].sort(),
    )
  })
  test('shows provider loading/error/retry ahead of rows and disables pagination during transitions', async () => {
    let resolve!: (value: unknown) => void
    const provider = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolve = r
          }),
      )
    const w = table({
      props: { mode: 'server', dataProvider: provider, filterDebounce: 0 },
    })
    await flushPromises()
    expect(w.get('[role="alert"]').text()).toContain('Unable to load data')
    await w.get('.sdt-state button').trigger('click')
    expect(w.get('[role="status"]').text()).toContain('Loading data')
    expect(w.get('.sdt-pagination select').attributes()).toHaveProperty(
      'disabled',
    )
    resolve({ items, total: 3 })
    await flushPromises()
    expect(w.findAll('tbody tr')).toHaveLength(3)
    await w.setProps({ loading: true })
    expect(w.find('table').exists()).toBe(false)
    expect(w.attributes('aria-busy')).toBe('true')
  })
  test('uses export menu, progress and recoverable error without unhandled rejections', async () => {
    let complete!: () => void
    const exporter: ExporterAdapter<Row> = {
      key: 'test',
      label: 'Test export',
      scopes: ['current'],
      export: vi.fn(async (context) => {
        context.reportProgress(40)
        await new Promise<void>((r) => {
          complete = r
        })
      }),
    }
    const w = table({ props: { exporters: [exporter] } })
    await w.get('.sdt-export > button').trigger('click')
    await w.get('.sdt-export__panel button').trigger('click')
    expect(w.get('progress').attributes('value')).toBe('40')
    complete()
    await flushPromises()
    expect(w.find('progress').exists()).toBe(false)
    expect(w.emitted('export-success')).toHaveLength(1)
    exporter.export = vi.fn().mockRejectedValue(new Error('denied'))
    await w.get('.sdt-export > button').trigger('click')
    await w.get('.sdt-export__panel button').trigger('click')
    await flushPromises()
    expect(w.get('[role="alert"]').text()).toContain('Unable to export data')
    expect(w.emitted('export-error')).toHaveLength(1)
  })
})
