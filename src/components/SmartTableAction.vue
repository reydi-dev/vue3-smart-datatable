<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<template>
  <button
    type="button"
    class="sdt-action"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    :style="{ color: actionColor }"
    @click="activate"
  >
    <span v-if="loading" class="sdt-action__spinner" aria-hidden="true" />
    <SmartTableIcon
      v-else-if="action.icon"
      :icon="action.icon"
      leading
      :size="16"
    />
    <span>{{ action.label }}</span>
  </button>
</template>
<script setup lang="ts" generic="Row extends object">
import { computed } from 'vue'
import SmartTableIcon from './SmartTableIcon.vue'
import type { RowAction } from '../types/index.js'
const props = defineProps<{
  action: RowAction<Row>
  disabled?: boolean
  loading?: boolean
}>()
const emit = defineEmits<{ click: [event: MouseEvent] }>()
const colors: Record<string, string> = {
  primary: 'var(--sdt-accent)',
  success: 'var(--sdt-success-color)',
  error: 'var(--sdt-error-color)',
  secondary: 'var(--sdt-muted-color)',
  warning: 'var(--sdt-warning-color)',
  info: 'var(--sdt-info-color)',
}
const actionColor = computed(() =>
  props.action.color
    ? Object.hasOwn(colors, props.action.color)
      ? colors[props.action.color]
      : props.action.color
    : undefined,
)
function activate(event: MouseEvent) {
  if (!props.disabled && !props.loading) emit('click', event)
}
</script>
