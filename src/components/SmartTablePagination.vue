<!-- MIT License, copyright (c) 2026 Mohammad Reza Dehghani; adapted from vue2-smart-datatable v0.3.1. -->
<template>
  <div class="sdt-pagination">
    <label class="sdt-pagination__size">
      {{ labels.rowsPerPage }}
      <select
        :value="itemsPerPage"
        :disabled="disabled"
        @change="onPageSizeChange"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </label>
    <span class="sdt-pagination__count" aria-live="polite"
      >{{ firstItem }}–{{ lastItem }} {{ labels.of }} {{ total }}</span
    >
    <div class="sdt-pagination__navigation">
      <button
        type="button"
        class="sdt-pagination__button sdt-pagination__arrow"
        :disabled="navigationDisabled || currentPage <= 1"
        :aria-label="labels.previousPage"
        @click="navigate(currentPage - 1)"
      >
        <SmartTableIcon :icon="previousIcon" :size="18" />
      </button>
      <span class="sdt-pagination__page"
        >{{ currentPage }} {{ labels.of }} {{ pageCount }}</span
      >
      <button
        type="button"
        class="sdt-pagination__button sdt-pagination__arrow"
        :disabled="navigationDisabled || currentPage >= pageCount"
        :aria-label="labels.nextPage"
        @click="navigate(currentPage + 1)"
      >
        <SmartTableIcon :icon="nextIcon" :size="18" />
      </button>
    </div>
    <form class="sdt-pagination__jump" novalidate @submit.prevent="submitPage">
      <label>
        {{ labels.goToPage }}
        <input
          v-model="draft"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          :disabled="navigationDisabled"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="invalid ? errorId : undefined"
          @input="invalid = false"
        />
      </label>
      <button
        type="submit"
        class="sdt-pagination__button"
        :disabled="navigationDisabled"
      >
        {{ labels.go }}
      </button>
      <span
        v-if="invalid"
        :id="errorId"
        class="sdt-pagination__error"
        role="alert"
        >{{ labels.invalidPage }} 1–{{ pageCount }}</span
      >
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import SmartTableIcon from './SmartTableIcon.vue'
import { defaultMessages } from '../core/messages.js'
import { parsePageInput } from '../core/pagination.js'
import type { DataTableIcon, DataTableMessages } from '../types/index.js'
const props = defineProps<{
  page: number
  itemsPerPage: number
  total: number
  pageSizeOptions: readonly number[]
  messages: DataTableMessages
  previousIcon: DataTableIcon
  nextIcon: DataTableIcon
  disabled?: boolean
}>()
const emit = defineEmits<{
  'update:page': [page: number]
  'update:itemsPerPage': [size: number]
}>()
const draft = ref(String(props.page)),
  invalid = ref(false),
  errorId = useId()
const labels = computed(() => ({ ...defaultMessages, ...props.messages }))
const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.total / props.itemsPerPage)),
)
const currentPage = computed(() =>
  Math.min(Math.max(1, props.page), pageCount.value),
)
const navigationDisabled = computed(() => props.disabled || props.total === 0)
const firstItem = computed(() =>
  props.total === 0 ? 0 : (currentPage.value - 1) * props.itemsPerPage + 1,
)
const lastItem = computed(() =>
  Math.min(props.total, currentPage.value * props.itemsPerPage),
)
watch(
  () => [currentPage.value, pageCount.value, props.itemsPerPage],
  () => {
    draft.value = String(currentPage.value)
    invalid.value = false
  },
  { immediate: true },
)
function navigate(page: number) {
  if (
    !navigationDisabled.value &&
    page !== currentPage.value &&
    page >= 1 &&
    page <= pageCount.value
  )
    emit('update:page', page)
}
function submitPage() {
  if (navigationDisabled.value) return
  const page = parsePageInput(draft.value, pageCount.value)
  invalid.value = page === null
  if (page === null) return
  draft.value = String(page)
  navigate(page)
}
function onPageSizeChange(event: Event) {
  const size = Number((event.target as HTMLSelectElement).value)
  if (
    !props.disabled &&
    size !== props.itemsPerPage &&
    props.pageSizeOptions.includes(size) &&
    Number.isSafeInteger(size) &&
    size > 0
  )
    emit('update:itemsPerPage', size)
}
</script>
