<script setup lang="ts">
import { shallowReactive, shallowRef } from 'vue'
import { useDataTable } from '../src/composables/useDataTable.js'
import { processLocalData } from '../src/core/local-data.js'
import type {
  DataTableColumn,
  SmartDataTableProps,
} from '../src/types/index.js'
import type { TableEmit } from '../src/composables/lifecycle.js'

type Row = { id: number; name: string }
const items = Array.from({ length: 60 }, (_, id) => ({
  id,
  name: id % 2 ? 'Beta' : 'Alpha',
}))
const columns: DataTableColumn<Row>[] = [
  { key: 'id', label: 'ID', type: 'number', sortable: true },
  { key: 'name', label: 'Name', filterable: true },
]
const props = shallowReactive<SmartDataTableProps<Row>>({
  columns,
  items,
  mode: 'server',
  selectable: true,
  filterDebounce: 100,
  dataProvider: async (request) =>
    processLocalData(
      items,
      columns,
      request.filters,
      request.sort,
      request.page,
      request.itemsPerPage,
    ),
})
const events = shallowRef<string[]>([])
const emit: TableEmit<Row> = (event, ...payload) => {
  void payload
  events.value = [...events.value.slice(-9), event]
}
const table = useDataTable<Row>(props, emit)
</script>

<template>
  <section aria-label="Reactive state development probe">
    <h2>Reactive state probe</h2>
    <p>
      Development fixture with synthetic local/server data. This is not the
      table UI.
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      <button
        type="button"
        @click="props.mode = props.mode === 'local' ? 'server' : 'local'"
      >
        Mode: {{ props.mode }}
      </button>
      <button type="button" @click="table.exposed.refresh()">Refresh</button>
      <button
        type="button"
        @click="table.setFilters({ name: { operator: 'eq', value: 'Alpha' } })"
      >
        Filter Alpha
      </button>
      <button type="button" @click="table.exposed.resetFilters()">
        Clear filters
      </button>
      <button type="button" @click="table.setSort('id')">Sort ID</button>
      <button type="button" @click="table.setPage(table.state.value.page + 1)">
        Next page
      </button>
      <button type="button" @click="table.selectPage(true)">Select page</button>
      <button type="button" @click="table.exposed.clearSelection()">
        Clear selection
      </button>
    </div>
    <pre style="overflow: auto">{{
      JSON.stringify(table.state.value, null, 2)
    }}</pre>
    <p>
      Displayed row IDs: {{ table.rows.value.map((row) => row.id).join(', ') }}
    </p>
    <p>Recent events: {{ events.join(' → ') }}</p>
  </section>
</template>
