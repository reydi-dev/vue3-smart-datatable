<script setup lang="ts">
import { PipelineProbe } from '../src'
import StateProbe from './StateProbe.vue'
</script>

<template>
  <main
    style="
      max-width: 56rem;
      margin: 3rem auto;
      padding: 1rem;
      font-family: system-ui;
    "
  >
    <h1>Vue 3 Smart DataTable</h1>
    <p>In development · not published · temporary build verification only</p>
    <PipelineProbe />
    <StateProbe />
  </main>
</template>
