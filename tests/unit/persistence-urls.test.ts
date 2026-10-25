/** Behavioral cases adapted from vue2-smart-datatable v0.3.1 and extended for
 * the accepted Vue 3 contract. MIT, copyright 2026 Mohammad Reza Dehghani. */
import { afterEach, expect, test, vi } from 'vitest'
import { createLocalStoragePersistenceAdapter } from '../../src/adapters/persistence/local-storage.js'
import { sanitizeUrl } from '../../src/core/urls.js'

afterEach(() => vi.unstubAllGlobals())

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

test('round trips versioned columns, keeps prefixes isolated, and rejects corrupt storage', async () => {
  const storage = memoryStorage()
  const adapter = createLocalStoragePersistenceAdapter({
    storage,
    prefix: 'test:',
  })
  await adapter.save('a', { version: 1, visibleColumns: ['id', 'id', 'name'] })
  expect(await adapter.load('a')).toEqual({
    version: 1,
    visibleColumns: ['id', 'name'],
  })
  expect(
    await createLocalStoragePersistenceAdapter({
      storage,
      prefix: 'other:',
    }).load('a'),
  ).toBeNull()
  for (const raw of [
    '{',
    'null',
    '{}',
    '{"version":2,"visibleColumns":[]}',
    '{"version":1,"visibleColumns":[1]}',
  ]) {
    storage.setItem('test:a', raw)
    expect(await adapter.load('a')).toBeNull()
  }
  await adapter.remove('a')
  expect(storage.values.size).toBe(0)
})

test('stays safe with no window, blocked storage getters and quota/read/remove failures', async () => {
  const noBrowser = createLocalStoragePersistenceAdapter()
  await noBrowser.save('a', { version: 1, visibleColumns: ['id'] })
  expect(await noBrowser.load('a')).toBeNull()
  vi.stubGlobal('window', {
    get localStorage() {
      throw new Error('SecurityError')
    },
  })
  const blocked = createLocalStoragePersistenceAdapter()
  expect(await blocked.load('a')).toBeNull()
  await expect(
    blocked.save('a', { version: 1, visibleColumns: [] }),
  ).resolves.toBeUndefined()
  await expect(blocked.remove('a')).resolves.toBeUndefined()
  const fail = () => {
    throw new Error('storage unavailable')
  }
  const throwing = createLocalStoragePersistenceAdapter({
    storage: { getItem: fail, setItem: fail, removeItem: fail },
  })
  expect(await throwing.load('a')).toBeNull()
  await expect(
    throwing.save('a', { version: 1, visibleColumns: [] }),
  ).resolves.toBeUndefined()
  await expect(throwing.remove('a')).resolves.toBeUndefined()
})

test('keeps the reference URL allowlist and rejects executable/inappropriate schemes', () => {
  for (const url of [
    'https://example.com',
    '/path',
    './path',
    '#section',
    'mailto:a@example.com',
    'tel:123',
  ])
    expect(sanitizeUrl(url, 'link')).toBe(url)
  expect(sanitizeUrl('/avatar.png', 'image')).toBe('/avatar.png')
  expect(sanitizeUrl('blob:https://example.com/id', 'image')).toBe(
    'blob:https://example.com/id',
  )
  for (const url of [
    'javascript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,unsafe',
    'vbscript:msgbox(1)',
  ])
    expect(sanitizeUrl(url, 'link')).toBe('')
  for (const url of [
    'mailto:a@example.com',
    'data:image/svg+xml,unsafe',
    'javascript:alert(1)',
  ])
    expect(sanitizeUrl(url, 'image')).toBe('')
})
