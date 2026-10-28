import { flushPromises, mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, expect, test, vi } from 'vitest'
import SmartDataTable from '../../src/components/SmartDataTable.vue'
import type {
  DataTableColumn,
  MobileSlotContext,
  SmartDataTableExpose,
} from '../../src'
interface Row {
  id: number
  name: string
  status: string
  notes: string
}
const columns: DataTableColumn<Row>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    filterable: true,
    mobile: { summary: true, order: 2 },
  },
  { key: 'status', label: 'Status', mobile: { summary: true, order: 1 } },
  { key: 'notes', label: 'Notes', type: 'expandable-text' },
]
const items: Row[] = Array.from({ length: 30 }, (_, id) => ({
  id,
  name: `Record ${id}`,
  status: 'Active',
  notes: 'Long note '.repeat(30),
}))
const mounted: ReturnType<typeof mount>[] = []
const initialWidth = window.innerWidth
function resize(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
    writable: true,
  })
  window.dispatchEvent(new Event('resize'))
}
function api(w: ReturnType<typeof mount>) {
  return w.vm as unknown as SmartDataTableExpose
}
afterEach(() => {
  for (const w of mounted.splice(0)) w.unmount()
  resize(initialWidth)
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

test('switches strictly below the boundary without resetting query/selection and removes its observer', async () => {
  resize(960)
  const add = vi.spyOn(window, 'addEventListener'),
    remove = vi.spyOn(window, 'removeEventListener')
  const w = mount(SmartDataTable<Row>, {
    props: { columns, items, selectable: true, filterDebounce: 0 },
  })
  mounted.push(w)
  await nextTick()
  expect(w.find('table').exists()).toBe(true)
  await w.get('[aria-expanded]').trigger('click')
  await w.get('.sdt-filter input').setValue('Record')
  await w.get('tbody input').setValue(true)
  await w.get('th button').trigger('click')
  await w.get('[aria-label="Next page"]').trigger('click')
  const before = api(w).getState()
  resize(959)
  await nextTick()
  expect(w.find('table').exists()).toBe(false)
  expect(w.findAll('article')).toHaveLength(5)
  expect(api(w).getState()).toEqual(before)
  expect(w.get('.sdt-mobile').attributes('sort')).toBeUndefined()
  const disclosure = w.get('.sdt-mobile__disclosure')
  ;(disclosure.element as HTMLDetailsElement).open = true
  await disclosure.trigger('toggle')
  resize(960)
  await nextTick()
  resize(375)
  await nextTick()
  expect(w.get('.sdt-mobile__disclosure').element).toHaveProperty('open', true)
  expect(api(w).getState()).toEqual(before)
  await w.setProps({ mobileBreakpoint: 375 })
  expect(w.find('table').exists()).toBe(true)
  await w.setProps({ mobileBreakpoint: 376 })
  expect(w.find('.sdt-mobile').exists()).toBe(true)
  const resizeListener = add.mock.calls.find(([name]) => name === 'resize')![1]
  w.unmount()
  mounted.pop()
  expect(remove).toHaveBeenCalledWith('resize', resizeListener)
})

test('keeps reference summary ordering/limits, readable details and guarded mobile clicks/actions', async () => {
  resize(375)
  const w = mount(SmartDataTable<Row>, {
    props: {
      columns,
      items: items.slice(0, 1),
      rowClickable: true,
      selectable: true,
      actions: [{ key: 'view', label: 'View' }],
    },
  })
  mounted.push(w)
  await nextTick()
  expect(
    w.findAll('.sdt-mobile__summary-field small').map((x) => x.text()),
  ).toEqual(['Status', 'Name'])
  await w.get('.sdt-cell').trigger('click')
  expect(w.emitted('cell-click')).toHaveLength(1)
  expect(w.emitted('row-click')).toHaveLength(1)
  expect(w.emitted('cell-click')![0][0]).toMatchObject({
    mobile: true,
    rowKey: 0,
  })
  await w.get('[aria-label="Open row 1"]').trigger('click')
  expect(w.emitted('row-click')).toHaveLength(2)
  await w.get('input[type="checkbox"]').setValue(true)
  expect(w.emitted('row-click')).toHaveLength(2)
  await w.get('.sdt-mobile__actions button').trigger('click')
  expect(w.emitted('row-action')).toHaveLength(1)
  expect(w.emitted('row-click')).toHaveLength(2)
  expect(w.get('.sdt-mobile__field--full').text()).toContain('Long note')
  expect(w.find('.sdt-cell__preview').exists()).toBe(false)
  await w.setProps({ disabled: true })
  await w.get('.sdt-mobile__open').trigger('click')
  await w.get('.sdt-cell').trigger('click')
  expect(w.emitted('row-click')).toHaveLength(2)
  expect(
    w.get('.sdt-mobile__disclosure summary').attributes('tabindex'),
  ).not.toBe('-1')
  await w.setProps({ mobileSummaryLimit: 1 })
  expect(w.findAll('.sdt-mobile__summary-field')).toHaveLength(1)
})

test('forwards complete mobile slot contexts and dynamic specific cell slots', async () => {
  resize(375)
  const summary = vi.fn((c: MobileSlotContext<Row>) =>
    h(
      'b',
      `Summary ${c.rowKey} ${c.rowIndex} ${c.disabled} ${c.columns.map((x) => x.key)}`,
    ),
  )
  const details = vi.fn((c: MobileSlotContext<Row>) =>
    h('b', `Details ${c.row.name} ${c.disabled}`),
  )
  const w = mount(SmartDataTable<Row>, {
    props: { columns, items: items.slice(0, 1), disabled: true },
    slots: { 'mobile-summary': summary, 'mobile-details': details },
  })
  mounted.push(w)
  await nextTick()
  expect(w.text()).toContain('Summary 0 0 true status,name')
  expect(w.text()).toContain('Details Record 0 true')
  expect(summary.mock.calls[0][0]).toMatchObject({
    row: items[0],
    rowKey: 0,
    disabled: true,
  })
  const cells = mount(SmartDataTable<Row>, {
    props: { columns, items: items.slice(0, 1) },
    slots: {
      'cell.name': ({ row, mobile }: { row: Row; mobile: boolean }) =>
        h('span', `Specific ${row.id} ${mobile}`),
    },
  })
  mounted.push(cells)
  await nextTick()
  expect(cells.get('.sdt-mobile__summary').text()).toContain('Specific 0 true')
})

test('hydrates the identical desktop shell at a narrow viewport then switches after mount without mismatch', async () => {
  resize(375)
  const props = { columns, items: items.slice(0, 1), selectable: true }
  const html = await renderToString(createSSRApp(SmartDataTable<Row>, props))
  expect(html).toContain('sdt-desktop__table')
  expect(html).not.toContain('sdt-mobile__row')
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  const warn = vi.spyOn(console, 'warn'),
    error = vi.spyOn(console, 'error')
  const app = createSSRApp(SmartDataTable<Row>, props)
  try {
    app.mount(host)
    await flushPromises()
    expect(host.querySelector('.sdt-mobile')).not.toBeNull()
    expect(
      [...warn.mock.calls, ...error.mock.calls].flat().join(' '),
    ).not.toMatch(/hydration.*mismatch/i)
  } finally {
    app.unmount()
  }
})
