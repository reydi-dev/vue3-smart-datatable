<script setup lang="ts">
import { ref } from 'vue'
import SmartDataTable from '@reydi-dev/vue3-smart-datatable'
import '@reydi-dev/vue3-smart-datatable/styles.css'
import type {
  FilterState,
  RowKey,
  SortState,
  SmartDataTableExpose,
} from '@reydi-dev/vue3-smart-datatable'
import { customers, columns } from './data.js'
const selected = ref<readonly RowKey[]>([])
const page = ref(1),
  itemsPerPage = ref(10)
const sort = ref<SortState | null>(null),
  filters = ref<FilterState>({})
const visibleColumns = ref<readonly string[]>([
  'name',
  'email',
  'amount',
  'status',
])
const table = ref<SmartDataTableExpose>()
</script>
<template>
  <button type="button" @click="table?.refresh()">Refresh</button
  ><SmartDataTable
    ref="table"
    v-model="selected"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    v-model:sort="sort"
    v-model:filters="filters"
    v-model:visible-columns="visibleColumns"
    :columns="columns"
    :items="customers"
    selectable
    row-clickable
    ><template #cell.name="{ row }">{{ row.name }}</template></SmartDataTable
  >
</template>
