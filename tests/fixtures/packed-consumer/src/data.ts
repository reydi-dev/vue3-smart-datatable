import type {
  DataTableColumn,
  RowAction,
} from '@reydi-dev/vue3-smart-datatable'
export interface Customer {
  id: number
  name: string
  balance: number
}
export const items: readonly Customer[] = Array.from(
  { length: 32 },
  (_, id) => ({
    id,
    name: `Customer ${String(id).padStart(2, '0')}`,
    balance: id * 12.5,
  }),
)
export const columns: readonly DataTableColumn<Customer>[] = [
  { key: 'id', label: 'ID', type: 'number', sortable: true },
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    filterable: true,
    hideable: false,
    formatter: (_value, row) => row.name.toUpperCase(),
  },
  {
    key: 'balance',
    label: 'Balance',
    type: 'number',
    sortable: true,
    numberFormat: { style: 'currency', currency: 'USD' },
  },
]
export const actions: readonly RowAction<Customer>[] = [
  { key: 'view', label: 'View' },
]
