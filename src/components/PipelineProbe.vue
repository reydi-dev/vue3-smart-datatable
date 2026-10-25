<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <section class="vsdt-probe" aria-label="Build pipeline probe">
    <h2>Development pipeline probe</h2>
    <p>The table is not implemented yet.</p>
    <button type="button" @click="count++">Probe clicks: {{ count }}</button>
  </section>
</template>
