<script setup lang="ts">
import { SmartDataTable } from '../../src'
import { columns, orders } from './consumer'
</script>

<template>
  <SmartDataTable :columns="columns" :items="orders" page="two" />
  <SmartDataTable :columns="columns" :items="orders">
    <template #cell="{ row }">
      <span>{{ row.missingProperty }}</span>
    </template>
  </SmartDataTable>
</template>
