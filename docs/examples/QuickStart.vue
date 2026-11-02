<script setup lang="ts">
import SmartDataTable from '@reydi-dev/vue3-smart-datatable'
import '@reydi-dev/vue3-smart-datatable/styles.css'
import type { DataTableColumn } from '@reydi-dev/vue3-smart-datatable'
interface Customer {
  id: number
  name: string
  amount: number
}
const items: Customer[] = [
  { id: 1, name: 'Ada Morgan', amount: 125.5 },
  { id: 2, name: 'Jordan Patel', amount: 240 },
]
const columns: DataTableColumn<Customer>[] = [
  { key: 'name', label: 'Customer', sortable: true, filterable: true },
  {
    key: 'amount',
    label: 'Amount',
    type: 'number',
    numberFormat: { style: 'currency', currency: 'USD' },
  },
]
</script>
<template><SmartDataTable :columns="columns" :items="items" /></template>
