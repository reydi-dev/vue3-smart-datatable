<script setup lang="ts">
import { ref } from 'vue'
import SmartDataTable from '@reydi-dev/vue3-smart-datatable'
import '@reydi-dev/vue3-smart-datatable/styles.css'
import type {
  DataProvider,
  DataTableColumn,
} from '@reydi-dev/vue3-smart-datatable'
import { customers, type Customer } from './data.js'
const columns: readonly DataTableColumn<Customer>[] = [
  {
    key: 'name',
    label: 'Customer',
    sortable: true,
    filterable: true,
    filter: { operators: ['contains'] },
  },
  { key: 'amount', label: 'Amount', type: 'number', sortable: true },
]
// A synthetic server. Real fetch requests should likewise receive request.signal.
async function delay(signal?: AbortSignal) {
  signal?.throwIfAborted()
  await new Promise<void>((resolve, reject) => {
    const finish = () => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }
    const timer = setTimeout(finish, 300)
    const abort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) abort()
  })
}
const provider: DataProvider<Customer> = async (request) => {
  await delay(request.signal)
  const search = String(request.filters.name?.value ?? '').toLowerCase()
  const rows = customers.filter((row) =>
    row.name.toLowerCase().includes(search),
  )
  const sort = request.sort
  if (sort)
    rows.sort((a, b) => {
      const result =
        sort.columnKey === 'amount'
          ? a.amount - b.amount
          : a.name.localeCompare(b.name)
      return sort.direction === 'desc' ? -result : result
    })
  const start = (request.page - 1) * request.itemsPerPage
  return {
    items: rows.slice(start, start + request.itemsPerPage),
    total: rows.length,
  }
}
const itemsPerPage = ref(10)
</script>
<template>
  <section aria-labelledby="async-title">
    <h2 id="async-title">Async provider</h2>
    <p>
      A synthetic server responds after 300 ms. Change the filter while a
      request is pending to try cancellation.
    </p>
    <SmartDataTable
      v-model:items-per-page="itemsPerPage"
      mode="server"
      :columns="columns"
      :data-provider="provider"
      :filter-debounce="150"
    />
  </section>
</template>
