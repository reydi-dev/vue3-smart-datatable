import { onScopeDispose, shallowRef, watch } from 'vue'
import { normalizeProviderResponse } from '../core/provider.js'
import { processLocalData } from '../core/local-data.js'
import { validateRowKeys } from '../core/columns.js'
import { copyFilters, copyRequest } from '../core/query.js'
import { withAbort, type TableEmit } from './lifecycle.js'
import type {
  DataProviderRequest,
  DataTableColumn,
  ExportScope,
  SmartDataTableProps,
} from '../types/index.js'

export function useTableExport<Row extends object>(
  props: SmartDataTableProps<Row>,
  snapshot: () => {
    request: DataProviderRequest
    columns: readonly DataTableColumn<Row>[]
    allColumns: readonly DataTableColumn<Row>[]
    rows: readonly Row[]
    total: number
  },
  available: () => boolean,
  emit: TableEmit<Row>,
) {
  const exporting = shallowRef(false)
  const progress = shallowRef(0)
  let alive = true
  let controller: AbortController | undefined
  watch(
    [
      () => props.mode ?? 'local',
      () => props.dataProvider,
      () => props.normalizeResponse,
      () => props.providerContext,
    ],
    () => controller?.abort(),
    { flush: 'sync' },
  )
  onScopeDispose(() => {
    alive = false
    controller?.abort()
    exporting.value = false
    progress.value = 0
  })

  async function exportData(
    exporterKey: string,
    scope: ExportScope = 'current',
  ) {
    if (!alive) throw new DOMException('Table disposed', 'AbortError')
    if (exporting.value) throw new Error('An export is already running')
    const exporter = props.exporters?.find((item) => item.key === exporterKey)
    if (!exporter) throw new Error(`Unknown exporter: ${exporterKey}`)
    if (!exporter.scopes.includes(scope))
      throw new Error(`Exporter ${exporterKey} does not support ${scope}`)
    if (!available())
      throw new Error('Cannot export pending, failed, or stale data')
    const captured = snapshot()
    const provider = props.dataProvider
    const normalize = props.normalizeResponse
    const mode = props.mode ?? 'local'
    const rowKey = props.rowKey ?? 'id'
    const localItems = [...(props.items ?? [])]
    const name = props.exportFileName ?? 'export'
    const active = new AbortController()
    controller = active
    exporting.value = true
    progress.value = 0
    const payload = { exporter: exporterKey, scope }
    emit('export-start', payload)
    try {
      active.signal.throwIfAborted()
      await withAbort(
        Promise.resolve(
          exporter.export({
            scope,
            columns: captured.columns,
            rows: captured.rows,
            total: captured.total,
            request: {
              ...copyRequest(captured.request),
              signal: active.signal,
            },
            fileName: name,
            signal: active.signal,
            reportProgress(percent) {
              if (alive && !active.signal.aborted && Number.isFinite(percent))
                progress.value = Math.max(0, Math.min(100, percent))
            },
            async fetchPage(page, itemsPerPage) {
              active.signal.throwIfAborted()
              const request: DataProviderRequest = {
                ...captured.request,
                sort: captured.request.sort
                  ? { ...captured.request.sort }
                  : null,
                filters: copyFilters(captured.request.filters),
                page,
                itemsPerPage,
                reason: 'export',
                signal: active.signal,
              }
              const result =
                mode === 'local'
                  ? processLocalData(
                      localItems,
                      captured.allColumns,
                      request.filters,
                      request.sort,
                      page,
                      itemsPerPage,
                    )
                  : normalizeProviderResponse<Row>(
                      await withAbort(
                        Promise.resolve(
                          provider
                            ? provider(copyRequest(request))
                            : Promise.reject(
                                new Error(
                                  'dataProvider is required for server exports',
                                ),
                              ),
                        ),
                        active.signal,
                      ),
                      copyRequest(request),
                      normalize,
                    )
              active.signal.throwIfAborted()
              validateRowKeys(result.items, rowKey)
              return result
            },
          }),
        ),
        active.signal,
      )
      active.signal.throwIfAborted()
      if (alive) emit('export-success', payload)
    } catch (error: unknown) {
      if (alive) emit('export-error', { ...payload, error })
      throw error
    } finally {
      if (alive) {
        exporting.value = false
        progress.value = 0
        controller = undefined
      }
    }
  }
  return { exporting, progress, exportData }
}
