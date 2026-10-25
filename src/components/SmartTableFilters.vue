<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<template>
  <section class="sdt-filters" :aria-label="messages.filters">
    <div class="sdt-filters__grid">
      <div v-for="column in filterColumns" :key="column.key" class="sdt-filter">
        <slot
          :name="`filter.${column.key}`"
          :column="column"
          :clause="value[column.key]"
          :set-clause="setClauseFor(column.key)"
          :clear="clearFor(column.key)"
          :disabled="Boolean(disabled)"
        >
          <label
            ><span
              >{{ column.label }} ·
              {{ messages.filterOperator || 'Condition' }}</span
            >
            <select
              class="sdt-filter__operator"
              :value="clauseFor(column).operator"
              :disabled="disabled"
              @change="changeOperator(column, $event)"
            >
              <option
                v-for="item in operatorItems(column)"
                :key="item.value"
                :value="item.value"
              >
                {{ item.text }}
              </option>
            </select>
          </label>
          <template v-if="clauseFor(column).operator === 'between'">
            <label
              ><span
                >{{ column.label }} · {{ messages.filterFrom || 'From' }}</span
              ><input
                :type="inputType(column)"
                :value="clauseFor(column).from"
                :disabled="disabled"
                @input="changeInput(column, $event, 'from')"
            /></label>
            <label
              ><span>{{ column.label }} · {{ messages.filterTo || 'To' }}</span
              ><input
                :type="inputType(column)"
                :value="clauseFor(column).to"
                :disabled="disabled"
                @input="changeInput(column, $event, 'to')"
            /></label>
          </template>
          <label v-else-if="filterType(column) === 'select'"
            ><span
              >{{ column.label }} · {{ messages.filterValue || 'Value' }}</span
            >
            <select
              :multiple="clauseFor(column).operator === 'in'"
              :value="optionIndices(column)"
              :disabled="disabled"
              @change="changeOptions(column, $event)"
            >
              <option v-if="clauseFor(column).operator !== 'in'" value="">
                {{ messages.filterAny || 'Any value' }}
              </option>
              <option
                v-for="(option, index) in column.options || []"
                :key="index"
                :value="String(index)"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-else
            ><span
              >{{ column.label }} · {{ messages.filterValue || 'Value' }}</span
            ><input
              :type="inputType(column)"
              :placeholder="column.filter && column.filter.placeholder"
              :value="clauseFor(column).value"
              :disabled="disabled"
              @input="changeInput(column, $event)"
          /></label>
          <button
            type="button"
            class="sdt-control sdt-filter__clear"
            :disabled="disabled || !value[column.key]"
            :aria-label="`${messages.clearFilter || 'Clear filter'}: ${column.label}`"
            @click="clear(column.key)"
          >
            {{ messages.clearFilter || 'Clear filter' }}
          </button>
        </slot>
      </div>
    </div>
    <footer>
      <button
        type="button"
        class="sdt-control"
        :disabled="disabled"
        @click="!disabled && emit('change', {})"
      >
        {{ messages.clearFilters }}
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts" generic="Row extends object">
import { computed } from 'vue'
import { defaultMessages } from '../core/messages.js'
import { operatorDefaults, operatorsByType } from '../core/filters.js'
import type {
  DataTableColumn,
  DataTableMessages,
  FilterClause,
  FilterOperator,
  FilterState,
  FilterSlotContext,
} from '../types/index.js'
const props = defineProps<{
  columns: readonly DataTableColumn<Row>[]
  value: FilterState
  messages: DataTableMessages
  disabled?: boolean
}>()
const emit = defineEmits<{ change: [filters: FilterState] }>()
defineSlots<{
  [Name in `filter.${string}`]?: (context: FilterSlotContext<Row>) => unknown
}>()
const filterColumns = computed(() => props.columns.filter((c) => c.filterable))
function filterType(
  column: DataTableColumn<Row>,
): 'text' | 'number' | 'date' | 'select' {
  const type = column.filter?.type || column.type
  return type === 'number' || type === 'date' || type === 'select'
    ? type
    : 'text'
}
function clauseFor(column: DataTableColumn<Row>): Readonly<FilterClause> {
  return (
    props.value[column.key] || {
      operator:
        column.filter?.defaultOperator || operatorDefaults[filterType(column)],
    }
  )
}
function operatorItems(column: DataTableColumn<Row>) {
  return (column.filter?.operators || operatorsByType[filterType(column)]).map(
    (value) => ({
      value,
      text:
        props.messages.filterOperators?.[value] ||
        defaultMessages.filterOperators[value],
    }),
  )
}
function inputType(column: DataTableColumn<Row>) {
  const type = filterType(column)
  return type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'
}
function setClause(key: string, clause: Readonly<FilterClause>) {
  if (!props.disabled) emit('change', { ...props.value, [key]: { ...clause } })
}
function setClauseFor(key: string) {
  return (clause: Readonly<FilterClause>) => setClause(key, clause)
}
function clearFor(key: string) {
  return () => clear(key)
}
function clear(key: string) {
  if (props.disabled) return
  const next = { ...props.value }
  delete next[key]
  emit('change', next)
}
function changeOperator(column: DataTableColumn<Row>, event: Event) {
  const operator = (event.target as HTMLSelectElement).value as FilterOperator,
    previous = clauseFor(column)
  setClause(column.key, {
    ...previous,
    operator,
    value:
      operator === 'in'
        ? Array.isArray(previous.value)
          ? previous.value
          : previous.value == null || previous.value === ''
            ? []
            : [previous.value]
        : Array.isArray(previous.value)
          ? previous.value[0]
          : previous.value,
  })
}
function changeInput(
  column: DataTableColumn<Row>,
  event: Event,
  bound?: 'from' | 'to',
) {
  const text = (event.target as HTMLInputElement).value
  const value =
    filterType(column) === 'number' && text !== '' ? Number(text) : text
  setClause(column.key, { ...clauseFor(column), [bound || 'value']: value })
}
function optionIndices(column: DataTableColumn<Row>): string | string[] {
  const clause = clauseFor(column),
    options = column.options || []
  if (clause.operator === 'in')
    return options.flatMap((o, i) =>
      Array.isArray(clause.value) &&
      clause.value.some((v: unknown) => Object.is(v, o.value))
        ? [String(i)]
        : [],
    )
  const index = options.findIndex((o) => Object.is(o.value, clause.value))
  return index < 0 ? '' : String(index)
}
function changeOptions(column: DataTableColumn<Row>, event: Event) {
  const select = event.target as HTMLSelectElement,
    options = column.options || []
  const value = select.multiple
    ? Array.from(select.selectedOptions).map(
        (o) => options[Number(o.value)]?.value,
      )
    : select.value === ''
      ? undefined
      : options[Number(select.value)]?.value
  setClause(column.key, { ...clauseFor(column), value })
}
</script>
