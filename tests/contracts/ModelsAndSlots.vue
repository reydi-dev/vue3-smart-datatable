<script setup lang="ts">
import { ref } from 'vue'
import type { FilterState, RowKey, RowClick, SortState } from '../../src'
import { SmartDataTable } from '../../src'
import { columns, orders, type Order } from './consumer'

const selection = ref<readonly RowKey[]>([])
const page = ref(1)
const itemsPerPage = ref(25)
const sort = ref<SortState | null>(null)
const filters = ref<FilterState>({})
const visibleColumns = ref<readonly string[]>([])
const lastName = ref('')
function onRowClick(payload: RowClick<Order>) {
  lastName.value = payload.row.name.toUpperCase()
}
</script>

<template>
  <SmartDataTable
    v-model="selection"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    v-model:sort="sort"
    v-model:filters="filters"
    v-model:visible-columns="visibleColumns"
    :columns="columns"
    :items="orders"
    row-clickable
    @row-click="onRowClick"
  >
    <template #header="{ column }">{{ column.label }}</template>
    <template #cell="{ row, rowIndex }"
      >{{ row.name.toUpperCase() }} {{ rowIndex }}</template
    >
    <template #cell.name="{ row }">{{ row.amount.toFixed(2) }}</template>
    <template #mobile-summary="{ row, rowKey, disabled }"
      ><span :aria-disabled="disabled"
        >{{ row.name.toUpperCase() }} {{ rowKey }}</span
      ></template
    >
    <template #mobile-details="{ row, rowIndex, columns: detailColumns }"
      >{{ row.amount.toFixed(2) }} {{ rowIndex }}
      {{ detailColumns.length }}</template
    >
  </SmartDataTable>
  <p>{{ lastName }}</p>
</template>
