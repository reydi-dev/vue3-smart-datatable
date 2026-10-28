import assert from 'node:assert/strict'
import { readFile, writeFile, lstat, realpath } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
assert.equal(typeof window, 'undefined')
assert.equal(typeof document, 'undefined')
const entry = fileURLToPath(
  import.meta.resolve('@reydi-dev/vue3-smart-datatable'),
)
const directory = resolve(dirname(entry), '..')
assert.equal(
  (await lstat(directory)).isSymbolicLink(),
  false,
  'Consumer must use an unpacked tarball, not a development symlink',
)
assert.equal(await realpath(directory), directory)
const library = await import('@reydi-dev/vue3-smart-datatable')
assert.equal(library.default, library.SmartDataTable)
assert.deepEqual(library.createCsvExporter().scopes, ['current', 'all'])
assert.equal(
  typeof library.createLocalStoragePersistenceAdapter().load,
  'function',
)
const { render } = await import('../dist-server/entry-server.js')
const html = await render()
assert.match(html, /sdt-desktop__table/)
assert.match(html, /Customer 00/)
assert.doesNotMatch(html, /sdt-mobile__row/)
assert.match(html, /data-hydrated="false"/)
const shell = await readFile('dist/index.html', 'utf8')
assert.ok(shell.includes('<!--ssr-outlet-->'))
await writeFile(
  'dist/index.html',
  shell.replace('<!--ssr-outlet-->', () => html),
)
console.log(
  'Packed ESM import and SSR without window/document passed; desktop shell prerendered.',
)
