<script setup lang="ts">
import { ref } from 'vue'
import SmartDataTable, {
  createCsvExporter,
  createLocalStoragePersistenceAdapter,
} from '../src'
import { processLocalData } from '../src/core/local-data.js'
import type {
  Direction,
  DataTableTheme,
  DataMode,
  DataProviderRequest,
  DataTableColumn,
  RowAction,
  RowKey,
  SmartDataTableExpose,
} from '../src'
interface Customer {
  id: number
  name: string
  email: string
  amount: number
  active: boolean
  joined: string
  status: string
  site: string
  notes: string
  icon: { path: string }
  avatar: string
  reference: string
}
const items: Customer[] = Array.from({ length: 64 }, (_, i) => ({
  id: i + 1,
  name:
    i === 63
      ? 'مشتری نمونه — Riley Park 64'
      : ['Avery Chen', 'Jordan Patel', 'Morgan Silva', 'Riley Park'][i % 4] +
        ` ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  amount: (i + 1) * 125.5,
  active: i % 3 !== 0,
  joined: `2026-10-${String((i % 20) + 1).padStart(2, '0')}`,
  status: i % 2 ? 'review' : 'active',
  site: 'https://example.com',
  notes:
    'A longer customer note that can expand without changing the selected row or navigating away from the table.',
  icon: { path: 'M12 2 3 20h18z' },
  avatar: '/vue3-smart-datatable/avatar.svg',
  reference: `AC-${String(i + 1).padStart(5, '0')}`,
}))
const columns: DataTableColumn<Customer>[] = [
  {
    key: 'name',
    label: 'Customer',
    sortable: true,
    filterable: true,
    hideable: false,
    minWidth: 200,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'copy',
    filterable: true,
    minWidth: 230,
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'number',
    sortable: true,
    filterable: true,
    align: 'end',
    numberFormat: { style: 'currency', currency: 'USD' },
    minWidth: 125,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    filterable: true,
    options: [
      { label: 'Active', value: 'active' },
      { label: 'In review', value: 'review' },
    ],
    minWidth: 120,
  },
  { key: 'active', label: 'Verified', type: 'boolean', align: 'center' },
  {
    key: 'joined',
    label: 'Joined',
    type: 'date',
    sortable: true,
    filterable: true,
    minWidth: 120,
  },
  { key: 'reference', label: 'Reference', type: 'chip', hiddenByDefault: true },
  { key: 'site', label: 'Website', type: 'link', hiddenByDefault: true },
  {
    key: 'notes',
    label: 'Notes',
    type: 'expandable-text',
    hiddenByDefault: true,
    minWidth: 240,
  },
  { key: 'icon', label: 'Icon', type: 'icon', hiddenByDefault: true },
  { key: 'avatar', label: 'Avatar', type: 'image', hiddenByDefault: true },
  { key: 'id', label: 'ID', type: 'custom', hiddenByDefault: true },
]
const actions: RowAction<Customer>[] = [
  { key: 'view', label: 'View', position: 'leading' },
  {
    key: 'archive',
    label: 'Archive',
    position: 'menu',
    disabled: (r) => !r.active,
  },
]
const direction = ref<Direction>('ltr'),
  theme = ref<DataTableTheme>('light')
const table = ref<SmartDataTableExpose>()
const mode = ref<DataMode>('local'),
  selected = ref<readonly RowKey[]>([]),
  page = ref(1),
  size = ref(10),
  disabled = ref(false),
  failNext = ref(false),
  lastAction = ref('No row opened'),
  requests = ref(0)
const exporters = [createCsvExporter<Customer>()]
const persistence = createLocalStoragePersistenceAdapter()
async function provider(request: DataProviderRequest) {
  requests.value++
  await new Promise((resolve) => setTimeout(resolve, 120))
  if (failNext.value) {
    failNext.value = false
    throw new Error('Demonstration failure')
  }
  return processLocalData(
    items,
    columns,
    request.filters,
    request.sort,
    request.page,
    request.itemsPerPage,
  )
}
</script>
<template>
  <main class="demo">
    <header class="demo-header">
      <span class="demo-eyebrow">VUE 3 SMART DATATABLE · DEVELOPMENT</span>
      <h1>Customer directory</h1>
      <p>Local data and a simulated server, using the same table.</p>
    </header>
    <section class="demo-controls" aria-label="Demo settings">
      <label
        >Data source
        <select v-model="mode">
          <option value="local">Local</option>
          <option value="server">Server</option>
        </select></label
      >
      <label
        >Direction
        <select v-model="direction">
          <option value="ltr">LTR</option>
          <option value="rtl">RTL</option>
        </select></label
      >
      <label
        >Theme
        <select v-model="theme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select></label
      >
      <label><input v-model="disabled" type="checkbox" /> Disable table</label>
      <label
        ><input v-model="failNext" type="checkbox" /> Fail next server
        request</label
      >
      <button type="button" @click="table?.refresh()">Refresh data</button>
      <span>Server requests: {{ requests }}</span>
    </section>
    <SmartDataTable
      ref="table"
      v-model="selected"
      v-model:page="page"
      v-model:items-per-page="size"
      :direction="direction"
      :theme="theme"
      :columns="columns"
      :items="items"
      :mode="mode"
      :data-provider="provider"
      :actions="actions"
      :exporters="exporters"
      :persistence-adapter="persistence"
      persistence-key="desktop-demo"
      :disabled="disabled"
      :filter-debounce="100"
      selectable
      row-clickable
      fixed-header
      :height="510"
      @row-click="lastAction = `Opened ${$event.row.name}`"
      @row-action="lastAction = `${$event.action.label}: ${$event.row.name}`"
    >
      <template #toolbar-prepend
        ><strong>Customers</strong
        ><span class="demo-badge"
          >{{ selected.length }} selected</span
        ></template
      >
      <template #cell.name="{ row }"
        ><div class="demo-customer">
          <strong>{{ row.name }}</strong
          ><span>Customer #{{ row.id }}</span>
        </div></template
      >
      <template #cell.id="{ row }">#{{ row.id }}</template>
    </SmartDataTable>
    <p class="demo-feedback" role="status">{{ lastAction }}</p>
    <p class="demo-note">
      Responsive preview · resize to switch between desktop and mobile. Not
      published to npm.
    </p>
  </main>
</template>
<style>
body {
  margin: 0;
  background: #f5f7f6;
  color: #24312e;
  font-family: system-ui, sans-serif;
}
.demo {
  max-width: 1320px;
  margin: 48px auto;
  padding: 0 28px;
}
.demo-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.13em;
  color: #087c63;
}
.demo-header h1 {
  font-size: 32px;
  letter-spacing: -0.035em;
  margin: 10px 0;
}
.demo-header p,
.demo-note {
  color: #697773;
  font-size: 14px;
}
.demo-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin: 28px 0;
  font-size: 13px;
}
.demo-controls label {
  display: flex;
  gap: 8px;
  align-items: center;
}
.demo-controls select,
.demo-controls button {
  font: inherit;
  padding: 8px 12px;
  background: #fff;
  color: #24312e;
  border: 1px solid #d5dfda;
  border-radius: 6px;
}
.demo-badge {
  font-size: 12px;
  color: #087c63;
  background: #edf7f2;
  padding: 3px 8px;
  border-radius: 6px;
}
.demo-customer {
  display: grid;
  gap: 3px;
}
.demo-customer span {
  font-size: 11px;
  color: #697773;
}
.demo-feedback {
  font-size: 13px;
  color: #087c63;
}
</style>

<style>
@media (max-width: 600px) {
  .demo {
    padding: 0 12px;
    margin: 24px auto;
  }
  .demo-header h1 {
    font-size: 26px;
  }
  .demo-controls {
    gap: 12px;
  }
  .demo-customer strong {
    overflow-wrap: anywhere;
  }
  .demo-header p {
    line-height: 1.6;
  }
}
</style>
