<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<script setup lang="ts" generic="Row extends object">
import { computed, onBeforeUnmount } from 'vue'
import SmartTableCell from './SmartTableCell.vue'
import SmartTableIcon from './SmartTableIcon.vue'
import SmartTableRowActions from './SmartTableRowActions.vue'
import { formatColumnValue, resolveColumnValue } from '../core/columns.js'
import { inputChecked, isInteractiveTarget } from './interactions.js'
import type {
  CellContext,
  CellClick,
  ClassValue,
  DataTableColumn,
  DataTableIcons,
  DataTableMessages,
  RowAction,
  RowActionEvent,
  RowClick,
  RowKey,
  SmartDataTableSlots,
} from '../types/index.js'
defineOptions({ inheritAttrs: false })
const props = defineProps<{
  rows: readonly Row[]
  columns: readonly DataTableColumn<Row>[]
  rowKeyOf: (row: Row) => RowKey
  selectedKeys: readonly RowKey[]
  selectable?: boolean
  disabled?: boolean
  dense?: boolean
  rowClickable?: boolean
  rowClass?: (row: Row, index: number) => ClassValue
  actions: readonly RowAction<Row>[]
  summaryLimit?: number
  messages: DataTableMessages
  icons: DataTableIcons
  expandedKeys: ReadonlySet<RowKey>
}>()
const emit = defineEmits<{
  'select-row': [row: Row, checked: boolean]
  'row-click': [payload: RowClick<Row>]
  'row-action': [payload: RowActionEvent<Row>]
  'cell-click': [payload: CellClick<Row>]
  'toggle-details': [key: RowKey, open: boolean]
}>()
const slots = defineSlots<SmartDataTableSlots<Row>>()
let alive = true
onBeforeUnmount(() => {
  alive = false
})
const summaryColumns = computed(() => {
  const explicit = props.columns
    .filter((c) => c.mobile?.summary)
    .sort((a, b) => (a.mobile?.order || 0) - (b.mobile?.order || 0))
  const limit = props.summaryLimit ?? 3
  return (explicit.length ? explicit : props.columns).slice(
    0,
    Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 3,
  )
})
const detailColumns = computed(() =>
  props.columns.filter((c) => !summaryColumns.value.includes(c)),
)
function cellContext(
  row: Row,
  column: DataTableColumn<Row>,
  rowIndex: number,
): CellContext<Row> {
  return {
    row,
    rowKey: props.rowKeyOf(row),
    column,
    value: resolveColumnValue(column, row),
    formattedValue: formatColumnValue(column, row),
    rowIndex,
    mobile: true,
  }
}
function mobileContext(
  row: Row,
  rowIndex: number,
  columns: readonly DataTableColumn<Row>[],
) {
  return {
    row,
    rowKey: props.rowKeyOf(row),
    columns,
    rowIndex,
    disabled: Boolean(props.disabled),
  }
}
function activateRow(
  row: Row,
  index: number,
  event: MouseEvent,
  explicit = false,
) {
  if (
    !props.disabled &&
    props.rowClickable &&
    (explicit || !isInteractiveTarget(event))
  )
    emit('row-click', { row, rowKey: props.rowKeyOf(row), index, event })
}
function fullWidth(column: DataTableColumn<Row>, row: Row) {
  return (
    column.type === 'expandable-text' ||
    column.compact === false ||
    (!column.compact &&
      (column.type === 'copy' ||
        column.type === 'link' ||
        String(formatColumnValue(column, row) ?? '').length > 80))
  )
}
function hasActions(row: Row) {
  return (
    props.actions.some((a) =>
      typeof a.visible === 'function' ? a.visible(row) : a.visible !== false,
    ) || slots['row-actions']
  )
}
function hasDetails(row: Row) {
  return (
    detailColumns.value.length || slots['mobile-details'] || hasActions(row)
  )
}
function actionSlots() {
  return props.actions.filter((a) => slots[`action.${a.key}`])
}
function toggled(row: Row, event: Event) {
  if (alive)
    emit(
      'toggle-details',
      props.rowKeyOf(row),
      (event.target as HTMLDetailsElement).open,
    )
}
</script>
<template>
  <div
    class="sdt-mobile"
    :class="{ 'sdt-mobile--dense': dense }"
    role="list"
    :aria-label="messages.table"
  >
    <article
      v-for="(row, index) in rows"
      :key="rowKeyOf(row)"
      role="listitem"
      class="sdt-mobile__row"
      :class="[
        rowClass?.(row, index),
        { 'sdt-row--selected': selectedKeys.includes(rowKeyOf(row)) },
      ]"
    >
      <div
        class="sdt-mobile__summary"
        :class="{
          'sdt-mobile__summary--selectable':
            selectable && !slots['mobile-summary'],
        }"
        :style="{
          '--sdt-summary-count': Math.max(
            1,
            Math.min(2, summaryColumns.length),
          ),
        }"
        @click="activateRow(row, index, $event)"
      >
        <slot
          name="mobile-summary"
          v-bind="mobileContext(row, index, summaryColumns)"
        >
          <label v-if="selectable" class="sdt-selection-control" @click.stop
            ><input
              type="checkbox"
              class="sdt-checkbox"
              :checked="selectedKeys.includes(rowKeyOf(row))"
              :aria-label="`${messages.selectRow} ${index + 1}`"
              :disabled="disabled"
              @change="
                !disabled && emit('select-row', row, inputChecked($event))
              "
          /></label>
          <div class="sdt-mobile__summary-fields">
            <div
              v-for="column in summaryColumns"
              :key="column.key"
              class="sdt-mobile__summary-field"
            >
              <small>{{ column.label }}</small>
              <slot
                :name="`cell.${column.key}`"
                v-bind="cellContext(row, column, index)"
                ><slot name="cell" v-bind="cellContext(row, column, index)"
                  ><SmartTableCell
                    :row="row"
                    :row-key-value="rowKeyOf(row)"
                    :column="column"
                    :row-index="index"
                    mobile
                    :messages="messages"
                    :icons="icons"
                    :disabled="disabled"
                    @cell-click="emit('cell-click', $event)" /></slot
              ></slot>
            </div></div
        ></slot>
      </div>
      <button
        v-if="rowClickable"
        type="button"
        class="sdt-mobile__open sdt-action"
        :disabled="disabled"
        :aria-label="`${messages.openRow} ${index + 1}`"
        @click="activateRow(row, index, $event, true)"
      >
        {{ messages.openRow }}
      </button>
      <details
        v-if="hasDetails(row)"
        :open="expandedKeys.has(rowKeyOf(row))"
        class="sdt-mobile__disclosure"
        @toggle="toggled(row, $event)"
      >
        <summary>
          {{ messages.moreDetails
          }}<SmartTableIcon :icon="icons.next" :size="14" />
        </summary>
        <div class="sdt-mobile__details-body">
          <slot
            name="mobile-details"
            v-bind="mobileContext(row, index, detailColumns)"
            ><dl class="sdt-mobile__details">
              <div
                v-for="column in detailColumns"
                :key="column.key"
                :class="{ 'sdt-mobile__field--full': fullWidth(column, row) }"
              >
                <dt>{{ column.label }}</dt>
                <dd>
                  <slot
                    :name="`cell.${column.key}`"
                    v-bind="cellContext(row, column, index)"
                    ><slot name="cell" v-bind="cellContext(row, column, index)"
                      ><SmartTableCell
                        :row="row"
                        :row-key-value="rowKeyOf(row)"
                        :column="column"
                        :row-index="index"
                        mobile
                        :messages="messages"
                        :icons="icons"
                        :disabled="disabled"
                        @cell-click="emit('cell-click', $event)" /></slot
                  ></slot>
                </dd>
              </div></dl
          ></slot>
          <div v-if="hasActions(row)" class="sdt-mobile__actions">
            <SmartTableRowActions
              :row="row"
              :row-key-of="rowKeyOf"
              :actions="actions"
              :disabled="disabled"
              :messages="messages"
              :icons="icons"
              @row-action="emit('row-action', $event)"
            >
              <template v-if="slots['row-actions']" #row-actions="context"
                ><slot name="row-actions" v-bind="context"
              /></template>
              <template
                v-for="action in actionSlots()"
                :key="action.key"
                #[`action.${action.key}`]="context"
                ><slot :name="`action.${action.key}`" v-bind="context"
              /></template>
            </SmartTableRowActions>
          </div>
        </div>
      </details>
    </article>
  </div>
</template>
