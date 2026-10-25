<!-- Compile-only signature probe. No table runtime behavior is implemented here. -->
<script setup lang="ts" generic="Row extends object">
import type {
  SmartDataTableProps,
  SmartDataTableEmits,
  SmartDataTableSlots,
} from '../../src'

const props = defineProps<SmartDataTableProps<Row>>()
const emit = defineEmits<SmartDataTableEmits<Row>>()
defineSlots<SmartDataTableSlots<Row>>()
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div>
    <slot name="header" :column="props.columns[0]" />
    <template v-if="props.items?.length">
      <slot
        name="cell"
        :row="props.items[0]"
        row-key="probe"
        :column="props.columns[0]"
        :value="undefined"
        :formatted-value="undefined"
        :row-index="0"
        :mobile="false"
      />
      <slot
        name="cell.name"
        :row="props.items[0]"
        row-key="probe"
        :column="props.columns[0]"
        :value="undefined"
        :formatted-value="undefined"
        :row-index="0"
        :mobile="false"
      />
      <button
        type="button"
        @click="
          emit('row-click', {
            row: props.items[0],
            rowKey: 'probe',
            index: 0,
            event: $event,
          })
        "
      >
        Compile-only event signature
      </button>
    </template>
  </div>
</template>
