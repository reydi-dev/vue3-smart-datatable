/**
 * Adapted from reydi-dev/vue2-smart-datatable v0.3.1,
 * commit 3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12.
 * MIT License, copyright (c) 2026 Mohammad Reza Dehghani; see LICENSE.
 */
import { formatColumnValue } from '../../core/columns.js'
import type {
  DataRow,
  DataTableColumn,
  ExporterAdapter,
  ExporterContext,
} from '../../types/index.js'

export interface CsvExporterOptions {
  key?: string
  label?: string
  fileName?: string
  pageSize?: number
  /** In-memory row ceiling. Exceeding it fails without a partial download. */
  maxRows?: number
  download?: (content: Uint8Array, fileName: string) => void | Promise<void>
}

const excelCellLimit = 32767
// Spreadsheet imports can ignore leading control characters before a formula.
// eslint-disable-next-line no-control-regex
const formulaPrefix = /^[\s\u0000-\u001f]*[=+\-@]/u
export function normalizeCsvCell(value: unknown): string {
  let text =
    value === null || value === undefined
      ? ''
      : String(value)
          .replace(/<br\s*\/?\s*>/gi, '\n')
          .replace(/<[^>]*>/g, '')
  // Include whitespace-prefixed formulas; CSV quoting alone does not neutralize them.
  if (formulaPrefix.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`
  if (/^0\d+$/.test(text) || /^\d{16,}$/.test(text)) text = `'${text}`
  const suffix = '\n[truncated]'
  return text.length > excelCellLimit
    ? text.slice(0, excelCellLimit - suffix.length) + suffix
    : text
}

export function escapeCsvCell(value: unknown): string {
  return `"${normalizeCsvCell(value).replace(/"/g, '""')}"`
}

export function buildCsv<Row extends object>(
  columns: readonly DataTableColumn<Row>[],
  rows: readonly Row[],
): string {
  const header = columns.map((column) => escapeCsvCell(column.label)).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((column) =>
          escapeCsvCell(
            column.exportValue
              ? column.exportValue(row)
              : formatColumnValue(column, row),
          ),
        )
        .join(','),
    )
    .join('\r\n')
  return `${header}\r\n${body}${body ? '\r\n' : ''}`
}

function encode(content: string): Uint8Array {
  const bytes = new TextEncoder().encode(content)
  const result = new Uint8Array(bytes.length + 3)
  result.set([0xef, 0xbb, 0xbf])
  result.set(bytes, 3)
  return result
}

function browserDownload(content: Uint8Array, fileName: string): void {
  if (
    typeof document === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    throw new Error(
      'CSV downloads require a browser; provide a download callback for other runtimes',
    )
  }
  const anchor = document.createElement('a')
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(content)], { type: 'text/csv;charset=utf-8' }),
  )
  try {
    anchor.href = url
    anchor.download = fileName
    document.body.append(anchor)
    anchor.click()
  } finally {
    anchor.remove()
    URL.revokeObjectURL(url)
  }
}

export function createCsvExporter<Row extends object = DataRow>(
  options: CsvExporterOptions = {},
): ExporterAdapter<Row> {
  const size = options.pageSize ?? 1000
  const limit = options.maxRows ?? 100000
  if (
    !Number.isSafeInteger(size) ||
    size < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1
  )
    throw new RangeError(
      'CSV pageSize and maxRows must be positive safe integers',
    )
  return {
    key: options.key ?? 'csv',
    label: options.label ?? 'CSV',
    scopes: ['current', 'all'],
    async export(context: ExporterContext<Row>) {
      context.signal.throwIfAborted()
      let rows: Row[] = []
      const total = context.total
      if (context.scope === 'all') {
        if (!Number.isInteger(total) || total < 0)
          throw new TypeError('Invalid export total')
        if (total > limit)
          throw new RangeError(`CSV export exceeds maxRows (${limit})`)
        const pages = Math.ceil(total / size)
        for (let page = 1; page <= pages; page++) {
          context.signal.throwIfAborted()
          const result = await context.fetchPage(page, size)
          context.signal.throwIfAborted()
          const expected = Math.min(size, total - rows.length)
          if (result.total !== total || result.items.length !== expected)
            throw new Error(
              'Export results changed or the backend did not honor the requested page size',
            )
          for (const row of result.items) rows.push(row)
          context.reportProgress((page / pages) * 90)
        }
      } else if (context.scope === 'current') {
        if (context.rows.length > limit)
          throw new RangeError(`CSV export exceeds maxRows (${limit})`)
        rows = [...context.rows]
      } else {
        throw new RangeError('Unsupported CSV export scope')
      }
      context.signal.throwIfAborted()
      const content = encode(buildCsv(context.columns, rows))
      context.reportProgress(100)
      context.signal.throwIfAborted()
      await (options.download ?? browserDownload)(
        content,
        `${options.fileName ?? context.fileName}.csv`,
      )
    },
  }
}
