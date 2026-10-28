<script setup lang="ts">
import SmartDataTable from '@reydi-dev/vue3-smart-datatable'
import type {
  DataTableColumn,
  DataProvider,
  SmartDataTableProps,
} from '@reydi-dev/vue3-smart-datatable'
import { columns, items, type Customer } from './data.js'
const column: DataTableColumn<Customer> = {
  key: 'name',
  label: 'Name',
  // @ts-expect-error Formatters must retain the consumer's row interface.
  formatter: (_value, row: { missing: string }) => row.missing,
}
// @ts-expect-error Provider rows must match the consumer row type.
const provider: DataProvider<Customer> = async () => ({
  items: [{ id: false }],
  total: 1,
})
// @ts-expect-error Selection requires string/number keys.
const props: SmartDataTableProps<Customer> = { columns, modelValue: [true] }
void [column, provider, props]
</script>
<template>
  <SmartDataTable :columns="columns" :items="items" page="two" />
  <SmartDataTable :columns="columns" :items="items"
    ><template #cell="{ row }">{{
      row.missingProperty
    }}</template></SmartDataTable
  >
</template>
