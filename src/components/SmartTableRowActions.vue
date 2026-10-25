<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<script setup lang="ts" generic="Row extends object">
import SmartTableAction from './SmartTableAction.vue'
import SmartTableIcon from './SmartTableIcon.vue'
import type {
  RowAction,
  RowActionEvent,
  RowKey,
  DataTableIcons,
  DataTableMessages,
  SmartDataTableSlots,
} from '../types/index.js'
const props = defineProps<{
  row: Row
  rowKeyOf: (row: Row) => RowKey
  actions: readonly RowAction<Row>[]
  disabled?: boolean
  messages: DataTableMessages
  icons: DataTableIcons
}>()
const emit = defineEmits<{ 'row-action': [payload: RowActionEvent<Row>] }>()
defineSlots<SmartDataTableSlots<Row>>()
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
  <div class="sdt-row-actions" @click.stop>
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
  </div>
</template>
