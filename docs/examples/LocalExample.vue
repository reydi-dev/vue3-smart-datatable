<script setup lang="ts">
import { ref } from 'vue'
import SmartDataTable, {
  createCsvExporter,
  createLocalStoragePersistenceAdapter,
} from '@reydi-dev/vue3-smart-datatable'
import '@reydi-dev/vue3-smart-datatable/styles.css'
import type { RowKey } from '@reydi-dev/vue3-smart-datatable'
import { customers, columns, type Customer } from './data.js'
const selection = ref<readonly RowKey[]>([])
const exporters = [createCsvExporter<Customer>()]
const persistence = createLocalStoragePersistenceAdapter()
const itemsPerPage = ref(10)
</script>
<template>
  <section aria-labelledby="local-title">
    <h2 id="local-title">Customer directory</h2>
    <p>
      Sort, filter and select records. Column choices are saved in this browser;
      CSV uses the visible columns.
    </p>
    <SmartDataTable
      v-model="selection"
      v-model:items-per-page="itemsPerPage"
      :columns="columns"
      :items="customers"
      selectable
      :exporters="exporters"
      :persistence-adapter="persistence"
      persistence-key="public-demo-columns"
      fixed-header
      :height="480"
    >
      <template #toolbar-prepend
        ><strong>Customers</strong
        ><span>{{ selection.length }} selected</span></template
      >
    </SmartDataTable>
  </section>
</template>
