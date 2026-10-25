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

The temporary `PipelineProbe` verifies SFC compilation, reactive mounting, ESM,
declarations, and CSS output. It must be removed when the real component replaces
it. Its export is not an accepted table API. No adapter subpaths exist yet.

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

The current checks cover the pipeline SFC, declared package outputs, external Vue,
formatting, lint, strict types, library build, and demo build. CI runs these checks
on PRs and main using `npm ci`. The distribution check is a preliminary output
check, not the independently installed consumer verification planned in stage 8.

Unit and E2E commands are configured for future suites. They currently fail on
missing tests and are intentionally not included in CI until meaningful tests
exist. No `passWithNoTests`, placeholder assertions, or fake coverage target is
used. Playwright Chromium is configured but no browser support claim is made.

## Stage 3 proposed public contract

Public contracts live in `src/types/index.ts` without a Vue or browser runtime
import. They adapt the pinned MIT-licensed reference, retain all 12 cell kinds,
and use Row extends object with unknown cell/provider values. The root exports
types now, not a pretend working SmartDataTable component. Public adapter
factories and the component/default export wait for their real implementation.

Six optional model props use undefined to select uncontrolled ownership; defined
values are parent-authoritative. Use explicit generic props/emits/slots instead
of macro defaults that blur absent versus empty models. No local mirror of a
controlled prop is planned. Query transactions coalesce after the parent flush;
state/lifecycle logic belongs in composables, not renderers.

The complete proposal and intentional behavioral differences are in
[API](api.md), [contract matrix](contract-matrix.md), and
[migration](migration-from-vue2.md). Stage 3 approval is the acceptance boundary
before core/provider/UI work begins.

Compile-only Vue fixtures exercise the same exported type interfaces through a
non-product generic ContractProbe. Positive examples include six v-models,
formatters, slots and row events. A separate vue-tsc run must reject exactly the
intentionally invalid page and missing generic slot property; TypeScript
@ts-expect-error cases additionally cover bad row/provider/model/breakpoint/ref
usage. These checks run as part of typecheck in CI and are not runtime behavior
tests. Actual component props/emits/slots must reuse these contracts later.

Added eslint-config-prettier to turn off formatting rules that conflict with
Prettier. The valid-v-slot rule permits dotted slot names used by the retained
cell.<key> API. No runtime dependency was added.
