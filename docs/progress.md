# Project progress

## 2026-10-25 — Stage 0 completed; stage 1 prepared for review

### Destination and identity

- Workspace: `/Users/mohammadreza/Documents/ChatGPT/vue3-smart-datatable`.
- Started with an empty Git repository on `main`, no commits, and no origin.
- Public repository: https://github.com/reydi-dev/vue3-smart-datatable
- GitHub account verified through the configured Git credential helper: `reydi-dev`.
- `npm whoami` returned `reydi-dev`. Login alone does not prove future publishing
  permission or satisfy any future two-factor authentication requirement.
- `vue3-smart-datatable` already exists on npm (latest observed: `1.0.9`,
  maintainer: `m220020`). It is not this project.
- The user selected `@reydi-dev/vue3-smart-datatable`; its registry endpoint
  returned 404 at preflight. This is not a reservation or publishing guarantee.
- The GitHub destination returned 404 before creation. Authenticated creation
  succeeded with HTTP 201 under `reydi-dev`, visibility public.
- Node observed: `v24.21.0`; npm: `11.19.0`. Toolchain support and dependency
  versions have not been selected; stage 2 must verify official requirements.

### Stage 1 result

- Minimal main bootstrap commit: `5cf178c` (README, MIT LICENSE, Node/build/OS ignores).
- Work branch: `codex/project-foundation`.
- Added contributing/security guidance, changelog, agent guidance, a verbatim
  copy of the supplied plan, and a preliminary reference transfer inventory.
- Package name in the supplied plan remains historical; the confirmed scoped
  name recorded here overrides its original unscoped suggestion.
- No runtime code, package manifest, dependency installation, release, or demo
  deployment has been created.
- PR: https://github.com/reydi-dev/vue3-smart-datatable/pull/1 (approved and squash-merged).

### Validation

- Resolved local reference tag `v0.3.1` to
  `3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12`.
- Read its license, source inventory, responsive helper, and package manifest.
- Queried GitHub and npm directly for identity/name checks; no credentials
  were printed or committed. The GitHub CLI is absent; existing Git credentials
  were sufficient for the authenticated GitHub API and Git transport.
- Build, lint, typecheck, unit, browser, and distribution tests: not run;
  no toolchain or executable library exists at this stage.
- Whitespace validation: `git diff --cached --check` passed for all stage 1 files.
- Verified the stored implementation plan is byte-for-byte identical to the supplied document.
- CI: not configured; introduced in stage 2. No green CI claim is made.

### Next action

Completed: user approved stage 1; rechecked its head and mergeability, confirmed
no configured checks, and squash-merged as
`caffa1db1b840b6901b1f8720badcac9c4bc136a`. Deleted its working branch.

## 2026-10-25 — Stage 2 and public project tracking

### Scope and implementation

- User requested professional public issue/goal tracking for this portfolio repository.
- Created beta and stable milestones, descriptive work/status labels, repository
  topics, and stage issues #2–#13. Issues #2/#3 record completed stages 0/1
  retrospectively; #4 tracks the current stage. Future stages remain planned.
- Added a public roadmap, bug/feature issue forms, PR template, and contributor
  instructions connecting issues, PRs, validation evidence, and stage approval.
- Configured strict TypeScript, Vue 3 Composition API, Vite ESM library mode,
  external Vue, separate CSS/declarations, and isolated playground build.
- Added exact dependencies and lockfile, Node 24.21.0 version file, ESLint,
  Prettier, Vue Test Utils, Vitest and Playwright configuration.
- Added a temporary reactive `PipelineProbe`, clearly marked as non-product API.
  No table functionality or public release is claimed.
- Added read-only PR/main CI with cancellation of obsolete runs. It runs install
  from lockfile and the checks that actually have meaningful implementations.
- Recorded ESM-only output, conservative Vue peer range, and TypeScript 5.9.3
  compatibility choice in `docs/architecture.md`.

### Validation and limitations

- Dependency installation completed: 219 audited packages, zero reported vulnerabilities.
- `npm run validate` passed locally: formatting, lint, strict typecheck, 1 SFC
  component interaction check, library/declaration build, 1 package-output check
  (including `npm pack --dry-run` and external Vue), and playground build.
- Current library output is a probe only (0.69 kB JS, 0.21 kB CSS); these are not
  representative product size measurements.
- Unit and E2E suites do not exist yet; their commands are configured but not run
  or represented as passing. Browser download is unnecessary for this stage.
- The distribution check inspects package outputs; actual tarball installation
  and supported-version/SSR consumer checks remain stage 8.
- Clean lockfile install and validation also passed in GitHub CI. PR: https://github.com/reydi-dev/vue3-smart-datatable/pull/14.
  Final CI status is recorded below.
- Review caught and removed a dangling source CSS import in emitted declarations;
  styles now enter through the probe SFC and stay separately exported.
- Package remains `private: true`. No demo, npm package, tag, or Release published.

### Remote validation

- [CI run 40212865601](https://github.com/reydi-dev/vue3-smart-datatable/actions/runs/40212865601)
  passed for implementation commit `795b655517808339cec9a73aa9e8e9c33d2c3605`,
  including `npm ci` and the full `npm run validate` command on Ubuntu.
- This follow-up records the evidence only; no executable files changed.

### Next action

Completed after user approval and the branch naming correction recorded below.

### Stage 2 approval and branch naming correction

The user approved stage 2 subject to removing `codex` from branch names.
Renamed the local and GitHub working branch to
`chore/tooling-and-project-tracking`, and updated AGENTS, CONTRIBUTING, and the
implementation plan. All future branch names must omit that word. Historical
branch names above describe completed work only. The originally verbatim plan
is now intentionally amended by this explicit user instruction.

The approved implementation head `6046bd23861299e011bb32abba3883220c88222a`
also passed [CI run 40212954156](https://github.com/reydi-dev/vue3-smart-datatable/actions/runs/40212954156).
The naming correction changes documentation only; merge follows a check of the
renamed PR head and available checks.

## 2026-10-25 — Stage 2 merged; stage 3 public contracts

### Merge and tracking

- GitHub automatically closed #14 when its head branch was renamed. Replacement
  PR #15 preserves that connection and the user's existing implementation approval.
- Rechecked PR #15 head `4d5ed75c9d6f735301840a19e25f3b18475d5a12` and its
  successful validate check, then squash-merged as
  `f909ca7fe08ce1253385c6178f2b44231266b7fb`.
- Removed the completed local/remote working branch. Issue #4 is closed;
  issue #5 is in progress. Current branch: `feat/public-contracts`.

### Stage 3 scope

- Added proposed generic public types for columns, models, provider/normalizer,
  events, slots, ref methods, export and persistence. Preserved the reference
  license notice and removed broad any/index-signature requirements for Row.
- Added a reference parity matrix covering props/events/slots/cells/ref/adapters,
  deliberate differences and named runtime acceptance cases for stages 4–8.
- Documented controlled/uncontrolled ownership, parent synchronization, event
  ordering, request cancellation, selection across pages, persistence races,
  disabled/autoLoad behavior, export bounds, and migration from Vue 2.
- Kept supported tooling baseline Vue 3.5.44 / TypeScript 5.9.3 / vue-tsc 3.3.13.
  Do not infer support for older versions from the macro availability alone.
- Added compile-only positive and negative TS/Vue examples, using a non-product
  ContractProbe to verify models, generic slots, formatter and event types.
- Fixed lint/formatter overlap with eslint-config-prettier and enabled dotted
  named slots in the existing Vue lint rule. Runtime dependencies unchanged.

### Validation and limits

- Targeted strict typecheck passed, including real rejection of a string page
  and a missing generic slot property in the deliberately invalid template.
- TypeScript expected-error cases check incompatible selection keys, formatter
  rows, breakpoint aliases, event/provider rows, and unexposed internal methods.
- `npm run validate` passed: formatting, lint, positive typecheck plus
  intentional negative-template verification, the existing 1 component check,
  ESM/CSS/declaration build, the existing 1 distribution-output check, and demo
  build. No redundant browser or unimplemented unit suite was run.
- PR: https://github.com/reydi-dev/vue3-smart-datatable/pull/16, linked to #5.
- [CI run 40214562578](https://github.com/reydi-dev/vue3-smart-datatable/actions/runs/40214562578)
  passed for implementation commit `b3c3e3d09e08c84bc21e1fbeae0e8e617e03bb9e`,
  including clean lockfile installation and all current checks.
- Confirmed remote branches are only `main` and `feat/public-contracts`; neither
  includes the prohibited word. This follow-up records results only.
- No table runtime, adapter, provider lifecycle, or keyboard interaction is
  implemented or claimed passing by the type fixtures. Their matrix checks are
  explicitly planned for the later implementation stages.
- No npm publication, public Release or demo deployment performed.

### Next action

Completed: the user approved the contract PR. Its current head and successful
checks were verified before merging; details follow in the stage 4 entry.

## 2026-10-25 — Stage 3 merged; stage 4 core and adapters

### Merge and tracking

- User approved the prepared stage 3 result. Rechecked PR #16 head
  `3ff3dd2d4777fa5e48bcd04f12d3d5b1ce34ef3c` and its successful validate check.
- Squash-merged #16 as `e252fa104f07acbb4afbada62af97eb14fd2053e`.
  Removed its local and remote branch and cleared the closed issue #5 status label.
- Stage 4 is tracked in #6; current branch: `feat/core-and-adapters`.

### Implementation

- Adapted pinned MIT-licensed reference helpers for columns, nested values,
  formatting, visibility, filters, stable sorting/paging, row identity, selection,
  provider response normalization, localized page parsing and URL safety.
- Pure core contains no Vue, DOM, styles, playground, or reference-path imports.
  Browser viewport observation remains deferred to its composable/UI stage.
- Corrected missing-number filter coercion, stable nullish/invalid sorting, and
  validation of primitive/sparse provider rows, invalid totals and duplicate keys.
  Business Row schema validation remains consumer-owned; the one generic boundary
  assertion follows explicit transport-container validation.
- Preserved inactive local partial ranges and retained them in provider filters,
  including zero/false values. Input arrays/schemas/clauses are not mutated.
- Added CSV current/all export with BOM, quoting, CRLF, HTML-to-text conversion,
  formula neutralization (including leading whitespace/control characters), numeric
  text preservation, cell truncation, exportValue, progress and filename options.
- Implemented the approved 100,000 default maxRows cap, cancellation checkpoints,
  complete-page/consistent-total checks, and no partial downloads. Async injected
  download failures propagate. Default browser download is lazy with URL cleanup.
- Added lazy optional localStorage persistence with injected storage support,
  validated version-1 string keys, prefix isolation and graceful blocked/corrupt/
  quota/read/remove behavior. Async state restore/save coordination remains stage 5.
- Exported adapter factories/options from the root, with explicit ESM type paths.
  Core functions stay internal and there are no invented adapter subpath exports.
- Added real unit suites to the existing validate command/CI and updated guidance
  to stop treating the unit suite as unwritten. No dependency was added.

### Actual validation

- `npm run validate` passed: format, lint, positive and expected-negative type
  checks, 23 unit checks, the existing 1 pipeline-component check, library/CSS/
  declaration build, 2 distribution checks (pack outputs plus built-root adapter
  import without browser globals), and playground build.
- After final CSV allocation/resource cleanup, reran the affected unit suite,
  library/declaration build and both distribution checks successfully.
- Node unit environment needs no browser or Vue mount. This verifies pure-helper
  imports and behavior, not a claim of testing after uninstalling Vue.
- Real table/provider lifecycle, reactive models, storage races, keyboard/mobile
  interaction, independently installed tarball, and SSR hydration remain later
  stages. E2E was not run because there is no actual UI suite yet.
- PR: https://github.com/reydi-dev/vue3-smart-datatable/pull/17 (awaiting stage approval).
- [CI run 40217339581](https://github.com/reydi-dev/vue3-smart-datatable/actions/runs/40217339581)
  passed on implementation commit `465c9dd71ece93044b79ce1d08f58cdf0d71d866`,
  including clean `npm ci` and the full current validate command on Ubuntu.
  This follow-up records results only; executable files are unchanged.
- Package remains private; no npm release, tag, GitHub Release or demo deployment.

### Next action

Completed after the user approved stage 4; its head and current checks were
reverified before merging. Stage 5 details follow.

## 2026-10-25 — Stage 4 merged; stage 5 reactive state/provider

### Merge and tracking

- User approved the prepared stage 4 PR. Rechecked #17 head
  `99734390ae1e2b78f5511d83c11c610362685edc` against the local head and successful
  validate check before squash merge.
- Merge commit: `9c1cd3adfba11faa6eba4fe23afa886e69f775dd`.
  Removed the completed local/remote branch; issue #6 is closed.
- Stage 5 is tracked by #7; branch: `feat/reactive-state-and-provider`.

### Implementation

- Added internal useDataTable/useDataSource/useColumnPersistence/useTableExport
  composables plus a small abort/emit helper. They are not root/headless exports.
- Models distinguish undefined ownership from explicit empty values, keep the
  parent authoritative, support handoff, avoid echo loops and coalesce accepted
  filter/sort/size/page transactions after the parent update flush.
- Implemented local row/total/error snapshots, selection across pages, displayed
  selected-row payloads, schema visibility changes, non-resurrecting removed sort,
  page correction/refusal behavior and the accepted six-method ref object.
- Provider work uses immediate invalidation, debounce, request IDs, AbortController
  and abortable awaits. Old successes/errors/finalizers cannot commit over newer
  data. Request/event containers are isolated from consumer mutation.
- Implemented autoLoad=false, explicit refresh/retry, disabled behavior, source/
  context/normalizer replacement, visible missing-provider errors even in manual
  mode, current-response validation, and timer/listener/disposal cleanup.
- Persistence guards newer parent/user intent and key changes, serializes writes
  per adapter/key, waits behind earlier writes before restoring a key, and skips
  queued work after disposal. Optional async failures do not become table errors.
- Export snapshots accepted query/columns/inputs, leaves live pagination unchanged,
  rejects concurrent/pending/failed/stale operations, clamps progress and aborts on
  source replacement/unmount even if consumer work ignores signal.
- Added pure query comparison/watch snapshots without changing local opaque select
  value identity. No Vue or DOM imports were introduced into core.
- Added a synthetic local/server StateProbe in the development playground and a
  mounted StateHarness for actual composable integration tests. The public table
  component, desktop/mobile renderers and UI are still not implemented.

### Actual validation

- Full `npm run validate` passed: format, lint, positive/expected-negative contract
  types, 25 unit checks, 26 component checks (including the existing pipeline
  probe), ESM/CSS/declaration build, 2 distribution checks and playground build.
- Following the final manual-mode missing-provider guard, reran strict typecheck
  and the affected 26 component checks successfully.
- Mounted tests use controlled promises, fake timers and real Vue parent/child
  model handling in jsdom. They cover stale/ignored-abort responses, accepted
  query event order, coalescing/rejection, source replacement, retry, manual loads,
  page correction, storage intent/key/write races, export snapshots/concurrency,
  mutation isolation, progress, and disposal. No snapshot-only or placeholder test
  was added to claim an unwritten feature.
- E2E/browser compatibility, actual table slot/keyboard/rendering behavior,
  independently installed tarball and SSR hydration remain stages 6–8; not run.
- Opaque consumer operations already started cannot be undone by this coordinator;
  signal must be honored to stop their external side effects. Late library state
  commits/events and new queued persistence work are still suppressed.
- No new dependency, publication, tag, public Release or demo deployment. Package
  remains private.
- PR: https://github.com/reydi-dev/vue3-smart-datatable/pull/18 (awaiting stage approval).
- [CI run 40221152186](https://github.com/reydi-dev/vue3-smart-datatable/actions/runs/40221152186)
  passed for implementation commit `0e8682d1bfb2f172d40bc8b558db34f6574a66eb`,
  including clean `npm ci` and the full validate command on Ubuntu. This follow-up
  records validation evidence only; executable files are unchanged.

### Next action

Review and approve the stage 5 PR before merge. Stage 6 (#8) connects the accepted
contracts and composables to the actual semantic desktop table and reference UI.

## 2026-10-25 — Stage 5 merged; stage 6 desktop UI

### Merge and tracking

- User approved stage 5. Rechecked PR #18 head
  `c0e57e292e1bb9d20aefe6829639cba8e233f2d9` and its successful validate check
  before squash merging.
- Merge commit: `a031a9f44393c942fe33b3fa27b4856a0511f59a`.
  Deleted the completed local/remote branch; issue #7 is closed.
- Stage 6 is tracked by #8, marked in progress; branch: `feat/desktop-table`.

### Implementation

- Replaced the pipeline export with the real generic SmartDataTable SFC, exposed
  as both default and named component, retaining root types/adapter factories.
  All six models preserve undefined ownership; canonical emits are declared and
  the instance exposes exactly the approved six methods.
- Wired existing composables into a semantic desktop renderer. Added sorting,
  selectable rows/pages with typed keys, explicit click/keyboard row activation,
  current state/slot context, row classes, scrolling/dense/fixed-header options,
  and visible/disabled/loading row actions with leading/trailing/menu presentation.
- Ported reference Clarity foundations/layout/controls/cells as plain CSS. Kept
  original tokens, inherited font and namespace, with MIT attribution. SVG objects
  use local drawings, without fonts or raw HTML; removed the old ancestor-dark
  bridge. No framework, Sass runtime or new dependency was introduced.
- Added native text/number/date/select/range filter controls, partial clauses,
  localized operator labels, custom filter setters and reset/no-results behavior.
  Added pagination size options and validated localized jump input, disabling
  navigation/size during pending/error/disabled states.
- Implemented all 12 cell types with text escaping, URL allowlists, SVG validation,
  clipboard success feedback/caught permission failures and expandable text.
  Controls/actions/links do not activate the row; normal cells can emit one
  cell-click and one explicitly enabled row-click.
- Forwarded specific/generic header and cell slots with correct priority, custom
  filters/actions/row-actions and replacement toolbar/footer/state/progress slots.
  Slot-presence detection runs during render so conditional parent slots update.
- Added native column dialog apply/reset/mandatory-column handling, Escape/Tab
  boundaries and trigger focus restoration. Export disclosure supports current/
  all adapters, progress and localized failure feedback. DOM listeners and async
  feedback are guarded on disposal; core remains independent of DOM/Vue.
- Replaced temporary PipelineProbe/StateProbe/ContractProbe files with the actual
  local/server synthetic customer playground and actual-SFC compile fixtures.
  The demo includes simulated provider failure/retry, column storage and CSV.

### Actual validation

- Full `npm run validate` passed: formatting, lint, positive/expected-negative
  actual-SFC template types, 25 unit tests, 33 component tests, library ESM/CSS/
  declarations, 2 preliminary distribution checks and playground production build.
- Eight new desktop integration scenarios replace the old placeholder mount test;
  existing 25 state/lifecycle scenarios remain. Tests verify actual UI wiring,
  defaults, exact payloads, slot changes, dialog/ref surface and export failures
  rather than duplicating pure-core implementation tests.
- Both real Chromium E2E flows passed locally. The local flow also passed after
  adding action-disclosure activation coverage. Verified local/server query UI,
  selection across pages, sort/filter reset, dialog Escape/focus, row keyboard
  activation, actual CSV download, pending guards, failure/retry, debounced
  filtering, page size and disabled controls, with no pageerror events.
- Local browser: existing Chromium 140.0.7339.16, selected with
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH on macOS 13. Playwright 1.64.1's browser
  installer rejects this OS; that installer was not reported as successful.
  CI installs its own matching Playwright Chromium on Ubuntu and runs both flows
  after clean npm ci/validate. CI evidence is recorded in the implementation PR.
- Inspected a real desktop screenshot: reference Clarity tokens, spacing,
  selection, sort indicator, fixed-height scrolling and footer render correctly.
  Screenshot checks are manual evidence, not snapshot assertions or a claim of
  full visual/mobile/RTL/theme/accessibility acceptance.
- Package remains private 0.0.0. No npm publish, public Release/tag or demo deploy.
  Packed independent consumers, SSR render/hydration and a supported browser/
  framework matrix remain stage 8; mobile and accessibility review remain stage 7.

### Next action

Review [stage 6 PR #19](https://github.com/reydi-dev/vue3-smart-datatable/pull/19)
and approve before merge.
Stage 7 (#9) adds mobile rendering and reviews RTL, themes, responsive behavior,
keyboard/accessibility and visual parity against the real table.

## 2026-10-25 — Stage 6 merged; stage 7 responsive/accessibility review

### Merge and tracking

- User approved stage 6. Rechecked PR #19 head
  `65ae6d9fd086b7cd80c3270bbb8287362ae4ba5e` and its successful full validate/
  Chromium check before squash merging.
- Merge commit: `def8ff4300d4f4229241f2e06e76f63bf6565e5b`.
  Deleted the completed local/remote branch; issue #8 is closed.
- Stage 7 is tracked by #9, marked in progress; branch:
  `feat/responsive-accessibility`.

### Implementation

- Added the reference mobile list/summary/details renderer with generic cell,
  action, row-actions and complete mobile-summary/details slot contexts. Explicit
  summary/order/limit, full-width fields, readable expanded text, row classes,
  selection and disabled/keyboard activation retain the accepted contracts.
- Added internal useResponsiveLayout: numeric width < breakpoint (default 960),
  exact-boundary desktop, mount-only viewport observation, live threshold updates
  and listener cleanup. No breakpoint aliases or browser access at module load.
- Kept one coordinator across layouts. Page/filter/sort/selection and current-page
  open details survive resize; resize alone does not refetch. Detail keys are
  pruned as rows leave the displayed page and cleared on row-key definition change.
- Server and first client render both use the desktop shell, switching to mobile
  only after mount. This intentionally permits a post-mount layout shift without
  guessing a server viewport. Renderer-specific props/listeners do not leak onto
  the other renderer's DOM root.
- Shared row action predicates/order/menu/guarded triggers between renderers.
  Added table naming and a usable sort-button hit area, preserved native mobile
  disclosure reading when disabled, and isolated numeric ranges/chips/expanded
  text for mixed-direction content.
- Adapted reference mobile CSS without a framework/font/dependency. Direction and
  palette remain table-scoped. Changed the light muted text token from #697773 to
  #687672 so tested text on the light tint also meets the 4.5:1 contrast target.
- Added development direction/theme controls and one mixed Persian/English record.
  Committed real desktop/mobile screenshots and a visual-review page, keeping
  these documentation artifacts outside the npm whitelist.

### Actual validation

- Full npm run validate passed: format, lint, actual-component positive/negative
  contract types, 25 unit tests, 37 component tests, ESM/CSS/types build, 2
  preliminary distribution checks and playground production build.
- Subsequently rechecked strict types and lint after adding positive mobile slot
  compile examples. No new runtime dependency or redundant core test was added.
- Four new mounted scenarios verify responsive boundaries/state/details retention,
  observer cleanup, mobile rules/contexts/guarded interactions and source SSR to
  jsdom hydration. Narrow-viewport hydration begins with identical desktop markup,
  then switches after mount without mismatch warnings. This is source/jsdom
  evidence; independent installed-package/browser SSR/hydration remains stage 8.
- All four actual Chromium E2E flows passed locally. Two added flows verify mobile
  server/filter/page/selection preservation across resize, no resize-only provider
  calls, keyboard details/Open row/actions, disabled reading, dialog Tab/Escape/
  focus return, scoped light/dark/RTL, mirrored navigation, selected palette
  contrasts >=4.5:1 and document overflow guards at 320/375 px.
- The screenshot/contrast flow passed again after changing its desktop capture to
  1440 px so all optional columns fit the review image. It also checks long plain
  DOM text wrapping; this extra sample is CSS evidence and is inserted after the
  regular screenshots, which contain actual component data.
- Inspected the three committed screenshots in docs/screenshots. Mobile captures
  are crops of a real first row with details open at 375 px; desktop is the real
  1440 px page. See [visual review](responsive-review.md) for context and scope.
- Local browser remains existing Chromium 140.0.7339.16 on macOS 13 via
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. CI installs matching Playwright Chromium on
  Ubuntu and runs all four flows after clean npm ci/validate; final-head CI
  evidence is linked in the implementation PR.
- Keyboard/contrast/scoped-style checks are focused evidence, not a screen-reader
  audit or second-browser support claim. No Firefox/WebKit claim is introduced.
- Package stays private 0.0.0. No npm publication, public Release/tag or demo deploy.

### Next action

Review [stage 7 PR #20](https://github.com/reydi-dev/vue3-smart-datatable/pull/20)
and the committed visual examples. Obtain
maintainer visual/stage approval before merge. Stage 8 (#10) verifies independent
packed consumers, declarations/CSS/exports and minimal SSR/browser hydration.

## 2026-10-28 — Stage 7 approved/merged; stage 8 installed package and SSR

### Merge and tracking

- User tested the live built preview and approved continuing. This completes the
  stage 7 visual/interaction approval; screenshots alone were not the approval UI.
- Rechecked PR #20 head `028fc0bdde394cbf64e4eb8e06959d8aba3e2ec6` and successful
  CI before squash merge. Merge commit:
  `1db82172bb283ea6605a5ede9b78b95f0677295f`.
- Deleted the completed local/remote branch; #9 is closed. Stage 8 is tracked by
  #10, marked in progress; branch: `test/package-consumers-and-ssr`.

### Implementation and evidence

- Added an independently locked consumer fixture and a real npm-pack/install
  harness. The harness copies the fixture to a fresh temporary project outside the
  repository, performs its own npm ci, installs the real archive, verifies an
  unpacked nonsymlink package/peer graph and clears NODE_PATH in subprocesses.
  No source aliases, workspace links, inherited tsconfig or SSR noExternal flags.
- The fixture imports the actual default/named component, public types, stylesheet
  and CSV/storage factories. Strict declarations (skipLibCheck=false) verify an
  ordinary Customer interface through columns/formatter, six models, event
  payloads, slots and ref methods. A separately compiled invalid fixture must
  produce exactly the invalid-page and missing-row-property diagnostics; checked
  ts-expect-error cases reject formatter/provider/selection mismatches.
- Standard production Vite client/server builds succeed. A separate Node process
  asserts window/document are absent, imports the installed ESM entry/adapters
  and renders the actual table. It inserts that SSR desktop shell into the client
  HTML; no browser storage/download action is invoked during SSR.
- Real Chromium checks hold client JS to inspect inert SSR rows at 1280/375 px,
  then release it and verify hydration without runtime/mismatch errors. Desktop
  stays a table, narrow layout changes to mobile after mount, and actual exported
  CSS/custom slot values work. Selection/ref behavior works in both layouts;
  desktop additionally verifies sorting, page/filter changes, persisted column
  choices, row actions and an actual CSV download from the installed package.
- Added a library build-graph guard against bundled Vue/@vue runtime and demo/test
  imports, plus actual archive path/extension and size-budget checks. Initial
  local archive: 39 intended files, 37,056 bytes compressed / 147,981 unpacked;
  later README/metadata edits can change exact size/integrity. The per-run report
  is authoritative. No source/fixture/demo output/config/credentials files are
  allowed by the archive whitelist.
- npm registry dist-tags on 2026-10-28 show selected stable Vue 3.5.44, identical
  to the declared minimum. One unique Vue version is verified, avoiding duplicate
  runs. Peer range remains ^3.5.44. Fixture tools are TS 5.9.3, vue-tsc 3.3.13,
  Vite 8.3.5/plugin-vue 6.0.10 and Node tooling types 24.19.2.
- Added test:consumer and preview:consumer. Preview performs the same installed
  checks and keeps the actual production SSR server alive for user testing until
  stopped. Normal checks clean up temporary projects/servers automatically.
- CI runs validate, the four existing source Chromium flows and the independent
  packed consumer, then uploads packed-consumer-evidence for seven days. The
  report contains selected/actual runtime/browser versions, archive file list,
  integrity/size and both hydration layouts. Final-head evidence is linked in PR.

### Actual local validation

- Full npm run validate passed: formatting/lint, positive/negative root contract
  types, 25 unit tests, 37 component tests, ESM/CSS/types build, 2 preliminary
  package checks and playground production build. No new unit/UI behavior tests
  duplicate the unchanged library implementation.
- The independent consumer passed strict positive/negative types, ordinary client/
  server builds, DOM-free Node SSR, both controlled browser hydration layouts and
  the installed selection/ref/query/storage/CSV interactions. Browser is existing
  Chromium 140.0.7339.16 on macOS 13 via explicit executable path. CI installs
  matching Playwright Chromium on Ubuntu; no second-browser/Nuxt claim is made.
- During fixture setup, SSR tooling required explicit @types/node; the checked
  ts-expect-error was moved onto its formatter line after formatting; and the
  fixture gained an explicit empty favicon to avoid an unrelated 404. No library
  runtime/contract change was required to make the independent consumer pass.
- The verified SSR scope is the deterministic installed-package example, not
  general Nuxt/framework integration or other Vue/TypeScript/Node generations.
- Package stays private 0.0.0. No npm publication, public Release/tag or demo deploy.

### Next action

Review the stage 8 PR linked from #10. After approval, merge and proceed to stage 9
(#11): release documentation and demo preparation. Publication/hosting remain
separate explicit approvals at their planned stages.
