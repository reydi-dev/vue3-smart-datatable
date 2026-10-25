<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<template>
  <div class="sdt-toolbar">
    <div class="sdt-toolbar__content"><slot /></div>
    <div class="sdt-toolbar__actions">
      <button
        v-if="hasFilters"
        type="button"
        class="sdt-control"
        :disabled="disabled"
        :aria-expanded="filtersOpen ? 'true' : 'false'"
        @click="!disabled && emit('toggle-filters')"
      >
        <SmartTableIcon :icon="icons.filter" :size="18" leading />{{
          messages.filters
        }}
      </button>
      <button
        v-if="columnVisibility"
        type="button"
        class="sdt-control"
        :disabled="disabled"
        aria-haspopup="dialog"
        @click="!disabled && emit('columns')"
      >
        <SmartTableIcon :icon="icons.columns" :size="18" leading />{{
          messages.columns
        }}
      </button>
      <ExportMenu
        v-if="exporters.length"
        :exporters="exporters"
        :messages="messages"
        :icon="icons.export"
        :loading="exporting"
        :disabled="exportDisabled"
        @export="emit('export', $event)"
      />
      <slot name="append" />
    </div>
  </div>
</template>
<script setup lang="ts" generic="Row extends object">
import SmartTableIcon from './SmartTableIcon.vue'
import ExportMenu from './ExportMenu.vue'
import type {
  DataTableIcons,
  DataTableMessages,
  ExporterAdapter,
  ExportScope,
} from '../types/index.js'
defineProps<{
  hasFilters: boolean
  filtersOpen: boolean
  columnVisibility: boolean
  exporters: readonly ExporterAdapter<Row>[]
  messages: DataTableMessages
  icons: DataTableIcons
  exporting: boolean
  disabled: boolean
  exportDisabled: boolean
}>()
const emit = defineEmits<{
  'toggle-filters': []
  columns: []
  export: [payload: { exporter: string; scope: ExportScope }]
}>()
</script>
