<script setup lang="ts">
import { useDataTable } from '../../src/composables/useDataTable.js'
import type {
  SmartDataTableProps,
  SmartDataTableEmits,
} from '../../src/types/index.js'
import type { FixtureRow } from './state-fixture.js'

const props = withDefaults(defineProps<SmartDataTableProps<FixtureRow>>(), {
  autoLoad: true,
})
const emit = defineEmits<SmartDataTableEmits<FixtureRow>>()
const table = useDataTable(props, emit)
defineExpose(table)
</script>

<template>
  <div aria-label="State test fixture">{{ table.rows.value.length }}</div>
</template>
