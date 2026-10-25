# Vue 2 → Vue 3 contract matrix

Stage 3 contract approved. Runtime acceptance cases below describe the full table;
stage 4 implements the pure-core/adapter subset recorded at the end of this file.
The compile fixtures validate types only.
Reference: [v0.3.1](https://github.com/reydi-dev/vue2-smart-datatable/tree/v0.3.1),
commit `3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12`. Inspected the reference types,
SmartDataTable, both renderers, filters/cells, provider helpers and adapters via
Git object reads; the original checkout was not modified.

## Props

| Vue 2                                 | Vue 3                                    | Deliberate difference                                                               | Acceptance case                                               |
| ------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `columns`                             | columns                                  | Readonly generic columns; retain every column option.                               | C01 unique keys; formatter retains Row; no input mutation     |
| `mode / items`                        | mode / items                             | Readonly generic rows; explicit mode transitions.                                   | D01 local result; P04 cancel server work on mode switch       |
| `dataProvider / normalizeResponse`    | same names                               | Unknown boundary; validate totals/object rows; sort field falls back to column key. | P01 canonical/array/custom responses; invalid totals fail     |
| `providerContext`                     | providerContext                          | Replacement reloads; deep in-place mutation alone is not a trigger.                 | P04 replacement reload; old result cannot commit              |
| `rowKey`                              | rowKey                                   | Finite numeric keys; duplicate displayed keys rejected.                             | S01 zero/string keys; missing/NaN/duplicate errors            |
| `value`                               | modelValue / v-model                     | Remove Vue 2 value/input alias; strict controlled ownership.                        | M01 absent versus explicit empty selection                    |
| `page`                                | page / v-model:page                      | Strict controlled ownership; parent changes do not echo.                            | M02 one-based page and refused parent proposal                |
| `itemsPerPage`                        | itemsPerPage / v-model:items-per-page    | Canonical script event update:itemsPerPage.                                         | M03 size → page reset → one accepted query                    |
| `pageSizeOptions`                     | pageSizeOptions                          | Same defaults; validate positive integers.                                          | U01 footer options/jump validation and localized digits       |
| `sort`                                | sort / v-model:sort                      | Undefined uncontrolled, null controlled unsorted.                                   | M04 ascending/descending/null and reset order                 |
| `filters`                             | filters / v-model:filters                | Readonly clauses; one accepted debounced transaction.                               | M05 zero/false/range; parent batching and rejected proposal   |
| `selectable`                          | selectable                               | Retained; keys persist across dataset changes.                                      | S02 select/unselect page without losing off-page keys         |
| `actions`                             | actions                                  | Readonly generic actions.                                                           | U02 visible/disabled/loading predicates and exact payload     |
| `visibleColumns`                      | visibleColumns / v-model:visible-columns | Canonical script event update:visibleColumns; empty is explicit.                    | V01 mandatory columns and schema order                        |
| `columnVisibility`                    | columnVisibility                         | Retained; disables the built-in dialog affordance only.                             | V02 custom slot/ref path stays available                      |
| `persistenceAdapter / persistenceKey` | same names                               | Newer model/user changes beat stale async restores.                                 | V03 deferred restore/save races; bad version/storage failure  |
| `exporters / exportFileName`          | same names                               | Signal in context; snapshot query, serialized exports.                              | E01 current/all without changing live page; abort/concurrency |
| `messages`                            | messages                                 | Retain all message keys and merge defaults.                                         | U03 missing overrides, no-results and accessible labels       |
| `direction`                           | direction                                | Retain ltr/rtl, root scoped.                                                        | R01 RTL navigation/icons and isolation                        |
| `theme`                               | theme                                    | Unset now means light; remove ancestor .theme--dark bridge.                         | R02 explicit light/dark and contrast                          |
| `icons`                               | icons                                    | SVG objects only; remove MDI names/raw-path shorthand.                              | U04 render safe SVG definitions with no external font         |
| `mobileBreakpoint`                    | mobileBreakpoint                         | Numeric threshold only; remove Vuetify aliases.                                     | R03 below/exact threshold, mount/unmount cleanup              |
| `mobileSummaryLimit`                  | mobileSummaryLimit                       | Retain 3 and column mobile.summary/order controls.                                  | R04 summary/details state across resize                       |
| `filterDebounce`                      | filterDebounce                           | Retain 250 ms; invalidate stale work immediately.                                   | P02 debounce coalescing and ignored-abort provider            |
| `autoLoad`                            | autoLoad                                 | False suppresses every automatic provider request.                                  | P03 no mount/prop/context request; explicit refresh works     |
| `loading`                             | loading                                  | Additive external loading; not provider loading-change.                             | U05 state priority and pagination guard                       |
| `disabled`                            | disabled                                 | UI disabled; ref/parent updates still available.                                    | U06 controls/links/actions blocked; details remain readable   |
| `dense / fixedHeader / height`        | same names                               | Retain presentation controls.                                                       | R05 constrained height, wrapping and header positioning       |
| `showToolbar / showPagination`        | same names                               | Retain toggles and replacement slots.                                               | U07 toggles and full replacement regions                      |
| `rowClass`                            | rowClass                                 | Typed Row/index and ClassValue.                                                     | U08 row classes with object/array/string forms                |
| `listener-based activation`           | rowClickable (new prop)                  | Explicit false default; no listener inspection.                                     | I01 no activation unless enabled; one mouse/key event         |

## Events

| Vue 2                         | Vue 3                                      | Deliberate difference                                                | Acceptance case |
| ----------------------------- | ------------------------------------------ | -------------------------------------------------------------------- | --------------- |
| input                         | update:modelValue                          | Vue 3 model event; no input alias.                                   | M01, S02        |
| update:page                   | update:page                                | Only changed proposals; no parent echo.                              | M02             |
| update:items-per-page         | update:itemsPerPage                        | Canonical TS spelling; template kebab-case supported.                | M03             |
| update:sort / update:filters  | same names                                 | Primary proposal before page proposal; aggregate after parent flush. | M04, M05        |
| update:visible-columns        | update:visibleColumns                      | Canonical TS spelling; no duplicate alias emit.                      | V01             |
| selection-change              | selection-change({ keys, rows })           | Typed Row; accepted selection only, page rows only.                  | S02, M01        |
| column-visibility-change      | column-visibility-change(keys)             | Accepted normalized visibility after model flush.                    | V01             |
| options-change                | options-change(request)                    | Accepted query, correct reason, no signal; not selection/visibility. | M03–M05, P02    |
| load-start                    | load-start(request)                        | Server provider work only.                                           | P01, P03        |
| load-success                  | load-success({ request, result })          | No stale result events.                                              | P02             |
| load-error                    | load-error({ request, error })             | No stale/abort errors; current validation failures included.         | P01, P02        |
| loading-change                | loading-change(boolean)                    | Provider interval only; stale finalizer cannot clear new pending.    | P02             |
| export-start / export-success | same names ({ exporter, scope })           | Only after preflight accepts operation.                              | E01             |
| export-error                  | export-error({ exporter, scope, error })   | Abort/error typed; none after unmount.                               | E02             |
| row-click                     | row-click({ row, rowKey, index, event })   | Explicit rowClickable; declared event; retain index.                 | I01, I02        |
| row-action                    | row-action({ action, row, rowKey, event }) | Typed Row; no row activation bubbling.                               | U02, I02        |
| cell-click                    | cell-click(CellContext + event)            | Typed Row; at most once per applicable native click.                 | I02             |

## Slots

| Vue 2                            | Vue 3                                                      | Deliberate difference                                     | Acceptance case                              |
| -------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| toolbar / footer                 | same ({ state })                                           | Snapshot effective state.                                 | T01 replacement regions and stable snapshots |
| toolbar-prepend / toolbar-append | same (no props)                                            | Retained.                                                 | T01                                          |
| header / header.<key>            | same ({ column })                                          | Generic column; specific slot has priority.               | T02 specific/generic/default fallback        |
| cell / cell.<key>                | same (CellContext<Row>)                                    | Generic Row; retain value/formattedValue/rowIndex/mobile. | T02, compile fixtures                        |
| filter.<key>                     | same ({ column, clause, setClause, clear, disabled })      | Add disabled; setters obey disabled state.                | T03 clause changes and blocked custom helper |
| action.<key>                     | same ({ action, row, rowKey, disabled, loading, trigger }) | Generic Row; trigger respects disabled/loading.           | T04 one action replacement and guards        |
| row-actions                      | same ({ row, actions, disabled, rowKey })                  | Add rowKey; replaces built-in action area.                | T04                                          |
| mobile-summary / mobile-details  | same ({ row, columns, rowIndex, rowKey, disabled })        | Add rowKey/disabled.                                      | R04, T05                                     |
| loading / empty                  | same (no props)                                            | No-results stays within empty slot/message.               | U03, U05                                     |
| error                            | same ({ error, retry })                                    | retry is refresh(): Promise<void>.                        | P03 retry after failure                      |
| export-progress                  | same ({ percent })                                         | Clamp finite progress to 0–100.                           | E01                                          |

## Cells

No cell type is removed. The icon value representation is the intentional change.

| Vue 2 type        | Vue 3             | Deliberate difference                                        | Acceptance case |
| ----------------- | ----------------- | ------------------------------------------------------------ | --------------- |
| `text`            | `text`            | Escaped text; preserve zero/false.                           | C02             |
| `number`          | `number`          | Intl options retained; invalid numbers are empty.            | C03             |
| `boolean`         | `boolean`         | Accessible true/false labels retained.                       | C04             |
| `date`            | `date`            | Intl options and invalid-date handling retained.             | C03             |
| `select`          | `select`          | Option display mapping retained; no editor.                  | C05             |
| `chip`            | `chip`            | Reference text chip retained.                                | C06             |
| `icon`            | `icon`            | SVG objects only, no font-name/path-string shorthand.        | U04             |
| `image`           | `image`           | Safe URL, lazy image and alt text retained.                  | C07             |
| `link`            | `link`            | Safe URL and noopener retained; disabled renders text.       | C07, U06        |
| `copy`            | `copy`            | Clipboard write on explicit action; disabled guard retained. | C08             |
| `expandable-text` | `expandable-text` | Desktop expansion/mobile full text retained.                 | C09             |
| `custom`          | `custom`          | Typed custom slot with plain-text fallback retained.         | T02             |

## Ref and adapter surfaces

| Vue 2                                  | Vue 3                                                    | Deliberate difference                                                             | Acceptance case                                       |
| -------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| refresh(reason?)                       | refresh()                                                | Fixed refresh reason; explicit refresh bypasses autoLoad/disabled.                | P03                                                   |
| resetFilters()                         | same                                                     | Controlled parent may reject proposed empty filters; page reset uses model rules. | M05                                                   |
| clearSelection()                       | same                                                     | Controlled parent may reject proposed empty selection.                            | M01                                                   |
| resetColumnVisibility()                | same                                                     | Async stale restore protection and ordered persistence.                           | V03                                                   |
| exportData(key, scope?)                | same                                                     | Reject overlapping/invalid-state export; abort on disposal/source replacement.    | E01, E02                                              |
| getState()                             | same                                                     | Independent containers; no internal implementation fields.                        | T01                                                   |
| Other Options API instance methods     | Not public                                               | Only six methods through defineExpose; no general reset added.                    | Compile-time invalid expose check                     |
| createCsvExporter options              | Retain key/label/fileName/pageSize/download; add maxRows | 100,000 default row cap; fail before any partial download.                        | E03 cap, escaping, formulas, long/leading-zero values |
| ExporterContext                        | Retain query/page fetch/progress; add signal             | Fixed accepted query, no live pagination changes.                                 | E01, E02                                              |
| Storage factory / PersistenceAdapter   | Retain async load/save/remove and version 1              | Lazy browser access; invalid/stale data ignored.                                  | V03, X01                                              |
| Component/default/root adapter exports | Planned names retained                                   | No CJS; no independent adapter subpaths until real outputs exist.                 | X01 independent packed consumer in stage 8            |
| Vue 2 DataRow=Record<string, any>      | Generic Row extends object, unknown values               | No index signature required; no broad any in source contracts.                    | Compile fixtures                                      |

## Acceptance ownership

- Stages 4–5 implement C01, D01, S01/S02, M01–M05, V01/V03 and P01–P04;
  adapter checks implement E01–E03 with lifecycle integration in stage 5.
- Stage 6 implements desktop C02–C09, U01–U08, I01/I02 and T01–T04.
- Stage 7 implements R01–R05 and T05, repeats relevant keyboard/interaction cases
  against the actual desktop/mobile renderers, and obtains visual approval.
- Stage 8 implements X01 packed consumer/types/CSS, SSR import/render/hydration,
  supported-version checks, and validates the final declarations.
- Stage 3 only proves the compile signatures listed in docs/api.md. Acceptance IDs
  are a review checklist, not test names or claims of runtime completion.

## Approval boundary

The approved stage 3 contract changes ownership, activation, canonical script model event
names, autoLoad behavior, icon input, numeric breakpoint, default theme, validation,
refresh signature, and export limits/cancellation. The maintainer approved stage 3 in PR #16 before runtime implementation. The scope still includes
every existing cell kind and named slot. No broader redesign or extra feature is
introduced.

## Stage 4 evidence

Pure core and adapter behavior now has Node unit checks in tests/unit:

- data.test.ts: C01, D01, S01, the pure V01 normalization, numeric model defaults,
  localized page parsing, readonly inputs, formatting and stable null/invalid sort.
- filters.test.ts: operators and empty/partial clauses, zero/false/missing values.
- provider-selection.test.ts: P01 container validation and custom normalizer
  revalidation; S02 key/page operations without claiming reactive-model coverage.
- csv.test.ts: E03 escaping/formula/cap safeguards, independent E01 current/all page
  iteration, E02 signal checks and incomplete/changing-result rejection.
- persistence-urls.test.ts: V03 storage-format/availability subset and C07 URL
  allowlist; async state restore/save races and real DOM interaction remain pending.

These checks do not complete M01–M05, provider request scheduling, lifecycle event
ordering, keyboard/UI rendering, reactive persistence/export coordination, or X01
packed consumer/SSR hydration verification. The built-root Node import check is a
preliminary distribution check, not a full SSR-support claim.

## Stage 5 evidence

The mounted tests/components/StateHarness.vue connects the actual internal
composables to Vue props/emits. Its internal methods are exposed for testing;
this is not the public table SFC or completed renderers.

- reactive-state.test.ts verifies M01–M05 ownership/handoff, accepted query/event
  ordering and coalescing, no parent echoes, S02 selection across pages, P01/P02
  response/error/retry and ignored-abort races, P03 manual/disabled/autoLoad
  behavior, P04 source replacement and disposal, page correction refusal, and
  isolation of consumer request mutation from accepted state.
- persistence-export.test.ts verifies reactive V01 schema changes and V03 late
  restore/intent/key races, serialized writes/read ordering, optional failures,
  reset precedence and disposal; E01 fixed-query export with live table changes,
  E02 abort/concurrency/progress/disposal and pending/stale data guards.
- query.test.ts verifies structural watch snapshots and local select-value identity.

Source-level defaults and transition logic are now implemented; integration with
the future SmartDataTable SFC must reuse these contracts. U/I/T/R cases requiring
real controls, dynamic slots, row-click/keyboard events, responsive rendering and
visual review are still stages 6–7. X01 tarball/SSR/hydration remains stage 8.
