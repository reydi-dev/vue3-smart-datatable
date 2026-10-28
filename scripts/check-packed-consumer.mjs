import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const root = fileURLToPath(new URL('../', import.meta.url))
const temporary = await mkdtemp(join(tmpdir(), 'vue3-datatable-consumer-'))
const consumer = join(temporary, 'app')
const preview = process.argv.includes('--preview')
let server,
  browser,
  keep = false
function run(command, args, cwd = consumer) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 180_000,
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, NODE_PATH: '' },
  })
}
const report = {
  node: process.version,
  platform: process.platform,
  vue: '3.5.44',
  typescript: '5.9.3',
  vueTsc: '3.3.13',
  checks: [],
}
try {
  const [pack] = JSON.parse(
    run('npm', ['pack', '--json', '--pack-destination', temporary], root),
  )
  const paths = pack.files.map((f) => f.path)
  for (const required of [
    'dist/smart-data-table.js',
    'dist/smart-data-table.css',
    'dist/types/index.d.ts',
    'dist/types/components/SmartDataTable.vue.d.ts',
    'dist/types/types/index.d.ts',
    'LICENSE',
  ])
    assert.ok(paths.includes(required), `Missing ${required}`)
  assert.ok(
    paths.every((path) =>
      /^(dist\/.*\.(?:js|css|d\.ts)|README\.md|LICENSE|CHANGELOG\.md|package\.json)$/.test(
        path,
      ),
    ),
    'Unexpected packaged source/fixture/config/secret file',
  )
  const bundle = await readFile(join(root, 'dist/smart-data-table.js'), 'utf8')
  assert.match(bundle, /from ["']vue["']/)
  assert.doesNotMatch(
    bundle,
    /@vue\/runtime-core|Avery Chen|Riley Park|Installed package preview|PipelineProbe|StateProbe/,
  )
  assert.ok(
    pack.size < 150_000 && pack.unpackedSize < 500_000,
    'Review unexpected package size growth',
  )
  report.package = {
    filename: pack.filename,
    bytes: pack.size,
    unpackedBytes: pack.unpackedSize,
    integrity: pack.integrity,
    files: paths,
  }
  console.log(
    `Packed ${pack.filename}: ${pack.size} bytes compressed, ${pack.unpackedSize} bytes unpacked, ${paths.length} intended files.`,
  )
  await cp(join(root, 'tests/fixtures/packed-consumer'), consumer, {
    recursive: true,
    filter: (path) => !path.split(sep).includes('node_modules'),
  })
  assert.ok(
    !(await realpath(consumer)).startsWith(await realpath(root)),
    'Consumer must be outside the repository',
  )
  run('npm', ['ci', '--no-audit', '--no-fund'])
  run('npm', [
    'install',
    '--no-save',
    '--package-lock=false',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    join(temporary, pack.filename),
  ])
  const installed = join(
    consumer,
    'node_modules/@reydi-dev/vue3-smart-datatable',
  )
  assert.equal((await lstat(installed)).isSymbolicLink(), false)
  const installedManifest = JSON.parse(
    await readFile(join(installed, 'package.json'), 'utf8'),
  )
  assert.equal(installedManifest.name, '@reydi-dev/vue3-smart-datatable')
  const vue = JSON.parse(
    await readFile(join(consumer, 'node_modules/vue/package.json'), 'utf8'),
  )
  assert.equal(vue.version, report.vue)
  run('npm', ['ls', 'vue', '--all'])
  report.checks.push(
    'actual tarball installed outside repository without symlink/source aliases',
  )
  console.log('Independent install and Vue peer graph passed.')
  run('npm', ['run', 'typecheck'])
  const negative = spawnSync(
    process.execPath,
    [
      'node_modules/vue-tsc/bin/vue-tsc.js',
      '--noEmit',
      '-p',
      'tsconfig.invalid.json',
    ],
    {
      cwd: consumer,
      encoding: 'utf8',
      timeout: 60_000,
      env: { ...process.env, NODE_PATH: '' },
    },
  )
  assert.ifError(negative.error)
  const output = negative.stdout + negative.stderr
  const errors = output.split('\n').filter((line) => /error TS\d+:/.test(line))
  assert.notEqual(
    negative.status,
    0,
    'Invalid consumer unexpectedly typechecked',
  )
  assert.equal(errors.length, 2, output)
  assert.ok(
    errors.some(
      (line) =>
        /InvalidConsumer\.vue.*TS2322/.test(line) && /number/.test(line),
    ),
    output,
  )
  assert.ok(
    errors.some(
      (line) =>
        /InvalidConsumer\.vue.*TS2339/.test(line) &&
        /missingProperty/.test(line),
    ),
    output,
  )
  report.checks.push(
    'strict consumer declarations/templates and exact expected negative errors',
  )
  console.log(
    'Independent generic props/models/events/slots/adapters and negative types passed (skipLibCheck=false).',
  )
  const build = run('npm', ['run', 'build'])
  assert.match(
    build,
    /Packed ESM import and SSR without window\/document passed/,
  )
  report.checks.push(
    'ordinary production client and server builds; Node ESM import and SSR without DOM globals',
  )
  console.log(
    'Production client/server builds, ESM import and Node SSR passed.',
  )
  const dist = join(consumer, 'dist')
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      )
      const file = resolve(
        dist,
        '.' + (pathname === '/' ? '/index.html' : pathname),
      )
      if (!file.startsWith(dist + sep)) {
        response.writeHead(403).end()
        return
      }
      const bytes = await readFile(file)
      response.writeHead(200, {
        'Content-Type':
          {
            '.html': 'text/html; charset=utf-8',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.svg': 'image/svg+xml',
          }[extname(file)] || 'application/octet-stream',
      })
      response.end(bytes)
    } catch {
      response.writeHead(404).end()
    }
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const url = `http://127.0.0.1:${server.address().port}/`
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  })
  report.browser = browser.version()
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    acceptDownloads: true,
  })
  const hydration = []
  for (const width of [1280, 375]) {
    const page = await context.newPage()
    await page.setViewportSize({ width, height: 900 })
    const failures = []
    page.on('pageerror', (error) => failures.push(error.message))
    page.on('console', (message) => {
      if (
        message.type() === 'error' ||
        /hydration.*mismatch/i.test(message.text())
      )
        failures.push(message.text())
    })
    let resumeClient
    const clientGate = new Promise((resolve) => {
      resumeClient = resolve
    })
    await page.route('**/assets/*.js', async (route) => {
      await clientGate
      await route.continue()
    })
    try {
      await page.goto(url, { waitUntil: 'commit' })
      await page
        .locator('main[data-hydrated="false"] tbody tr')
        .first()
        .waitFor()
      assert.equal(await page.locator('tbody tr').count(), 10)
      assert.equal(await page.locator('.sdt-mobile__row').count(), 0)
    } finally {
      resumeClient()
    }
    await page.locator('main[data-hydrated="true"]').waitFor()
    const mobile = width < 960
    await page
      .locator(mobile ? '.sdt-mobile__row' : 'tbody tr')
      .first()
      .waitFor()
    assert.equal(
      await page
        .locator('.sdt-root')
        .evaluate((el) =>
          getComputedStyle(el).getPropertyValue('--sdt-accent').trim(),
        ),
      '#087c63',
      'Exported CSS did not load',
    )
    assert.equal(
      await page.locator('.customer-name').first().getAttribute('data-mobile'),
      String(mobile),
    )
    await page
      .getByRole('checkbox', { name: 'Select row 1', exact: true })
      .check()
    await page.getByText('1 selected', { exact: true }).waitFor()
    if (mobile) {
      await page
        .getByRole('button', { name: 'Open row 1', exact: true })
        .click()
    } else {
      await page
        .locator('tbody tr')
        .first()
        .getByRole('button', { name: 'View', exact: true })
        .click()
      assert.match(
        await page.locator('.feedback').innerText(),
        /View: Customer 00/,
      )
      await page.getByRole('button', { name: 'Name', exact: true }).click()
      assert.equal(
        await page.locator('th[aria-sort]').getAttribute('aria-sort'),
        'ascending',
      )
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      assert.equal(
        await page.locator('.sdt-pagination__page').innerText(),
        '2 of 4',
      )
      await page.getByRole('button', { name: 'Filters', exact: true }).click()
      await page.getByLabel('Name · Value', { exact: true }).fill('Customer 02')
      await page
        .getByText('Customer 02 · CUSTOMER 02', { exact: true })
        .waitFor()
      assert.equal(await page.locator('tbody tr').count(), 1)
      await page.getByRole('button', { name: 'Columns', exact: true }).click()
      await page
        .getByRole('dialog')
        .getByLabel('Balance', { exact: true })
        .uncheck()
      await page.getByRole('button', { name: 'Apply', exact: true }).click()
      assert.equal(
        await page
          .getByRole('columnheader', { name: 'Balance', exact: true })
          .count(),
        0,
      )
      const saved = await page.evaluate(() =>
        localStorage.getItem('packed-consumer:columns'),
      )
      assert.ok(saved && !JSON.parse(saved).visibleColumns.includes('balance'))
      const download = page.waitForEvent('download')
      await page.getByRole('button', { name: 'Export', exact: true }).click()
      await page
        .getByRole('button', { name: 'CSV — Current page', exact: true })
        .click()
      const file = await download
      assert.equal(file.suggestedFilename(), 'packed-customers.csv')
      assert.match(await readFile(await file.path(), 'utf8'), /CUSTOMER 02/)
    }
    await page
      .getByRole('button', { name: 'Clear selection through ref', exact: true })
      .click()
    await page.getByText('0 selected', { exact: true }).waitFor()
    assert.deepEqual(
      failures,
      [],
      `Packed ${mobile ? 'mobile' : 'desktop'} hydration/runtime failure`,
    )
    hydration.push({
      width,
      layout: mobile ? 'mobile' : 'desktop',
      errors: failures.length,
    })
    await page.close()
  }
  report.hydration = hydration
  report.checks.push(
    'real production desktop/mobile hydration, imported CSS and typed slots; selection/ref/query/storage/CSV interaction',
  )
  await browser.close()
  browser = undefined
  await mkdir(join(root, 'test-results'), { recursive: true })
  await writeFile(
    join(root, 'test-results/packed-consumer-report.json'),
    JSON.stringify(report, null, 2) + '\n',
  )
  console.log(
    'Packed production desktop/mobile hydration and selection/ref/query/storage/CSV checks passed.',
  )
  if (preview) {
    keep = true
    console.log(
      `Installed package preview: ${url} (production SSR build; Ctrl+C stops and removes the temporary consumer)`,
    )
    const close = async () => {
      await new Promise((resolve) => server.close(resolve))
      await rm(temporary, { recursive: true, force: true })
      process.exit(0)
    }
    process.once('SIGINT', close)
    process.once('SIGTERM', close)
  }
} catch (error) {
  if (error.stdout) console.error(String(error.stdout))
  if (error.stderr) console.error(String(error.stderr))
  console.error(error.status ? error.message : error.stack)
  process.exitCode = 1
} finally {
  if (!keep) {
    await browser?.close()
    if (server) await new Promise((resolve) => server.close(resolve))
    await rm(temporary, { recursive: true, force: true })
  }
}
