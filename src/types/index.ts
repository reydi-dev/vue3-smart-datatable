/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 * Accepted Vue 3 contracts; runtime implementation proceeds in stages.
 */
export type DataRow = Record<string, unknown>
export type RowKey = string | number
export type RowKeyGetter<Row extends object = DataRow> = (row: Row) => RowKey
export type DataMode = 'local' | 'server'
export type Direction = 'ltr' | 'rtl'
export type MobileBreakpoint = number
export type DataTableTheme = 'light' | 'dark'

export interface SvgIconDefinition {
  path: string | readonly string[]
  viewBox?: string
  /** Stroke drawings use no fill; filled paths are the default. */
  stroke?: boolean
}
export type DataTableIcon = SvgIconDefinition
export type ExportScope = 'current' | 'all'

export type CellType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'chip'
  | 'icon'
  | 'image'
  | 'link'
  | 'copy'
  | 'expandable-text'
  | 'custom'

export type FilterOperator =
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'

export interface FilterClause {
  operator: FilterOperator
  value?: unknown
  from?: unknown
  to?: unknown
}

export type FilterState = Readonly<Record<string, Readonly<FilterClause>>>

export interface ColumnFilterDefinition {
  type?: 'text' | 'number' | 'date' | 'select'
  operators?: readonly FilterOperator[]
  defaultOperator?: FilterOperator
  placeholder?: string
}

export interface CellContext<Row extends object = DataRow> {
  row: Row
  rowKey: RowKey
  column: DataTableColumn<Row>
  value: unknown
  formattedValue: unknown
  rowIndex: number
  mobile: boolean
}

export interface DataTableColumn<Row extends object = DataRow> {
  key: string
  label: string
  field?: string | ((row: Row) => unknown)
  type?: CellType
  formatter?: (
    value: unknown,
    row: Row,
    column: DataTableColumn<Row>,
  ) => unknown
  sortable?: boolean
  sortKey?: string
  filterable?: boolean
  filter?: ColumnFilterDefinition
  options?: ReadonlyArray<{ label: string; value: unknown }>
  align?: 'start' | 'center' | 'end'
  width?: string | number
  minWidth?: string | number
  compact?: boolean
  hideable?: boolean
  hiddenByDefault?: boolean
  mobile?: { summary?: boolean; order?: number }
  cellClass?: ClassValue | ((context: CellContext<Row>) => ClassValue)
  headerClass?: ClassValue
  exportValue?: (row: Row) => unknown
  numberFormat?: Intl.NumberFormatOptions
  dateFormat?: Intl.DateTimeFormatOptions
  tooltip?: string | ((context: CellContext<Row>) => string)
}

export interface SortState {
  columnKey: string
  direction: 'asc' | 'desc'
}

export interface DataProviderRequest {
  page: number
  itemsPerPage: number
  sort: null | { columnKey: string; field?: string; direction: 'asc' | 'desc' }
  filters: FilterState
  context?: unknown
  signal?: AbortSignal
  reason:
    'initial' | 'page' | 'page-size' | 'sort' | 'filter' | 'refresh' | 'export'
}

export interface NormalizedData<Row extends object = DataRow> {
  items: readonly Row[]
  total: number
  meta?: unknown
}

export type DataProvider<
  Row extends object = DataRow,
  Raw = NormalizedData<Row> | readonly Row[],
> = (request: DataProviderRequest) => Promise<Raw>
export type ResponseNormalizer<Row extends object = DataRow> = (
  raw: unknown,
  request: DataProviderRequest,
) => NormalizedData<Row>

export interface RowAction<Row extends object = DataRow> {
  key: string
  label: string
  icon?: DataTableIcon
  color?: string
  position?: 'leading' | 'trailing' | 'menu'
  visible?: boolean | ((row: Row) => boolean)
  disabled?: boolean | ((row: Row) => boolean)
  loading?: boolean | ((row: Row) => boolean)
}

export interface PersistedColumnState {
  version: 1
  visibleColumns: readonly string[]
}

export interface PersistenceAdapter {
  load(key: string): Promise<PersistedColumnState | null>
  save(key: string, value: PersistedColumnState): Promise<void>
  remove(key: string): Promise<void>
}

export interface ExporterContext<Row extends object = DataRow> {
  scope: ExportScope
  columns: readonly DataTableColumn<Row>[]
  rows: readonly Row[]
  total: number
  request: DataProviderRequest
  fileName: string
  signal: AbortSignal
  reportProgress(percent: number): void
  fetchPage(page: number, itemsPerPage: number): Promise<NormalizedData<Row>>
}

export interface ExporterAdapter<Row extends object = DataRow> {
  key: string
  label: string
  scopes: readonly ExportScope[]
  export(context: ExporterContext<Row>): Promise<void>
}

export interface DataTableMessages {
  loading: string
  empty: string
  error: string
  retry: string
  rowsPerPage: string
  of: string
  filters: string
  clearFilters: string
  columns: string
  reset: string
  apply: string
  export: string
  currentPage: string
  allRows: string
  copy: string
  copied: string
  expand: string
  collapse: string
  actions: string
  selectAll: string
  selectRow?: string
  previousPage?: string
  nextPage?: string
  goToPage?: string
  go?: string
  invalidPage?: string
  trueValue?: string
  falseValue?: string
  notProvided?: string
  moreDetails?: string
  openRow?: string
  close?: string
  clearFilter?: string
  filterOperator?: string
  filterValue?: string
  filterFrom?: string
  filterTo?: string
  filterAny?: string
  filterOperators?: Partial<Record<FilterOperator, string>>
  noResults?: string
  exportFailed?: string
  table?: string
}

export interface DataTableIcons {
  sortAsc: DataTableIcon
  sortDesc: DataTableIcon
  filter: DataTableIcon
  columns: DataTableIcon
  export: DataTableIcon
  copy: DataTableIcon
  expand: DataTableIcon
  collapse: DataTableIcon
  previous: DataTableIcon
  next: DataTableIcon
  actions: DataTableIcon
  retry: DataTableIcon
}

export interface DataTableState {
  page: number
  itemsPerPage: number
  sort: SortState | null
  filters: FilterState
  selectedKeys: readonly RowKey[]
  visibleColumns: readonly string[]
  total: number
  loading: boolean
  error: unknown
}

export type ClassValue =
  | string
  | false
  | null
  | undefined
  | Readonly<Record<string, boolean | undefined>>
  | readonly ClassValue[]

/** Undefined means uncontrolled; null is the controlled unsorted value. */
export interface SmartDataTableProps<Row extends object = DataRow> {
  columns: readonly DataTableColumn<Row>[]
  mode?: DataMode
  items?: readonly Row[]
  dataProvider?: DataProvider<Row, unknown>
  normalizeResponse?: ResponseNormalizer<Row>
  providerContext?: unknown
  rowKey?: string | RowKeyGetter<Row>
  modelValue?: readonly RowKey[]
  page?: number
  itemsPerPage?: number
  pageSizeOptions?: readonly number[]
  sort?: SortState | null
  filters?: FilterState
  visibleColumns?: readonly string[]
  selectable?: boolean
  rowClickable?: boolean
  actions?: readonly RowAction<Row>[]
  columnVisibility?: boolean
  persistenceAdapter?: PersistenceAdapter
  persistenceKey?: string
  exporters?: readonly ExporterAdapter<Row>[]
  exportFileName?: string
  messages?: Partial<DataTableMessages>
  direction?: Direction
  theme?: DataTableTheme
  icons?: Partial<DataTableIcons>
  mobileBreakpoint?: MobileBreakpoint
  mobileSummaryLimit?: number
  filterDebounce?: number
  autoLoad?: boolean
  loading?: boolean
  disabled?: boolean
  dense?: boolean
  fixedHeader?: boolean
  height?: string | number
  showToolbar?: boolean
  showPagination?: boolean
  rowClass?: (row: Row, rowIndex: number) => ClassValue
}

export interface SelectionChange<Row extends object = DataRow> {
  keys: readonly RowKey[]
  /** Selected rows on the displayed page, not a cache of all selected records. */
  rows: readonly Row[]
}

export interface RowClick<Row extends object = DataRow> {
  row: Row
  rowKey: RowKey
  /** Zero-based position on the displayed page, retained from the reference. */
  index: number
  event: MouseEvent | KeyboardEvent
}

export interface RowActionEvent<Row extends object = DataRow> {
  row: Row
  rowKey: RowKey
  action: RowAction<Row>
  event: MouseEvent
}

export interface CellClick<
  Row extends object = DataRow,
> extends CellContext<Row> {
  event: MouseEvent
}

export interface LoadSuccess<Row extends object = DataRow> {
  request: DataProviderRequest
  result: NormalizedData<Row>
}

export interface LoadError {
  request: DataProviderRequest
  error: unknown
}

export interface ExportEvent {
  exporter: string
  scope: ExportScope
}

export interface ExportError extends ExportEvent {
  error: unknown
}

/** Named tuple payloads keep Vue template and TypeScript event spellings aligned. */
export interface SmartDataTableEmits<Row extends object = DataRow> {
  'update:modelValue': [keys: readonly RowKey[]]
  'update:page': [page: number]
  'update:itemsPerPage': [itemsPerPage: number]
  'update:sort': [sort: SortState | null]
  'update:filters': [filters: FilterState]
  'update:visibleColumns': [keys: readonly string[]]
  'selection-change': [selection: SelectionChange<Row>]
  'column-visibility-change': [keys: readonly string[]]
  'options-change': [request: DataProviderRequest]
  'load-start': [request: DataProviderRequest]
  'load-success': [payload: LoadSuccess<Row>]
  'load-error': [payload: LoadError]
  'loading-change': [loading: boolean]
  'export-start': [payload: ExportEvent]
  'export-success': [payload: ExportEvent]
  'export-error': [payload: ExportError]
  'row-click': [payload: RowClick<Row>]
  'row-action': [payload: RowActionEvent<Row>]
  'cell-click': [payload: CellClick<Row>]
}

export interface FilterSlotContext<Row extends object = DataRow> {
  column: DataTableColumn<Row>
  clause: Readonly<FilterClause> | undefined
  disabled: boolean
  setClause(clause: Readonly<FilterClause>): void
  clear(): void
}

export interface ActionSlotContext<Row extends object = DataRow> {
  action: RowAction<Row>
  row: Row
  rowKey: RowKey
  disabled: boolean
  loading: boolean
  trigger(event: MouseEvent): void
}

export interface RowActionsSlotContext<Row extends object = DataRow> {
  row: Row
  rowKey: RowKey
  actions: readonly RowAction<Row>[]
  disabled: boolean
}

export interface MobileSlotContext<Row extends object = DataRow> {
  row: Row
  rowKey: RowKey
  columns: readonly DataTableColumn<Row>[]
  rowIndex: number
  disabled: boolean
}

export interface StateSlotContext {
  state: DataTableState
}

/** Return values are intentionally unknown: Vue checks the slot input contract. */
export type SmartDataTableSlots<Row extends object = DataRow> = {
  toolbar?: (context: StateSlotContext) => unknown
  'toolbar-prepend'?: () => unknown
  'toolbar-append'?: () => unknown
  header?: (context: { column: DataTableColumn<Row> }) => unknown
  cell?: (context: CellContext<Row>) => unknown
  'row-actions'?: (context: RowActionsSlotContext<Row>) => unknown
  'mobile-summary'?: (context: MobileSlotContext<Row>) => unknown
  'mobile-details'?: (context: MobileSlotContext<Row>) => unknown
  loading?: () => unknown
  empty?: () => unknown
  error?: (context: { error: unknown; retry: () => Promise<void> }) => unknown
  footer?: (context: StateSlotContext) => unknown
  'export-progress'?: (context: { percent: number }) => unknown
} & {
  [Name in `header.${string}`]?: (context: {
    column: DataTableColumn<Row>
  }) => unknown
} & {
  [Name in `cell.${string}`]?: (context: CellContext<Row>) => unknown
} & {
  [Name in `filter.${string}`]?: (context: FilterSlotContext<Row>) => unknown
} & {
  [Name in `action.${string}`]?: (context: ActionSlotContext<Row>) => unknown
}

export interface SmartDataTableExpose {
  refresh(): Promise<void>
  resetFilters(): void
  clearSelection(): void
  resetColumnVisibility(): Promise<void>
  exportData(exporterKey: string, scope?: ExportScope): Promise<void>
  getState(): DataTableState
}
