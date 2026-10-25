import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('the package lists its declared outputs and excludes development sources', async () => {
  const [pack] = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' }),
  )
  const paths = pack.files.map((file) => file.path)
  for (const required of [
    'dist/smart-data-table.js',
    'dist/smart-data-table.css',
    'dist/types/index.d.ts',
    'dist/types/types/index.d.ts',
    'dist/types/adapters/exporters/csv.d.ts',
    'dist/types/adapters/persistence/local-storage.d.ts',
    'LICENSE',
  ]) {
    assert.ok(paths.includes(required), `Missing package output: ${required}`)
  }
  assert.ok(
    paths.every((path) =>
      /^(dist\/|README\.md$|LICENSE$|CHANGELOG\.md$|package\.json$)/.test(path),
    ),
  )
  const bundle = await readFile('dist/smart-data-table.js', 'utf8')
  assert.match(bundle, /from ["']vue["']/)
  assert.doesNotMatch(bundle, /createApp|@vue\/runtime-core/)
})

test('built root adapter exports can be imported and created without browser globals', async () => {
  const { createCsvExporter, createLocalStoragePersistenceAdapter } =
    await import('../../dist/smart-data-table.js')
  assert.deepEqual(createCsvExporter().scopes, ['current', 'all'])
  assert.equal(
    await createLocalStoragePersistenceAdapter().load('server-import'),
    null,
  )
})
