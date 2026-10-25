<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<script setup lang="ts" generic="Row extends object">
import { computed } from 'vue'
import SmartTableIcon from './SmartTableIcon.vue'
import SmartTableCell from './SmartTableCell.vue'
import SmartTableAction from './SmartTableAction.vue'
import { isInteractiveTarget, inputChecked } from './interactions.js'
import { resolveColumnValue, formatColumnValue } from '../core/columns.js'
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
  SortState,
} from '../types/index.js'
const props = defineProps<{
  rows: readonly Row[]
  columns: readonly DataTableColumn<Row>[]
  rowKeyOf: (row: Row) => RowKey
  selectedKeys: readonly RowKey[]
  selectable?: boolean
  disabled?: boolean
  rowClickable?: boolean
  actions: readonly RowAction<Row>[]
  sort: SortState | null
  dense?: boolean
  fixedHeader?: boolean
  height?: string | number
  messages: DataTableMessages
  icons: DataTableIcons
  rowClass?: (row: Row, index: number) => ClassValue
}>()
const emit = defineEmits<{
  sort: [key: string]
  'select-page': [checked: boolean]
  'select-row': [row: Row, checked: boolean]
  'row-click': [payload: RowClick<Row>]
  'row-action': [payload: RowActionEvent<Row>]
  'cell-click': [payload: CellClick<Row>]
}>()
defineSlots<SmartDataTableSlots<Row>>()
const pageKeys = computed(() => props.rows.map(props.rowKeyOf))
const allPageSelected = computed(
  () =>
    pageKeys.value.length > 0 &&
    pageKeys.value.every((k) => props.selectedKeys.includes(k)),
)
const somePageSelected = computed(
  () =>
    !allPageSelected.value &&
    pageKeys.value.some((k) => props.selectedKeys.includes(k)),
)
const viewportStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
function columnStyle(c: DataTableColumn<Row>) {
  return {
    width: typeof c.width === 'number' ? `${c.width}px` : c.width,
    minWidth: typeof c.minWidth === 'number' ? `${c.minWidth}px` : c.minWidth,
  }
}
function context(
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
    mobile: false,
  }
}
function activateRow(
  row: Row,
  index: number,
  event: MouseEvent | KeyboardEvent,
) {
  if (!props.disabled && props.rowClickable && !isInteractiveTarget(event))
    emit('row-click', { row, rowKey: props.rowKeyOf(row), index, event })
}
function keyRow(row: Row, index: number, event: KeyboardEvent) {
  if (
    !props.disabled &&
    props.rowClickable &&
    event.target === event.currentTarget
  ) {
    event.preventDefault()
    activateRow(row, index, event)
  }
}
function visibleActions(row: Row) {
  return props.actions.filter((a) =>
    typeof a.visible === 'function' ? a.visible(row) : a.visible !== false,
  )
}
function inlineActions(row: Row) {
  return visibleActions(row)
    .filter((a) => a.position !== 'menu')
    .sort(
      (a, b) =>
        Number(b.position === 'leading') - Number(a.position === 'leading'),
    )
}
function menuActions(row: Row) {
  return visibleActions(row).filter((a) => a.position === 'menu')
}
function actionLoading(a: RowAction<Row>, row: Row) {
  return typeof a.loading === 'function' ? a.loading(row) : Boolean(a.loading)
}
function actionDisabled(a: RowAction<Row>, row: Row) {
  return (
    Boolean(props.disabled) ||
    (typeof a.disabled === 'function' ? a.disabled(row) : Boolean(a.disabled))
  )
}
function triggerAction(action: RowAction<Row>, row: Row, event: MouseEvent) {
  if (!actionDisabled(action, row) && !actionLoading(action, row))
    emit('row-action', { action, row, rowKey: props.rowKeyOf(row), event })
}
function actionContext(action: RowAction<Row>, row: Row) {
  return {
    action,
    row,
    rowKey: props.rowKeyOf(row),
    disabled: actionDisabled(action, row),
    loading: actionLoading(action, row),
    trigger: (event: MouseEvent) => triggerAction(action, row, event),
  }
}
</script>
<template>
  <div
    class="sdt-desktop"
    :class="{
      'sdt-desktop--dense': dense,
      'sdt-desktop--fixed-header': fixedHeader,
    }"
    :style="viewportStyle"
    tabindex="0"
    role="region"
    :aria-label="messages.table"
  >
    <table class="sdt-desktop__table">
      <thead>
        <tr>
          <th v-if="selectable" scope="col" class="sdt-column--selection">
            <label class="sdt-selection-control"
              ><input
                type="checkbox"
                class="sdt-checkbox"
                :checked="allPageSelected"
                :indeterminate="somePageSelected"
                :aria-label="messages.selectAll"
                :disabled="disabled"
                @change="
                  !disabled && emit('select-page', inputChecked($event))
                "
            /></label>
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :aria-sort="
              sort?.columnKey === column.key
                ? sort.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined
            "
            :class="[
              column.headerClass,
              `sdt-align--${column.align || 'start'}`,
            ]"
            :style="columnStyle(column)"
          >
            <slot :name="`header.${column.key}`" :column="column"
              ><slot name="header" :column="column">
                <button
                  v-if="column.sortable"
                  type="button"
                  class="sdt-sort-button"
                  :disabled="disabled"
                  @click="!disabled && emit('sort', column.key)"
                >
                  {{ column.label
                  }}<SmartTableIcon
                    v-if="sort?.columnKey === column.key"
                    :icon="
                      sort.direction === 'asc' ? icons.sortAsc : icons.sortDesc
                    "
                    :size="14"
                  /></button
                ><span v-else>{{ column.label }}</span>
              </slot></slot
            >
          </th>
          <th v-if="actions.length" scope="col" class="sdt-align--center">
            {{ messages.actions }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="rowKeyOf(row)"
          :class="[
            rowClass?.(row, index),
            {
              'sdt-row--selected': selectedKeys.includes(rowKeyOf(row)),
              'sdt-row--clickable': rowClickable && !disabled,
            },
          ]"
          :tabindex="rowClickable && !disabled ? 0 : undefined"
          @click="activateRow(row, index, $event)"
          @keydown.enter.self="keyRow(row, index, $event)"
          @keydown.space.self="keyRow(row, index, $event)"
        >
          <td v-if="selectable" class="sdt-column--selection" @click.stop>
            <label class="sdt-selection-control"
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
          </td>
          <td
            v-for="column in columns"
            :key="column.key"
            :class="`sdt-align--${column.align || 'start'}`"
            :style="columnStyle(column)"
          >
            <slot
              :name="`cell.${column.key}`"
              v-bind="context(row, column, index)"
              ><slot name="cell" v-bind="context(row, column, index)">
                <SmartTableCell
                  :row="row"
                  :row-key-value="rowKeyOf(row)"
                  :column="column"
                  :row-index="index"
                  :messages="messages"
                  :icons="icons"
                  :disabled="disabled"
                  @cell-click="emit('cell-click', $event)"
                /> </slot
            ></slot>
          </td>
          <td v-if="actions.length" class="sdt-align--center" @click.stop>
            <slot
              name="row-actions"
              :row="row"
              :row-key="rowKeyOf(row)"
              :actions="visibleActions(row)"
              :disabled="Boolean(disabled)"
            >
              <template v-for="action in inlineActions(row)" :key="action.key"
                ><slot
                  :name="`action.${action.key}`"
                  v-bind="actionContext(action, row)"
                  ><SmartTableAction
                    :action="action"
                    :disabled="actionDisabled(action, row)"
                    :loading="actionLoading(action, row)"
                    @click="triggerAction(action, row, $event)" /></slot
              ></template>
              <details v-if="menuActions(row).length" class="sdt-actions-menu">
                <summary :aria-label="messages.actions">
                  <SmartTableIcon :icon="icons.actions" />
                </summary>
                <div class="sdt-actions-menu__panel">
                  <template v-for="action in menuActions(row)" :key="action.key"
                    ><slot
                      :name="`action.${action.key}`"
                      v-bind="actionContext(action, row)"
                      ><SmartTableAction
                        :action="action"
                        :disabled="actionDisabled(action, row)"
                        :loading="actionLoading(action, row)"
                        @click="triggerAction(action, row, $event)" /></slot
                  ></template>
                </div>
              </details>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
