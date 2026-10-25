<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<template>
  <div ref="root" class="sdt-export" @keydown.esc.stop.prevent="close(true)">
    <button
      ref="trigger"
      type="button"
      class="sdt-control"
      :aria-expanded="open ? 'true' : 'false'"
      :disabled="disabled || loading"
      :aria-busy="loading ? 'true' : undefined"
      @click="toggle"
    >
      <span
        v-if="loading"
        class="sdt-action__spinner"
        aria-hidden="true"
      /><SmartTableIcon v-else :icon="icon" :size="18" />{{ messages.export }}
    </button>
    <div
      v-if="open"
      class="sdt-export__panel"
      role="group"
      :aria-label="messages.export"
    >
      <template v-for="exporter in exporters" :key="exporter.key"
        ><button
          v-for="scope in exporter.scopes"
          :key="`${exporter.key}-${scope}`"
          type="button"
          :disabled="disabled || loading"
          @click="choose(exporter.key, scope)"
        >
          {{ exporter.label }} —
          {{ scope === 'current' ? messages.currentPage : messages.allRows }}
        </button></template
      >
    </div>
  </div>
</template>
<script setup lang="ts" generic="Row extends object">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import SmartTableIcon from './SmartTableIcon.vue'
import type {
  DataTableIcon,
  DataTableMessages,
  ExporterAdapter,
  ExportScope,
} from '../types/index.js'
const props = defineProps<{
  exporters: readonly ExporterAdapter<Row>[]
  messages: DataTableMessages
  icon: DataTableIcon
  loading?: boolean
  disabled?: boolean
}>()
const emit = defineEmits<{
  export: [payload: { exporter: string; scope: ExportScope }]
}>()
const root = ref<HTMLElement>(),
  trigger = ref<HTMLButtonElement>(),
  open = ref(false)
function close(restore: boolean) {
  open.value = false
  if (restore) trigger.value?.focus()
}
function toggle() {
  if (!props.disabled && !props.loading) open.value = !open.value
}
function outside(event: Event) {
  if (!root.value?.contains(event.target as Node)) close(false)
}
watch(
  () => props.disabled || props.loading,
  (value) => {
    if (value) close(false)
  },
)
onMounted(() => {
  document.addEventListener('pointerdown', outside)
  document.addEventListener('focusin', outside)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('focusin', outside)
})
function choose(exporter: string, scope: ExportScope) {
  if (props.disabled || props.loading) return
  close(true)
  emit('export', { exporter, scope })
}
</script>
