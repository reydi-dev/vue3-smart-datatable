import type {
  DataTableColumn,
  DataProvider,
  FilterState,
  SmartDataTableProps,
  SmartDataTableEmits,
  SmartDataTableExpose,
} from '../../src'

export interface Order {
  id: number
  name: string
  amount: number
}

export const orders: readonly Order[] = [{ id: 0, name: 'Sample', amount: 0 }]
export const columns: readonly DataTableColumn<Order>[] = [
  {
    key: 'name',
    label: 'Name',
    field: (row) => row.name,
    formatter: (_value, row) => row.name.toUpperCase(),
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'number',
    field: (row) => row.amount,
  },
]
export const filters: FilterState = { amount: { operator: 'gte', value: 0 } }
export const provider: DataProvider<Order> = async (request) => ({
  items: orders,
  total: orders.length,
  meta: request.context,
})
export const props: SmartDataTableProps<Order> = {
  columns,
  items: orders,
  modelValue: [],
  page: 1,
  itemsPerPage: 25,
  sort: null,
  filters,
  visibleColumns: [],
  rowKey: (row) => row.id,
  dataProvider: provider,
  rowClickable: true,
}

// These checks must fail at the precise incompatible field, not for unrelated setup errors.
export const wrongModel: SmartDataTableProps<Order> = {
  columns,
  // @ts-expect-error Selection keys cannot be booleans.
  modelValue: [true],
}
export const wrongColumn: DataTableColumn<Order> = {
  key: 'amount',
  label: 'Amount',
  // @ts-expect-error Formatter must receive Order, not an unrelated row.
  formatter: (_value, row: { missing: string }) => row.missing,
}
export const wrongBreakpoint: SmartDataTableProps<Order> = {
  columns,
  // @ts-expect-error Legacy Vuetify breakpoint aliases are removed.
  mobileBreakpoint: 'smAndDown',
}
export const wrongEvent: SmartDataTableEmits<Order>['row-click'] = [
  {
    // @ts-expect-error Event rows retain Order all the way through the public map.
    row: { id: 'incorrect', name: 'Sample', amount: 0 },
    rowKey: 0,
    index: 0,
    event: new MouseEvent('click'),
  },
]
// @ts-expect-error A typed provider cannot return rows with a different shape.
export const wrongProvider: DataProvider<Order> = async () => ({
  items: [{ id: false, name: 'Sample', amount: 0 }],
  total: 1,
})

export function verifyExposeSignature(table: SmartDataTableExpose) {
  const refresh: Promise<void> = table.refresh()
  // @ts-expect-error Internal setters are not part of the public ref surface.
  table.setPage(2)
  return refresh
}
