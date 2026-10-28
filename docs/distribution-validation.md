# Installed package and SSR validation — stage 8

The consumer is installed from the actual `npm pack` tarball into a fresh temporary
project outside this repository. Its own lockfile pins Vue, Vite, TypeScript and
vue-tsc. It has no source alias, workspace dependency, `npm link`, development
symlink or inherited tsconfig. Root tooling only builds/packs the library and
drives the browser; the consumer resolves component/types/CSS/adapters from its
own installed package.

## Reproduce

```sh
npm ci
npm run build
npx playwright install chromium
npm run test:consumer
```

For an existing browser executable, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` as documented in contributing. Linux CI uses
`npx playwright install --with-deps chromium` before this check.

To keep a real installed-package preview open after the same checks:

```sh
npm run build
npm run preview:consumer
```

The script prints a local URL for its production SSR build. Ctrl+C closes the
preview and removes that temporary consumer. Ordinary `test:consumer` always
cleans up and exits. Neither command publishes a package or a website.

## Verified boundary

- Create a real tarball and check its whitelist: runtime JS, extracted CSS,
  declarations, package metadata, README, changelog and MIT license. No source,
  fixture, demo output, dotfile/config or credentials file is allowed in the
  archive. A build graph guard rejects bundled Vue/@vue runtime modules and
  playground/test imports; Vue stays external.
- Install fixture tooling with its own npm ci, then install the tarball as a normal
  npm package. Verify an actual unpacked package directory, not a symlink, and the
  consumer Vue peer graph. Clear NODE_PATH for subprocesses.
- Typecheck with strict mode and skipLibCheck=false. A normal Customer interface
  retains its row type through columns/formatter, six v-models, event payloads,
  ref methods and slots. Compile an invalid consumer separately: expect exactly
  the invalid page and missing slot-row property diagnostics; incompatible
  formatter/provider/selection examples use checked ts-expect-error directives.
- Build a normal Vite client plus SSR entry, without aliases or SSR noExternal
  overrides. Node imports the installed ESM component/default export and adapter
  factories, then renders the actual table without window/document. No browser
  storage or download action is invoked during SSR.
- Insert the server-rendered desktop shell into the production HTML. In real
  Chromium, temporarily hold client JS and inspect that inert SSR table at both
  1280 and 375 px. Release JS and verify hydration, the expected final layout,
  exported CSS, generic slot values and selection/ref interactions without
  hydration/runtime errors.
- On the production desktop consumer, verify sorting, page/filter updates, column
  changes persisted to browser localStorage, row actions and an actual CSV download.
  These effects are user interactions after hydration, not server rendering.

## Selected versions

| Component                  | Verified selection                                                               |
| -------------------------- | -------------------------------------------------------------------------------- |
| Vue peer minimum           | 3.5.44                                                                           |
| Selected stable Vue        | 3.5.44 (`npm view vue dist-tags`, checked 2026-10-28)                            |
| TypeScript / vue-tsc       | 5.9.3 / 3.3.13                                                                   |
| Consumer Vite / plugin-vue | 8.3.5 / 6.0.10                                                                   |
| Local Node                 | 24.21.0                                                                          |
| Browser                    | Chromium; local executable 140.0.7339.16, matching Playwright build in Ubuntu CI |

The minimum and selected stable Vue versions are identical, so one unique version
is installed/tested rather than repeating the same run. The peer range remains
`^3.5.44`; this is not evidence for a different Vue version, TypeScript generation,
Node version, browser engine or full Nuxt integration. The SSR scope is the local,
deterministic installed-package example above, including real browser hydration.

## Evidence and size

The machine-readable report is written to
`test-results/packed-consumer-report.json` (ignored locally) and uploaded by CI as
`packed-consumer-evidence`, retained for seven days. It records the actual Node/
platform/browser, selected tool versions, archive file list/integrity/sizes and
both hydration layouts. The PR links the final successful CI run.

The initial local stage 8 archive contained 39 intended files, approximately
37 KB compressed and 148 KB unpacked. README/metadata changes affect final size;
use the report for that run's exact values. The harness fails above a 150 KB
compressed / 500 KB unpacked review budget. This is an archive-size guard, not a
performance benchmark.

The package stays private 0.0.0. Release docs/demo and beta/stable publication
remain separate stages and approvals.
