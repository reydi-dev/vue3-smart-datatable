<script setup lang="ts">
import { ref } from 'vue'
import SmartDataTable from '@reydi-dev/vue3-smart-datatable'
import '@reydi-dev/vue3-smart-datatable/styles.css'
import type { RowAction, RowActionEvent } from '@reydi-dev/vue3-smart-datatable'
import { customers, columns, type Customer } from './data.js'
const actions: readonly RowAction<Customer>[] = [
  { key: 'inspect', label: 'Inspect' },
]
const message = ref('Choose Inspect to open a customer.')
function inspect(event: RowActionEvent<Customer>) {
  message.value = `Inspecting ${event.row.name}`
}
const itemsPerPage = ref(10)
</script>
<template>
  <section aria-labelledby="slots-title">
    <h2 id="slots-title">Custom cells and actions</h2>
    <p>
      Specific cell slots receive typed rows. Action triggers retain the
      library's disabled/loading guards.
    </p>
    <SmartDataTable
      v-model:items-per-page="itemsPerPage"
      :columns="columns"
      :items="customers"
      :actions="actions"
      @row-action="inspect"
    >
      <template #cell.name="{ row }"
        ><strong>{{ row.name }}</strong
        ><br /><small>Customer #{{ row.id }}</small></template
      >
      <template #action.inspect="{ row, disabled, loading, trigger }"
        ><button
          type="button"
          class="sdt-action"
          :disabled="disabled || loading"
          :aria-label="`Inspect ${row.name}`"
          @click.stop="trigger($event)"
        >
          Inspect
        </button></template
      >
    </SmartDataTable>
    <p role="status">{{ message }}</p>
  </section>
</template>
