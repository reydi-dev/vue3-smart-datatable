<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<template>
  <div
    class="sdt-cell"
    :class="cellClass"
    :title="tooltipText"
    @click="emitCellClick"
  >
    <span v-if="isMissing" class="sdt-cell__empty"
      ><span aria-hidden="true">—</span
      ><span class="sdt-sr-only">{{
        messages.notProvided || 'Not provided'
      }}</span></span
    >
    <template v-else-if="column.type === 'boolean'">
      <SmartTableIcon
        :icon="value ? booleanIcons.yes : booleanIcons.no"
        :size="16"
        :tone="value ? 'success' : 'error'"
        :label="
          value ? messages.trueValue || 'True' : messages.falseValue || 'False'
        "
      />
    </template>
    <span v-else-if="column.type === 'chip'" class="sdt-cell__chip"
      ><bdi>{{ formattedText }}</bdi></span
    >
    <SmartTableIcon
      v-else-if="column.type === 'icon'"
      :icon="displayIcon"
      :size="16"
      :label="column.formatter ? formattedText : column.label"
    />
    <img
      v-else-if="column.type === 'image' && imageUrl"
      class="sdt-cell__image"
      :src="imageUrl"
      :alt="column.label"
      loading="lazy"
    />
    <a
      v-else-if="column.type === 'link' && linkUrl && !disabled"
      class="sdt-cell__link"
      :href="linkUrl"
      target="_blank"
      rel="noopener noreferrer"
      @click.stop="emitCellClick"
      ><bdi>{{ formattedText }}</bdi></a
    >
    <span v-else-if="column.type === 'link'">{{ formattedText }}</span>
    <button
      v-else-if="column.type === 'copy'"
      type="button"
      class="sdt-cell__icon-button"
      :aria-label="messages.copy"
      :disabled="disabled"
      @click.stop="copy"
    >
      <SmartTableIcon :icon="icons.copy" :size="16" />
      <bdi class="sdt-cell__copy-value">{{ formattedText }}</bdi
      ><span class="sdt-sr-only" role="status">{{
        copied ? messages.copied : ''
      }}</span>
    </button>
    <div
      v-else-if="column.type === 'expandable-text'"
      class="sdt-cell__expandable"
    >
      <button
        v-if="!mobile"
        type="button"
        class="sdt-cell__icon-button"
        :aria-label="expanded ? messages.collapse : messages.expand"
        :aria-expanded="expanded ? 'true' : 'false'"
        :disabled="disabled"
        @click.stop="!disabled && (expanded = !expanded)"
      >
        <SmartTableIcon
          :icon="expanded ? icons.collapse : icons.expand"
          :size="16"
        />
      </button>
      <span :class="{ 'sdt-cell__preview': !mobile && !expanded }"
        ><bdi>{{ formattedText }}</bdi></span
      >
    </div>
    <bdi v-else>{{ formattedText }}</bdi>
  </div>
</template>

<script setup lang="ts" generic="Row extends object">
import { computed, ref, watch, onScopeDispose } from 'vue'
import SmartTableIcon from './SmartTableIcon.vue'
import { booleanIcons, resolveSvgIcon } from '../core/icons.js'
import {
  formatColumnValue,
  resolveCellClass,
  resolveColumnValue,
} from '../core/columns.js'
import { sanitizeUrl } from '../core/urls.js'
import type {
  CellContext,
  CellClick,
  DataTableColumn,
  DataTableIcons,
  DataTableMessages,
  RowKey,
} from '../types/index.js'
const props = defineProps<{
  column: DataTableColumn<Row>
  row: Row
  rowKeyValue: RowKey
  rowIndex: number
  mobile?: boolean
  disabled?: boolean
  messages: DataTableMessages
  icons: DataTableIcons
}>()
const emit = defineEmits<{ 'cell-click': [payload: CellClick<Row>] }>()
const expanded = ref(false),
  copied = ref(false)
let alive = true
onScopeDispose(() => {
  alive = false
})
watch(
  () => [props.rowKeyValue, props.column.key],
  () => {
    expanded.value = false
    copied.value = false
  },
)
const value = computed(() => resolveColumnValue(props.column, props.row))
const formattedValue = computed(() =>
  formatColumnValue(props.column, props.row),
)
const formattedText = computed(() =>
  formattedValue.value == null ? '' : String(formattedValue.value),
)
watch(formattedValue, () => {
  copied.value = false
})
const isMissing = computed(
  () => formattedValue.value == null || formattedText.value === '',
)
const displayIcon = computed(() => resolveSvgIcon(value.value) ?? undefined)
const linkUrl = computed(() => sanitizeUrl(String(value.value ?? ''), 'link'))
const imageUrl = computed(() => sanitizeUrl(String(value.value ?? ''), 'image'))
const context = computed<CellContext<Row>>(() => ({
  row: props.row,
  rowKey: props.rowKeyValue,
  column: props.column,
  value: value.value,
  formattedValue: formattedValue.value,
  rowIndex: props.rowIndex,
  mobile: props.mobile ?? false,
}))
const cellClass = computed(() => resolveCellClass(props.column, context.value))
const tooltipText = computed(() =>
  typeof props.column.tooltip === 'function'
    ? props.column.tooltip(context.value)
    : props.column.tooltip,
)
function emitCellClick(event: MouseEvent) {
  if (!props.disabled) emit('cell-click', { ...context.value, event })
}
async function copy() {
  if (
    props.disabled ||
    !formattedText.value ||
    typeof navigator === 'undefined' ||
    !navigator.clipboard
  )
    return
  copied.value = false
  const text = formattedText.value,
    key = props.rowKeyValue
  try {
    await navigator.clipboard.writeText(text)
    if (alive && key === props.rowKeyValue && text === formattedText.value)
      copied.value = true
  } catch {
    /* Clipboard permission may be denied; never report a failed write as copied. */
  }
}
</script>
