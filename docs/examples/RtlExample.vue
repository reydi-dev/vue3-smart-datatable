<script setup lang="ts">
import { ref } from 'vue'
import SmartDataTable from '@reydi-dev/vue3-smart-datatable'
import '@reydi-dev/vue3-smart-datatable/styles.css'
import type {
  DataTableColumn,
  DataTableMessages,
  DataTableTheme,
} from '@reydi-dev/vue3-smart-datatable'
interface Customer {
  id: number
  name: string
  amount: number
  note: string
}
const items: readonly Customer[] = [
  {
    id: 1,
    name: 'آوا احمدی',
    amount: 125000,
    note: 'این داده‌ها آزمایشی هستند و اطلاعات مشتری واقعی نیستند.',
  },
  {
    id: 2,
    name: 'رضا حسینی',
    amount: 240000,
    note: 'متن بلند در نمای موبایل به‌صورت کامل قابل خواندن است.',
  },
  {
    id: 3,
    name: 'نیما کریمی',
    amount: 180000,
    note: 'تم و جهت فقط روی همین جدول اعمال می‌شوند.',
  },
]
const columns: readonly DataTableColumn<Customer>[] = [
  {
    key: 'name',
    label: 'نام',
    sortable: true,
    filterable: true,
    hideable: false,
    mobile: { summary: true, order: 0 },
  },
  {
    key: 'amount',
    label: 'مبلغ',
    type: 'number',
    mobile: { summary: true, order: 1 },
    formatter: (value) => new Intl.NumberFormat('fa-IR').format(Number(value)),
  },
  { key: 'note', label: 'یادداشت', type: 'expandable-text' },
]
const theme = ref<DataTableTheme>('light')
const messages: Partial<DataTableMessages> = {
  table: 'جدول مشتریان',
  loading: 'در حال دریافت…',
  empty: 'داده‌ای موجود نیست',
  noResults: 'نتیجه‌ای پیدا نشد',
  error: 'دریافت اطلاعات ناموفق بود',
  retry: 'تلاش دوباره',
  rowsPerPage: 'تعداد در صفحه',
  of: 'از',
  filters: 'فیلترها',
  clearFilters: 'پاک کردن فیلترها',
  columns: 'ستون‌ها',
  reset: 'بازنشانی',
  apply: 'اعمال',
  export: 'خروجی',
  currentPage: 'صفحهٔ جاری',
  allRows: 'همهٔ ردیف‌ها',
  copy: 'کپی',
  copied: 'کپی شد',
  expand: 'نمایش متن کامل',
  collapse: 'بستن متن',
  actions: 'عملیات',
  selectAll: 'انتخاب همهٔ ردیف‌های صفحه',
  selectRow: 'انتخاب ردیف',
  previousPage: 'صفحهٔ قبل',
  nextPage: 'صفحهٔ بعد',
  goToPage: 'برو به صفحه',
  go: 'برو',
  invalidPage: 'شمارهٔ صفحه در این بازه وارد شود:',
  moreDetails: 'جزئیات بیشتر',
  openRow: 'باز کردن ردیف',
  close: 'بستن',
  clearFilter: 'پاک کردن فیلتر',
  filterOperator: 'شرط',
  filterValue: 'مقدار',
  filterFrom: 'از',
  filterTo: 'تا',
  filterAny: 'همه',
  notProvided: 'ثبت نشده',
  trueValue: 'بله',
  falseValue: 'خیر',
  filterOperators: {
    contains: 'شامل',
    startsWith: 'شروع با',
    endsWith: 'پایان با',
    eq: 'برابر',
    neq: 'نابرابر',
  },
}
</script>
<template>
  <section dir="rtl" lang="fa" aria-labelledby="rtl-title">
    <h2 id="rtl-title">فارسی و راست‌به‌چپ</h2>
    <p>جهت، پیام‌ها و قالب اعداد قابل تنظیم هستند.</p>
    <button
      type="button"
      class="sdt-control"
      @click="theme = theme === 'light' ? 'dark' : 'light'"
    >
      {{ theme === 'light' ? 'تم تیره' : 'تم روشن' }}</button
    ><SmartDataTable
      :columns="columns"
      :items="items"
      :messages="messages"
      direction="rtl"
      :theme="theme"
    />
  </section>
</template>
