/** Behavioral cases adapted from vue2-smart-datatable v0.3.1 and extended for
 * the accepted Vue 3 contract. MIT, copyright 2026 Mohammad Reza Dehghani. */
import { expect, test, vi } from 'vitest'
import {
  buildCsv,
  createCsvExporter,
  normalizeCsvCell,
} from '../../src/adapters/exporters/csv.js'
import type { ExporterContext } from '../../src/types/index.js'

type Row = { id: number; text?: string }
function context(
  overrides: Partial<ExporterContext<Row>> = {},
): ExporterContext<Row> {
  return {
    scope: 'current',
    columns: [{ key: 'id', label: 'ID' }],
    rows: [{ id: 0 }],
    total: 1,
    request: {
      page: 3,
      itemsPerPage: 1,
      sort: null,
      filters: {},
      reason: 'export',
    },
    signal: new AbortController().signal,
    fileName: 'test',
    reportProgress: vi.fn(),
    fetchPage: vi.fn(async () => ({ items: [], total: 0 })),
    ...overrides,
  }
}

test('escapes quotes/newlines, neutralizes formulas and preserves long/leading-zero numbers', () => {
  for (const text of [
    '=2+2',
    '+cmd',
    '-2',
    '@SUM(A1)',
    '\t=1',
    '\r=1',
    '\n=1',
    '  =1',
    '\u0000=1',
    ' \t+1',
  ])
    expect(normalizeCsvCell(text)).toBe(`'${text}`)
  for (const text of ['001', '1234567890123456'])
    expect(normalizeCsvCell(text)).toBe(`'${text}`)
  expect(normalizeCsvCell(null)).toBe('')
  expect(normalizeCsvCell(false)).toBe('false')
  expect(normalizeCsvCell('<b>A</b><br>B')).toBe('A\nB')
  expect(normalizeCsvCell('='.repeat(40000))).toHaveLength(32767)
  expect(
    buildCsv([{ key: 'text', label: '=Header' }], [{ text: 'a,"b"\nnext' }]),
  ).toBe(`"'=Header"\r\n"a,""b""\nnext"\r\n`)
})

test('uses exportValue before formatter and creates BOM/name without browser globals', async () => {
  const download = vi.fn()
  const ctx = context({
    columns: [
      {
        key: 'id',
        label: 'ID',
        formatter: () => 'formatted',
        exportValue: (row) => `raw:${row.id}`,
      },
    ],
  })
  await createCsvExporter<Row>({ download, fileName: 'custom' }).export(ctx)
  const [bytes, name] = download.mock.calls[0]
  expect(Array.from(bytes.slice(0, 3))).toEqual([239, 187, 191])
  expect(new TextDecoder().decode(bytes)).toBe('"ID"\r\n"raw:0"\r\n')
  expect(name).toBe('custom.csv')
  expect(ctx.fetchPage).not.toHaveBeenCalled()
})

test('fetches all pages in order without altering the live request and reports bounded progress', async () => {
  const download = vi.fn()
  const fetchPage = vi.fn(async (page: number) => ({
    items: page === 1 ? [{ id: 1 }, { id: 2 }] : [{ id: 3 }],
    total: 3,
  }))
  const ctx = context({
    scope: 'all',
    total: 3,
    fetchPage,
    request: Object.freeze({
      page: 7,
      itemsPerPage: 25,
      sort: null,
      filters: {},
      reason: 'export' as const,
    }),
  })
  await createCsvExporter<Row>({ download, pageSize: 2 }).export(ctx)
  expect(fetchPage.mock.calls).toEqual([
    [1, 2],
    [2, 2],
  ])
  expect(ctx.request.page).toBe(7)
  expect(ctx.reportProgress).toHaveBeenLastCalledWith(100)
  expect(new TextDecoder().decode(download.mock.calls[0][0])).toBe(
    '"ID"\r\n"1"\r\n"2"\r\n"3"\r\n',
  )
})

test('rejects configured limits and incomplete/changing responses without a partial download', async () => {
  for (const options of [{ pageSize: 0 }, { maxRows: -1 }, { pageSize: 1.5 }])
    expect(() => createCsvExporter(options)).toThrow(RangeError)
  const download = vi.fn()
  const ctx = context({ scope: 'all', total: 3 })
  await expect(
    createCsvExporter<Row>({ download, maxRows: 2 }).export(ctx),
  ).rejects.toThrow(/maxRows/)
  expect(ctx.fetchPage).not.toHaveBeenCalled()
  for (const result of [
    { items: [{ id: 1 }], total: 3 },
    { items: [{ id: 1 }, { id: 2 }], total: 4 },
  ]) {
    await expect(
      createCsvExporter<Row>({ download, pageSize: 2 }).export(
        context({ scope: 'all', total: 3, fetchPage: async () => result }),
      ),
    ).rejects.toThrow(/changed|page size/)
  }
  await expect(
    createCsvExporter<Row>({ download, maxRows: 1 }).export(
      context({ rows: [{ id: 1 }, { id: 2 }] }),
    ),
  ).rejects.toThrow(/maxRows/)
  expect(download).not.toHaveBeenCalled()
})

test('honors cancellation before and after a provider that ignores abort', async () => {
  const download = vi.fn()
  const before = new AbortController()
  before.abort()
  await expect(
    createCsvExporter<Row>({ download }).export(
      context({ signal: before.signal }),
    ),
  ).rejects.toMatchObject({ name: 'AbortError' })
  const during = new AbortController()
  await expect(
    createCsvExporter<Row>({ download }).export(
      context({
        scope: 'all',
        signal: during.signal,
        fetchPage: async () => {
          during.abort()
          return { items: [{ id: 1 }], total: 1 }
        },
      }),
    ),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(download).not.toHaveBeenCalled()
})

test('propagates asynchronous download failures', async () => {
  const download = async () => {
    throw new Error('download failed')
  }
  await expect(
    createCsvExporter<Row>({ download }).export(context()),
  ).rejects.toThrow('download failed')
})

test('exports an empty result without fetching and fails default browser download only when invoked', async () => {
  const download = vi.fn()
  const ctx = context({ scope: 'all', total: 0, rows: [] })
  await createCsvExporter<Row>({ download }).export(ctx)
  expect(ctx.fetchPage).not.toHaveBeenCalled()
  expect(new TextDecoder().decode(download.mock.calls[0][0])).toBe('"ID"\r\n')
  await expect(createCsvExporter<Row>().export(context())).rejects.toThrow(
    /require a browser/,
  )
})
