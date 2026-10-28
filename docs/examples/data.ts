import type { DataTableColumn } from '@reydi-dev/vue3-smart-datatable'
export interface Customer {
  id: number
  name: string
  email: string
  amount: number
  status: string
}
export const customers: readonly Customer[] = Array.from(
  { length: 32 },
  (_, i) => ({
    id: i + 1,
    name:
      ['Ada Morgan', 'Jordan Patel', 'Riley Park', 'Morgan Silva'][i % 4] +
      ` ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    amount: (i + 1) * 125.5,
    status: i % 2 ? 'review' : 'active',
  }),
)
export const columns: readonly DataTableColumn<Customer>[] = [
  {
    key: 'name',
    label: 'Customer',
    sortable: true,
    filterable: true,
    hideable: false,
    mobile: { summary: true, order: 0 },
  },
  { key: 'email', label: 'Email', type: 'copy' },
  {
    key: 'amount',
    label: 'Amount',
    type: 'number',
    sortable: true,
    align: 'end',
    numberFormat: { style: 'currency', currency: 'USD' },
    mobile: { summary: true, order: 1 },
  },
  { key: 'status', label: 'Status', type: 'chip' },
]
