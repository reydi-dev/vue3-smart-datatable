import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

// Compile the deliberately invalid template separately so failures cannot be
// suppressed accidentally or hidden by a passing positive typecheck.
const result = spawnSync(
  process.execPath,
  [
    'node_modules/vue-tsc/bin/vue-tsc.js',
    '--noEmit',
    '-p',
    'tests/contracts/tsconfig.invalid.json',
  ],
  { encoding: 'utf8' },
)
assert.ifError(result.error)
const output = result.stdout + result.stderr
assert.notEqual(result.status, 0, 'Invalid templates unexpectedly compiled')
const errors = output.split('\n').filter((line) => /error TS\d+:/.test(line))
assert.equal(errors.length, 2, output)
assert.ok(
  errors.some(
    (line) => /InvalidTemplate\.vue.*TS2322/.test(line) && /number/.test(line),
  ),
  output,
)
assert.ok(
  errors.some(
    (line) =>
      /InvalidTemplate\.vue.*TS2339/.test(line) && /missingProperty/.test(line),
  ),
  output,
)
console.log(
  'Contract errors verified: invalid page and generic slot property rejected.',
)
