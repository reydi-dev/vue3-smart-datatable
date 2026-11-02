import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import { join } from 'node:path'
const base = '/vue3-smart-datatable/'
const html = await readFile('dist-demo/index.html', 'utf8')
for (const match of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
  assert.ok(match[1].startsWith(base), `Wrong Pages base: ${match[1]}`)
  await access(join('dist-demo', match[1].slice(base.length)))
}
const files = await readdir('dist-demo/assets')
for (const file of files.filter((file) => file.endsWith('.js'))) {
  const code = await readFile(join('dist-demo/assets', file), 'utf8')
  assert.doesNotMatch(
    code,
    /Fail next server|Server requests:|PipelineProbe|StateProbe|Packed data table consumer/,
  )
}
console.log(
  'Public demo base/assets verified; development interaction fixtures excluded.',
)
