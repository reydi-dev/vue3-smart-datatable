<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<template>
  <span
    class="sdt-icon"
    :class="[
      { 'sdt-icon--leading': leading },
      tone ? `sdt-icon--${tone}` : undefined,
    ]"
    :style="{ '--sdt-icon-size': `${size}px` }"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <svg
      v-if="definition"
      :viewBox="definition.viewBox || '0 0 24 24'"
      :fill="definition.stroke ? 'none' : 'currentColor'"
      :stroke="definition.stroke ? 'currentColor' : 'none'"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path v-for="(path, index) in iconPaths" :key="index" :d="path" />
    </svg>
  </span>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { resolveSvgIcon } from '../core/icons.js'
import type { DataTableIcon } from '../types/index.js'
const props = withDefaults(
  defineProps<{
    icon?: DataTableIcon
    label?: string
    size?: number
    leading?: boolean
    tone?: 'success' | 'error'
  }>(),
  { size: 18, icon: undefined, label: undefined, tone: undefined },
)
const definition = computed(() => resolveSvgIcon(props.icon))
const iconPaths = computed(() =>
  !definition.value
    ? []
    : typeof definition.value.path === 'string'
      ? [definition.value.path]
      : definition.value.path,
)
</script>
