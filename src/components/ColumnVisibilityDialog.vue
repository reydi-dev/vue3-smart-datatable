<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<template>
  <dialog
    ref="dialog"
    class="sdt-dialog"
    :aria-label="messages.columns"
    @keydown.tab="trapFocus"
    @cancel.prevent="close"
    @close="closed"
    @click="backdrop"
  >
    <div class="sdt-dialog__body">
      <header>
        <h2>{{ messages.columns }}</h2>
        <button type="button" class="sdt-control" @click="close">
          {{ messages.close || 'Close' }}
        </button>
      </header>
      <div class="sdt-dialog__columns">
        <label
          v-for="column in hideableColumns"
          :key="column.key"
          class="sdt-choice"
        >
          <input
            type="checkbox"
            class="sdt-checkbox"
            :checked="draft.includes(column.key)"
            :disabled="disabled"
            @change="change(column.key, $event)"
          />{{ column.label }}
        </label>
      </div>
      <footer>
        <button
          type="button"
          class="sdt-control"
          :disabled="disabled"
          @click="!disabled && emit('reset')"
        >
          {{ messages.reset }}</button
        ><button
          type="button"
          class="sdt-control sdt-control--primary"
          :disabled="disabled"
          @click="apply"
        >
          {{ messages.apply }}
        </button>
      </footer>
    </div>
  </dialog>
</template>
<script setup lang="ts" generic="Row extends object">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { inputChecked } from './interactions.js'
import type { DataTableColumn, DataTableMessages } from '../types/index.js'
const props = defineProps<{
  open: boolean
  columns: readonly DataTableColumn<Row>[]
  visibleColumns: readonly string[]
  messages: DataTableMessages
  disabled?: boolean
}>()
const emit = defineEmits<{
  close: []
  apply: [keys: readonly string[]]
  reset: []
}>()
const dialog = ref<HTMLDialogElement>(),
  draft = ref<string[]>([])
let returnFocus: HTMLElement | null = null
const hideableColumns = computed(() =>
  props.columns.filter((c) => c.hideable !== false),
)
function close() {
  emit('close')
}
function closed() {
  if (props.open) close()
  returnFocus?.focus()
  returnFocus = null
}
function syncDialog() {
  const el = dialog.value
  if (!el) return
  if (props.open) {
    draft.value = [...props.visibleColumns]
    if (!el.open) {
      returnFocus =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      if (el.showModal) el.showModal()
      else el.setAttribute('open', '')
    }
  } else if (el.open) {
    if (el.close) el.close()
    else {
      el.removeAttribute('open')
      closed()
    }
  }
}
watch(() => props.open, syncDialog, { flush: 'post' })
watch(
  () => props.visibleColumns,
  (value) => {
    draft.value = [...value]
  },
)
onMounted(syncDialog)
onBeforeUnmount(() => {
  if (dialog.value?.open) {
    if (dialog.value.close) dialog.value.close()
    else dialog.value.removeAttribute('open')
  }
  returnFocus?.focus()
})
function trapFocus(event: KeyboardEvent) {
  const controls = dialog.value?.querySelectorAll<HTMLElement>(
    'button:not(:disabled),input:not(:disabled)',
  )
  if (!controls?.length) return
  const first = controls[0],
    last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
function backdrop(event: MouseEvent) {
  if (event.target === dialog.value) close()
}
function change(key: string, event: Event) {
  if (props.disabled) return
  draft.value = inputChecked(event)
    ? [...new Set([...draft.value, key])]
    : draft.value.filter((k) => k !== key)
}
function apply() {
  if (props.disabled) return
  const fixed = props.columns
    .filter((c) => c.hideable === false)
    .map((c) => c.key)
  emit('apply', [...new Set([...fixed, ...draft.value])])
  close()
}
</script>
