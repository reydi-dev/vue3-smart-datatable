<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<script setup lang="ts" generic="Row extends object">
import { computed, ref, shallowRef, watch, onScopeDispose } from 'vue'
import { useDataTable } from '../composables/useDataTable.js'
import { defaultMessages } from '../core/messages.js'
import { defaultIcons } from '../core/icons.js'
import { resolveRowKey } from '../core/columns.js'
import { withoutEmptyFilters } from '../core/filters.js'
import SmartTableDesktop from './SmartTableDesktop.vue'
import SmartTableMobile from './SmartTableMobile.vue'
import { useResponsiveLayout } from '../composables/useResponsiveLayout.js'
import SmartTableFilters from './SmartTableFilters.vue'
import SmartTableToolbar from './SmartTableToolbar.vue'
import SmartTablePagination from './SmartTablePagination.vue'
import SmartTableIcon from './SmartTableIcon.vue'
import ColumnVisibilityDialog from './ColumnVisibilityDialog.vue'
import type {
  RowKey,
  ExportScope,
  SmartDataTableProps,
  SmartDataTableEmits,
  SmartDataTableSlots,
} from '../types/index.js'
const props = withDefaults(defineProps<SmartDataTableProps<Row>>(), {
  autoLoad: true,
  columnVisibility: true,
  showToolbar: true,
  showPagination: true,
  direction: 'ltr',
  theme: 'light',
  pageSizeOptions: () => [10, 25, 50, 100],
  actions: () => [],
  exporters: () => [],
})
const emit = defineEmits<SmartDataTableEmits<Row>>()
const slots = defineSlots<SmartDataTableSlots<Row>>()
let alive = true
onScopeDispose(() => {
  alive = false
})
const table = useDataTable<Row>(props, emit)
const {
  columns,
  visibleColumns,
  rows,
  total,
  error,
  loading,
  exporting,
  exportProgress,
  state,
} = table
const { refresh, resetFilters, resetColumnVisibility } = table.exposed
defineExpose(table.exposed)
const isMobile = useResponsiveLayout(() => props.mobileBreakpoint)
const expandedKeys = shallowRef<ReadonlySet<RowKey>>(new Set())
function toggleDetails(key: RowKey, open: boolean) {
  if (expandedKeys.value.has(key) === open) return
  const next = new Set(expandedKeys.value)
  if (open) next.add(key)
  else next.delete(key)
  expandedKeys.value = next
}
watch(rows, (value) => {
  const current = new Set(value.map(rowKeyOf))
  expandedKeys.value = new Set(
    [...expandedKeys.value].filter((key) => current.has(key)),
  )
})
watch(
  () => props.rowKey,
  () => {
    expandedKeys.value = new Set()
  },
)
const filtersOpen = ref(false),
  columnsDialog = ref(false),
  exportError = ref(false)
const messages = computed(() => ({
  ...defaultMessages,
  ...props.messages,
  filterOperators: {
    ...defaultMessages.filterOperators,
    ...props.messages?.filterOperators,
  },
}))
const icons = computed(() => ({ ...defaultIcons, ...props.icons }))
const hasFilters = computed(() => columns.value.some((c) => c.filterable))
const activeFilters = computed(
  () => Object.keys(withoutEmptyFilters(state.value.filters)).length > 0,
)
const pageSizes = computed(() => [
  ...new Set(
    props.pageSizeOptions
      .filter((n) => Number.isSafeInteger(n) && n > 0)
      .concat(state.value.itemsPerPage),
  ),
])
function headerSlots() {
  return columns.value.filter((c) => slots[`header.${c.key}`])
}
function cellSlots() {
  return columns.value.filter((c) => slots[`cell.${c.key}`])
}
function filterSlots() {
  return columns.value.filter((c) => slots[`filter.${c.key}`])
}
function actionSlots() {
  return props.actions.filter((a) => slots[`action.${a.key}`])
}
function rowKeyOf(row: Row) {
  return resolveRowKey(row, props.rowKey ?? 'id')
}
async function runExport(key: string, scope: ExportScope) {
  if (props.disabled) return
  exportError.value = false
  try {
    await table.exposed.exportData(key, scope)
  } catch {
    if (alive) exportError.value = true
  }
}
async function resetColumns() {
  if (!props.disabled) await resetColumnVisibility()
}
</script>
<template>
  <div
    class="sdt-root"
    :dir="direction"
    :data-sdt-theme="theme"
    :aria-busy="loading || exporting ? 'true' : 'false'"
  >
    <slot name="toolbar" :state="state">
      <SmartTableToolbar
        v-if="showToolbar"
        :has-filters="hasFilters"
        :filters-open="filtersOpen"
        :column-visibility="columnVisibility"
        :exporters="exporters"
        :messages="messages"
        :icons="icons"
        :exporting="exporting"
        :disabled="disabled"
        :export-disabled="disabled || loading || Boolean(error)"
        @toggle-filters="filtersOpen = !filtersOpen"
        @columns="columnsDialog = true"
        @export="runExport($event.exporter, $event.scope)"
        ><slot name="toolbar-prepend" /><template #append
          ><slot name="toolbar-append" /></template
      ></SmartTableToolbar>
    </slot>
    <SmartTableFilters
      v-if="filtersOpen && hasFilters"
      :columns="columns"
      :value="state.filters"
      :messages="messages"
      :disabled="disabled"
      @change="table.setFilters($event)"
    >
      <template
        v-for="column in filterSlots()"
        :key="column.key"
        #[`filter.${column.key}`]="context"
        ><slot :name="`filter.${column.key}`" v-bind="context"
      /></template>
    </SmartTableFilters>
    <div v-if="error" role="alert" class="sdt-state sdt-state--error">
      <slot name="error" :error="error" :retry="refresh"
        >{{ messages.error
        }}<button
          type="button"
          class="sdt-control"
          :disabled="disabled"
          @click="!disabled && refresh()"
        >
          <SmartTableIcon :icon="icons.retry" :size="16" leading />{{
            messages.retry
          }}
        </button></slot
      >
    </div>
    <div v-else-if="loading" class="sdt-state" role="status">
      <slot name="loading"
        ><span class="sdt-action__spinner" aria-hidden="true" /><span>{{
          messages.loading
        }}</span></slot
      >
    </div>
    <div v-else-if="rows.length === 0" class="sdt-state" role="status">
      <slot name="empty"
        ><span>{{ activeFilters ? messages.noResults : messages.empty }}</span
        ><button
          v-if="activeFilters"
          type="button"
          class="sdt-control"
          :disabled="disabled"
          @click="!disabled && resetFilters()"
        >
          {{ messages.clearFilters }}
        </button></slot
      >
    </div>
    <component
      :is="isMobile ? SmartTableMobile : SmartTableDesktop"
      v-else
      :summary-limit="mobileSummaryLimit"
      :expanded-keys="expandedKeys"
      :rows="rows"
      :columns="visibleColumns"
      :row-key-of="rowKeyOf"
      :selected-keys="state.selectedKeys"
      :selectable="selectable"
      :disabled="disabled"
      :row-clickable="rowClickable"
      :actions="actions"
      :sort="state.sort"
      :dense="dense"
      :fixed-header="fixedHeader"
      :height="height"
      :messages="messages"
      :icons="icons"
      :row-class="rowClass"
      @toggle-details="toggleDetails"
      @sort="table.setSort($event)"
      @select-page="table.selectPage($event)"
      @select-row="table.selectRow"
      @row-click="emit('row-click', $event)"
      @row-action="emit('row-action', $event)"
      @cell-click="emit('cell-click', $event)"
    >
      <template v-if="slots.header" #header="context"
        ><slot name="header" v-bind="context"
      /></template>
      <template v-if="slots.cell" #cell="context"
        ><slot name="cell" v-bind="context"
      /></template>
      <template v-if="slots['row-actions']" #row-actions="context"
        ><slot name="row-actions" v-bind="context"
      /></template>
      <template
        v-for="column in headerSlots()"
        :key="column.key"
        #[`header.${column.key}`]="context"
        ><slot :name="`header.${column.key}`" v-bind="context"
      /></template>
      <template
        v-for="column in cellSlots()"
        :key="column.key"
        #[`cell.${column.key}`]="context"
        ><slot :name="`cell.${column.key}`" v-bind="context"
      /></template>
      <template
        v-for="action in actionSlots()"
        :key="action.key"
        #[`action.${action.key}`]="context"
        ><slot :name="`action.${action.key}`" v-bind="context"
      /></template>
      <template v-if="slots['mobile-summary']" #mobile-summary="context"
        ><slot name="mobile-summary" v-bind="context"
      /></template>
      <template v-if="slots['mobile-details']" #mobile-details="context"
        ><slot name="mobile-details" v-bind="context"
      /></template>
    </component>
    <slot name="footer" :state="state"
      ><SmartTablePagination
        v-if="showPagination"
        :page="state.page"
        :items-per-page="state.itemsPerPage"
        :total="total"
        :page-size-options="pageSizes"
        :messages="messages"
        :previous-icon="direction === 'rtl' ? icons.next : icons.previous"
        :next-icon="direction === 'rtl' ? icons.previous : icons.next"
        :disabled="disabled || loading || Boolean(error)"
        @update:page="table.setPage($event)"
        @update:items-per-page="table.setPageSize($event)"
    /></slot>
    <ColumnVisibilityDialog
      v-if="columnVisibility"
      :open="columnsDialog"
      :columns="columns"
      :visible-columns="state.visibleColumns"
      :messages="messages"
      :disabled="disabled"
      @close="columnsDialog = false"
      @apply="table.setVisibleColumns($event)"
      @reset="resetColumns"
    />
    <div v-if="exporting" class="sdt-export-progress">
      <slot name="export-progress" :percent="exportProgress"
        ><progress
          :value="exportProgress"
          max="100"
          :aria-label="messages.export"
      /></slot>
    </div>
    <p v-if="exportError" role="alert" class="sdt-state sdt-state--error">
      {{ messages.exportFailed }}
    </p>
  </div>
</template>
<style src="../styles/index.css"></style>
