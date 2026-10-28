<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SmartDataTable, {
  SmartDataTable as NamedTable,
  createCsvExporter,
  createLocalStoragePersistenceAdapter,
} from '@reydi-dev/vue3-smart-datatable'
import type {
  FilterState,
  RowKey,
  RowActionEvent,
  RowClick,
  SortState,
  SmartDataTableExpose,
} from '@reydi-dev/vue3-smart-datatable'
import { items, columns, actions, type Customer } from './data.js'
if (SmartDataTable !== NamedTable)
  throw new Error('Default and named component differ')
const selection = ref<readonly RowKey[]>([]),
  page = ref(1),
  size = ref(10),
  sort = ref<SortState | null>(null),
  filters = ref<FilterState>({}),
  visible = ref<readonly string[]>(['id', 'name', 'balance'])
const table = ref<SmartDataTableExpose>()
const feedback = ref('Ready'),
  mounted = ref(false)
const exporters = [
  createCsvExporter<Customer>({ fileName: 'packed-customers' }),
]
const persistence = createLocalStoragePersistenceAdapter({
  prefix: 'packed-consumer:',
})
function onRowClick(payload: RowClick<Customer>) {
  feedback.value = `Opened ${payload.row.name}`
}
function onAction(payload: RowActionEvent<Customer>) {
  feedback.value = `${payload.action.label}: ${payload.row.name}`
}
// Used to distinguish inert SSR markup from completed client hydration in browser checks.
onMounted(() => {
  mounted.value = true
})
</script>
<template>
  <main :data-hydrated="mounted">
    <h1>Installed package preview</h1>
    <p>Production build from an independently installed npm tarball.</p>
    <SmartDataTable
      ref="table"
      v-model="selection"
      v-model:page="page"
      v-model:items-per-page="size"
      v-model:sort="sort"
      v-model:filters="filters"
      v-model:visible-columns="visible"
      :columns="columns"
      :items="items"
      :actions="actions"
      :exporters="exporters"
      :persistence-adapter="persistence"
      persistence-key="columns"
      selectable
      row-clickable
      @row-click="onRowClick"
      @row-action="onAction"
    >
      <template #toolbar-prepend
        ><strong>Customers</strong
        ><span>{{ selection.length }} selected</span></template
      >
      <template #cell.name="{ row, formattedValue, mobile }"
        ><span class="customer-name" :data-mobile="mobile"
          >{{ row.name }} · {{ formattedValue }}</span
        ></template
      >
    </SmartDataTable>
    <p class="feedback" role="status">{{ feedback }}</p>
    <button type="button" @click="table?.clearSelection()">
      Clear selection through ref
    </button>
  </main>
</template>
<style>
body {
  font-family: system-ui, sans-serif;
  background: #f5f7f6;
  color: #24312e;
  margin: 0;
}
main {
  max-width: 1100px;
  padding: 24px;
  margin: auto;
}
h1 {
  font-size: 26px;
}
.feedback {
  color: #087c63;
}
main > button {
  padding: 8px 12px;
  font: inherit;
}
</style>
