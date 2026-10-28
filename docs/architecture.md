# Architecture decisions

## Package and build

One repository and one npm package: `@reydi-dev/vue3-smart-datatable`.
The package stays private during development. The current `0.0.0` version is an
unpublished placeholder; beta/stable versions are assigned in release PRs.

Use Vue 3 Composition API and strict TypeScript. Vite library mode produces an
ESM entry and separately exported CSS (`/styles.css`); `vue-tsc` emits declarations
in a separate step. Vue is a peer dependency and external to the library bundle.
No CommonJS output is provided without a concrete consumer need. Only `dist`,
README, changelog, license, and npm-required metadata are packed.

Stage 6 replaces PipelineProbe with the real generic SmartDataTable component
(default and named export). Root CSV/storage factories are implemented; no adapter
subpaths exist. The temporary probe components and their placeholder mount test
have been removed.

The playground has its own Vite config and `dist-demo` output. It is excluded from
the package and is not deployed by CI. No router, store, HTTP client, UI framework,
font CDN, or dependency on the Vue 2 checkout is introduced.

## Runtime and tooling

Development and CI use Node 24.21.0 (`.nvmrc`), with engine range
`>=24.15.0 <25`. This is a toolchain constraint, not a tested SSR consumer matrix.
The installed jsdom requires Node 24.15 or later on this Node line. Exact tool
versions are stored in package.json and package-lock.json.

Vue 3.5.44 is the initially conservative peer minimum. Stage 3 must revisit the
required macros/generics; stage 8 must verify the final supported versions.
TypeScript 5.9.3 is deliberately selected because the installed typescript-eslint
supports TypeScript below 6.1; using the latest TypeScript 7 would exceed that
range. Builds do not replace the separate `vue-tsc --noEmit` check.

Official references checked during setup:

- [Vite getting started](https://vite.dev/guide/)
- [Vite library mode](https://vite.dev/guide/build.html#library-mode)
- [Vue TypeScript tooling](https://vuejs.org/guide/typescript/overview.html)
- [Vitest guide](https://vitest.dev/guide/)

## Dependency direction

Components depend on composables, composables on pure core, and core on types.
Adapters depend on contracts. Browser observers belong in composables/browser
code. Importing the library must not access window, document, or storage.
Future folders are introduced when they contain real code, not empty scaffolds.

## Validation policy

The current checks cover mounted state/provider/persistence/export fixtures,
the real desktop SFC, declared package outputs, external Vue,
formatting, lint, strict types, library build, and demo build. CI runs these checks
on PRs and main using `npm ci`. The distribution check is a preliminary output
check, not the independently installed consumer verification planned in stage 8.

Unit tests for pure core/adapters are implemented and run in CI from stage 4.
CI also installs Playwright Chromium on Ubuntu and executes four real desktop/
mobile E2E flows. Browser installation/test commands remain separate from validate.
No placeholder assertions or coverage target is used. Browser verification is
limited to the environments recorded in progress; a support matrix remains later.

## Stage 3 accepted public contract

Public contracts live in `src/types/index.ts` without a Vue or browser runtime
import. They adapt the pinned MIT-licensed reference, retain all 12 cell kinds,
and use Row extends object with unknown cell/provider values. The root exports
types, CSV/storage factories, and the stage 6 desktop component/default export.

Six optional model props use undefined to select uncontrolled ownership; defined
values are parent-authoritative. Use explicit generic props/emits/slots instead
of macro defaults that blur absent versus empty models. No local mirror of a
controlled prop is planned. Query transactions coalesce after the parent flush;
state/lifecycle logic belongs in composables, not renderers.

The accepted contract and intentional behavioral differences are in
[API](api.md), [contract matrix](contract-matrix.md), and
[migration](migration-from-vue2.md). Stage 3 approval established the acceptance boundary before core/provider/UI
work began.

Compile-only Vue fixtures now exercise the actual generic SmartDataTable SFC;
the temporary ContractProbe signature fixture has been removed. Positive examples include six v-models,
formatters, slots and row events. A separate vue-tsc run must reject exactly the
intentionally invalid page and missing generic slot property; TypeScript
@ts-expect-error cases additionally cover bad row/provider/model/breakpoint/ref
usage. These checks run as part of typecheck in CI and are not runtime behavior
tests. Actual component props/emits/slots reuse these interfaces.

Added eslint-config-prettier to turn off formatting rules that conflict with
Prettier. The valid-v-slot rule permits dotted slot names used by the retained
cell.<key> API. No runtime dependency was added.

## Stage 4 pure core and adapters

Port the reference logic with its MIT notice and pinned tag/commit recorded in
each adapted source file. Internal modules use explicit .js specifiers for emitted
ESM declarations. Core imports only pure local code and type-only contracts; no
Vue, browser observer, CSS, playground or local reference-path dependency is added.

Provider validation verifies arrays of object rows, filtered integer totals and
container copies, including custom normalizer results. One narrow assertion maps
validated objects to the consumer's generic Row; business schema validation remains
the consumer's responsibility. Displayed row identity validation is separate so
custom rowKey definitions can be applied without assuming id at the transport layer.

CSV stays an in-memory adapter with a finite default cap, cancellation checkpoints,
strict complete-page checks, and injected download for non-browser runtimes.
The storage wrapper resolves browser globals lazily and catches optional-storage
failures. Reactive restore precedence, serial saves, query snapshots, request race
handling and export lifecycle events are implemented in stage 5 composables. No browser listeners/timers are introduced in this stage.

## Stage 5 state and async coordination

- useDataTable owns optional model state, normalized schema/local results, public
  ref-method orchestration, selection and visibility transactions. Controlled
  props are read directly; an internal value is only authoritative when undefined.
- useDataSource owns server rows/total/error/pending, request identity/controllers,
  debounce, lifecycle events and current-data status. A synchronous watcher
  invalidates work; a post-flush watcher coalesces accepted queries. This avoids
  network calls for intermediate parent model updates and suppresses parent echoes.
- useColumnPersistence handles mount/key restore and serialized per-adapter/key
  writes. It guards against newer user/model intent, waits behind older writes
  before restoring a key, and skips queued work after disposal.
- useTableExport captures an accepted input snapshot and owns the separate export
  controller/progress lifecycle. It does not write live page/query state.

A small lifecycle helper settles aborted awaits even when consumer work ignores
signal, with listeners removed on completion or abort. Request IDs independently
protect data commits. The pure query helper compares structural query snapshots
(including dates and repeated values) while copying local select filter containers
without changing the identity of opaque selected business values.

All composables are internal. The StateHarness SFC tests their generic signatures
with Vue props/emits. SmartDataTable reuses the same props/emits contracts, defaults
enabled boolean options and leaves all six model props undefined when omitted.

State tests run in jsdom with controlled promises and fake timers; this is not
browser compatibility or full SSR evidence. Stage 6 replaces the temporary
StateProbe playground with the actual table. The dependency lockfile and runtime
dependency policy are unchanged.

## Stage 6 desktop UI

The public SFC wires props, named slot forwarding and canonical events to
useDataTable. Rendering and browser controls live under components; DOM event
helpers live alongside them, so core remains independent of Vue and DOM access.
There is no sorting/filtering/provider pipeline embedded in a renderer.

Reference Clarity CSS is adapted as plain CSS under the existing sdt namespace,
with original tokens, inherited font, independent palettes and no framework/font
or Sass dependency. The SFC includes styles for Vite extraction; the TypeScript
entry never imports a source CSS path. Stage 7 adds the reference mobile renderer styles.

Desktop, filters, pagination, cells, SVG icons, actions, export disclosure and
native column dialog are separate generic setup components. Dialog/document
listeners are installed on mount and removed on disposal. Export/copy feedback
ignores disposed component work. Vue useId generates per-instance pagination
error associations without module-level browser access or counters.

Dynamic specific slots are detected during render, avoiding a cached $slots
presence check that would miss conditional parent changes. UI integration tests
exercise these paths and the actual default booleans, model proposals, exact
payloads and public ref surface. The browser suite covers local/server controls,
error/retry, keyboard/dialog focus and a real CSV download. Stage 7 extends these
checks to mobile/RTL/themes. Stage 8 still owns
independent packed-consumer and SSR hydration validation.

## Stage 7 responsive rendering and interaction

useResponsiveLayout observes the browser viewport only after mount, with one
passive resize listener and scope cleanup. A null initial width always means
desktop, including server rendering and the first hydration render. A numeric
breakpoint uses strict width < threshold; no legacy breakpoint aliases return.
This keeps layout choice separate from model/query ownership.

SmartDataTable switches actual imported component objects without remounting the
coordinator. Both renderers disable arbitrary attribute fallthrough; internal
renderer-specific props/events cannot leak onto the other's DOM root. Open mobile
details are tracked by typed row keys at the table level, retained across resize
for current rows and pruned when those rows leave the page. No new public model
or exposed method is introduced.

SmartTableRowActions shares action predicates, guarded trigger payloads, ordering
and native disclosures across renderers. Mobile uses reference summary/details
rules, generic cell/action slots and accessible list/disclosure/open-row controls.
Shared cells retain bidi isolation and safe formatting; pagination isolates
numeric ranges for RTL. Table naming, header hit area and focused palette contrast
receive small accessibility fixes rather than a visual redesign.

Four focused mounted scenarios cover boundary changes, state/details retention,
observer cleanup, mobile contexts/guards and a source SSR/jsdom hydration shell.
Two added Chromium flows cover real resize/provider preservation, keyboard mobile
controls, dialog Tab/Escape/focus, scope/contrast, narrow overflow checks and actual
screenshots. Source hydration evidence does not replace the installed package and
browser SSR/hydration validation scheduled in stage 8. No new dependency or browser
support matrix is introduced.
