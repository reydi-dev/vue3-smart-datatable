import type { DataProvider } from '@reydi-dev/vue3-smart-datatable'
export interface Customer {
  id: number
  name: string
}
/** Your server returns { items: Customer[], total: number }; no request runs until called. */
export function createHttpProvider(url: string): DataProvider<Customer> {
  return async (request) => {
    const response = await fetch(url, {
      method: 'POST',
      signal: request.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: request.page,
        itemsPerPage: request.itemsPerPage,
        sort: request.sort,
        filters: request.filters,
      }),
    })
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    const raw: unknown = await response.json()
    if (
      !raw ||
      typeof raw !== 'object' ||
      !('items' in raw) ||
      !Array.isArray(raw.items) ||
      !('total' in raw) ||
      typeof raw.total !== 'number' ||
      !Number.isSafeInteger(raw.total) ||
      raw.total < raw.items.length
    )
      throw new TypeError('Invalid customer response')
    const items: Customer[] = raw.items.map((row: unknown) => {
      if (
        !row ||
        typeof row !== 'object' ||
        !('id' in row) ||
        typeof row.id !== 'number' ||
        !Number.isFinite(row.id) ||
        !('name' in row) ||
        typeof row.name !== 'string'
      )
        throw new TypeError('Invalid customer row')
      return { id: row.id, name: row.name }
    })
    return { items, total: raw.total }
  }
}
