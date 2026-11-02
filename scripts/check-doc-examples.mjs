import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
const start = '<!-- quick-start:start -->',
  end = '<!-- quick-start:end -->'
const file = 'README.md'
const readme = await readFile(file, 'utf8')
const source = (
  await readFile('docs/examples/QuickStart.vue', 'utf8')
).trimEnd()
assert.equal(
  readme.split(start).length,
  2,
  'README needs one quick-start marker',
)
assert.equal(
  readme.split(end).length,
  2,
  'README needs one quick-start end marker',
)
const before = readme.slice(0, readme.indexOf(start) + start.length)
const after = readme.slice(readme.indexOf(end))
const expected = '\n\n```vue\n' + source + '\n```\n\n'
if (process.argv.includes('--write'))
  await writeFile(file, before + expected + after)
else
  assert.equal(
    readme.slice(before.length, readme.indexOf(end)),
    expected,
    'Run node scripts/check-doc-examples.mjs --write',
  )
console.log(
  'README quick start matches the SFC checked in the independent consumer.',
)
