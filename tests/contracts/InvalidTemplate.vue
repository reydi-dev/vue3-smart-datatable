<script setup lang="ts">
import ContractProbe from './ContractProbe.vue'
import { columns, orders } from './consumer'
</script>

<template>
  <ContractProbe :columns="columns" :items="orders" page="two" />
  <ContractProbe :columns="columns" :items="orders">
    <template #cell="{ row }">
      <span>{{ row.missingProperty }}</span>
    </template>
  </ContractProbe>
</template>
