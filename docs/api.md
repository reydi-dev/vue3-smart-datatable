# Vue 3 API contracts

**Responsive table implemented; package still private and unpublished.** The root
exports the generic `SmartDataTable` as both default and named component, types,
and CSV/storage factories. Both renderers use the stage 5 composables. Focused
RTL/theme/keyboard checks are implemented; final visual approval and stage 8
packed-consumer/distribution/SSR verification remain pending.

This contract is based on Vue 2 `v0.3.1`, commit
`3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12`.
See [parity matrix](contract-matrix.md) for every retained or changed surface.
The source of type signatures is `src/types/index.ts`.

## Component and models

The component is a generic `<script setup lang="ts">` SFC, with
`Row extends object`. A normal interface such as `interface Order { id: number;
name: string }` needs no index signature. Columns, formatters, row getters,
actions, slot rows and event payloads retain this same Row. Cell values and raw
provider responses are unknown until consumer formatting/normalization narrows
them. Composables and renderer internals are not public exports.

| Template model            | Prop             | Exact TypeScript emit   | Default when undefined                    |
| ------------------------- | ---------------- | ----------------------- | ----------------------------------------- |
| `v-model`                 | `modelValue`     | `update:modelValue`     | `[]`                                      |
| `v-model:page`            | `page`           | `update:page`           | `1`                                       |
| `v-model:items-per-page`  | `itemsPerPage`   | `update:itemsPerPage`   | `25`                                      |
| `v-model:sort`            | `sort`           | `update:sort`           | `null`                                    |
| `v-model:filters`         | `filters`        | `update:filters`        | `{}`                                      |
| `v-model:visible-columns` | `visibleColumns` | `update:visibleColumns` | non-hidden columns plus mandatory columns |

Templates can listen with `@update:items-per-page` and
`@update:visible-columns`; the canonical script event names use camelCase after
`update:`. Do not emit two aliases for the same update.

### Ownership and synchronization

Each state is independently controlled when its prop is **not undefined**.
Explicit `[]`, `{}`, `1`, and `sort=null` are controlled values. Omitting a prop
or passing undefined selects internal state. No `withDefaults` or `defineModel`
default may erase this distinction.

Controlled state reads the parent's value as its authority; an interaction emits
a proposed update, and does not keep a second optimistic copy. A parent using a
one-way prop must accept updates to enable interaction. Uncontrolled state writes
to its own single internal value. Both modes emit updates for effective user/ref
changes. Equivalent assignments are no-ops. Inputs are never mutated.

Switching from uncontrolled to controlled uses the supplied value immediately.
Switching back to undefined retains the last effective controlled value. Removing
columns still normalizes visibility and sort against the remaining schema.

For a built-in filter, sort or page-size transaction:

1. Propose the primary model update, then `update:page(1)` if page differs.
2. Commit uncontrolled state and let synchronous parent model handlers settle.
3. After Vue's update flush, emit one `options-change` describing the **accepted**
   effective query, if it changed. Never fetch the abandoned intermediate query.
4. Schedule at most one provider request. Only filters use `filterDebounce`.

Direct parent changes do not echo `update:*` events. They do update accepted query
state and can emit one aggregate `options-change` and load. A parent's batched
filter/page assignment is authoritative: no watcher resets the explicitly supplied
page again. Parents that change filters/sort/size directly must set page explicitly
when they want a reset. A rejected controlled proposal emits no aggregate change
or request for the rejected value. Deep equality is structural for query models;
providerContext identity/replacement is the supported reload trigger.

Selection/visibility changes emit their matching model event, followed after the
flush by one `selection-change` / `column-visibility-change` if the accepted value
changed. They do not reload data or emit `options-change`. Selection payload rows
come from the displayed page only. No model/change event fires just for defaults
on mount or an equivalent parent echo. New parent selection/visibility values
synchronize without interaction change events.

### Defaults and other props

| Props                                    | Default and meaning                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `columns`                                | Required; unique nonempty column keys. No mutation of schema.                                      |
| `mode`, `items`                          | `local`, `[]`; local filter → stable single sort → page.                                           |
| `dataProvider`, `normalizeResponse`      | Required provider in server mode; optional response mapping.                                       |
| `providerContext`                        | undefined; forwarded unchanged, never interpreted as backend syntax.                               |
| `rowKey`                                 | `'id'`; dot path or `(row: Row) => string \| number`.                                              |
| `pageSizeOptions`                        | `[10,25,50,100]`; positive integer sizes; page size may be set programmatically outside this list. |
| `selectable`, `rowClickable`             | `false`; explicitly opt into selection or row activation.                                          |
| `actions`                                | `[]`; visible/disabled/loading predicates are evaluated per row.                                   |
| `columnVisibility`                       | `true`; controls the built-in column dialog only.                                                  |
| `persistenceAdapter`, `persistenceKey`   | Both needed to persist visibility. No global storage by default.                                   |
| `exporters`, `exportFileName`            | `[]`, `'export'`; adapter opt-in, current/all scopes.                                              |
| `messages`, `icons`                      | Partial overrides of bundled defaults. SVG definitions only for icons.                             |
| `direction`, `theme`                     | `'ltr'`, `'light'`; root-scoped RTL and independent light/dark palette.                            |
| `mobileBreakpoint`, `mobileSummaryLimit` | `960` pixels, `3`; mobile when viewport width is below threshold.                                  |
| `filterDebounce`                         | `250` ms; nonnegative finite delay, server filters only.                                           |
| `autoLoad`                               | `true`; false suppresses **all automatic provider requests**, not only the first.                  |
| `loading`, `disabled`                    | `false`; externally adds loading / disables built-in mutating UI.                                  |
| `dense`, `fixedHeader`, `height`         | `false`, `false`, unset; reference layout controls.                                                |
| `showToolbar`, `showPagination`          | `true`; custom slots can replace these regions.                                                    |
| `rowClass`                               | `(row, rowIndex) => ClassValue`, unset.                                                            |

Page is one-based, page size is a positive integer. Invalid numeric model values
use the corresponding default as the effective value without mutating the prop.
An invalid user page jump is rejected with an associated error; Latin, Persian,
and Arabic-Indic digits remain supported. Page size changes and built-in filter
or sort changes reset the page, as described above. Sort clicks alternate asc/desc
for that column; clear sorting programmatically with null.

When a new local dataset or accepted server total makes a page out of range,
propose the last valid page (minimum 1) once per data revision. An uncontrolled
page corrects itself; a controlled parent may reject the proposal, leaving the
page empty. Do not repeatedly refetch an invalid controlled page. A provider page
correction uses reason `page` and does not report intermediate rows as the new page.

### Columns, cell types and filters

Retain all reference column options: key/label/field/type/formatter,
sortable/sortKey, filterable/filter/options, align/width/minWidth/compact,
hideable/hiddenByDefault/mobile, cellClass/headerClass/exportValue,
numberFormat/dateFormat/tooltip. Field defaults to the column key, supports dot
paths or a typed getter. Formatter and exportValue are separate; text is never
interpreted as HTML. String/number zero and boolean false must remain visible.

All 12 cell types remain: text, number, boolean, date, select, chip, icon, image,
link, copy, expandable-text, custom. A select cell is a display mapping, not inline
editing. Custom cells use slots, falling back to text if absent. SVG icon values
use `{ path, viewBox?, stroke? }`; no external font or arbitrary markup is parsed.
Link/image URL policies and CSV formula defenses must be ported and tested.

Filters use clauses keyed by column key, with contains, startsWith, endsWith, eq,
neq, gt, gte, lt, lte, between and in. Retain partial ranges and empty-filter
removal without dropping zero/false. Unknown column keys are ignored in local
processing but retained in provider filters for consumer-defined backend filters.
Hidden columns can still participate in sorting/filtering. Removed columns clear
a sort targeting them; custom server filter keys are not silently deleted.

### Row identity and selection

Row keys are strings or finite numbers; `0` and `'0'` are distinct. Validate
missing/invalid keys and duplicate keys on each displayed page. Do not invent
index-based identity. Runtime checks cannot prove arbitrary Row interfaces:
consumers must validate their business schema in the provider/normalizer.

Selection keys persist across page, sort, filter, mode, context, provider and
items changes, including keys no longer present. This avoids silently losing
server selection; clear it explicitly when changing datasets. A rowKey definition
change proposes an empty selection. Keys are deduplicated without coercion.
Select-page adds/removes only displayed keys; selected rows in the event are only
those displayed now. No cross-page record cache is promised.

### Visibility and persistence

Unknown/duplicate visible keys are removed. `hideable=false` columns are always
included, even for an explicit empty list. Rendering follows schema order, not
visibility-array order. New columns follow hiddenByDefault only when visibility
is uncontrolled; controlled models keep the parent's explicit intent.

Priority: controlled model → current user changes → saved state → schema defaults.
Restore asynchronously only on mount or adapter/key replacement and only if no
newer model/user change occurred. Ignore stale restore completion, unmount, or
invalid version/data. Persistence failures do not turn successful data loads into
errors. Serialize saves for a key so an old completion cannot become the final
stored value. `resetColumnVisibility()` removes saved state and proposes defaults;
if accepted, save the resulting defaults. The adapter shape remains version 1.

## Provider lifecycle

`DataProvider<Row>` types canonical `{ items: readonly Row[], total, meta? }` or
row-array responses. For a backend envelope, use `DataProvider<Row, Raw>` and a
`ResponseNormalizer<Row>` accepting unknown. The component boundary accepts an
unknown provider response; it validates the normalized container, total, object
rows and row keys. A raw row array normalizes total to its own length; it is not
suitable for a paginated backend that needs a larger filtered count.

Requests contain page, itemsPerPage, sort `{ columnKey, field?, direction }` or
null, cleaned filters, context, optional signal, and reason. `field` resolves from
sortKey, string field, then the column key; getter fields without sortKey use the
column key as backend identifier. Total must be a finite nonnegative integer and
must not be less than the returned page length. Normalize responses from custom
normalizers too; do not trust their TypeScript annotation as runtime validation.

| Trigger                                     | Behavior                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| mount / enter server mode                   | Request reason `initial` when autoLoad=true.                                                                       |
| accepted page / size / sort / filter        | One request with reason `page` / `page-size` / `sort` / `filter`.                                                  |
| provider, normalizer or context replacement | Invalidate old work; request reason `refresh` when autoLoad=true.                                                  |
| columns replacement                         | Recompute sort field/visibility; reload only if the effective server query changes.                                |
| autoLoad becomes false                      | Cancel debounce and pending automatic load; keep last successful rows, no stale commit.                            |
| autoLoad becomes true                       | Load the current query once if in server mode.                                                                     |
| disabled becomes true                       | Suppress mutating built-in UI; parent updates, auto loads and ref methods still work.                              |
| refresh / retry                             | Cancel debounce and load immediately, even with autoLoad=false or disabled=true. Local refresh recomputes locally. |
| enter local mode / unmount                  | Abort and invalidate in-flight loads and exports; clean up timers/listeners.                                       |

A new query invalidates the old request immediately, including during debounce.
Use both AbortController and a monotonically increasing request identity; a
provider ignoring abort may not commit stale rows, errors or lifecycle events.
Keep prior rows internally during loading, while the loading view is shown.
A current load failure clears displayed rows, sets error, emits load-error and
then loading-change(false); retry uses the current accepted query. Abort and stale
responses produce no load-success/load-error. No work/events run after unmount.
Missing provider in server mode is a visible configuration error, not empty data.

Only provider work emits load events: load-start(request), loading-change(true),
then load-success({ request, result }) or load-error({ request, error }), followed
by loading-change(false). Overlapping replacement keeps one aggregate pending
loading interval; stale finalizers may not turn off the new load's spinner.
External `loading` contributes to getState().loading but is not a provider event.
`options-change` has the query snapshot with reason for the accepted change and
no request signal; selection/visibility changes are excluded.

## Events, slots, and interaction

`SmartDataTableEmits<Row>` names all events and exact payloads, including
selection-change, column-visibility-change, options-change, load-start/success/error,
loading-change, export-start/success/error, row-click, row-action, and cell-click.
No Vue 2 input event is emitted. All custom events must be declared in defineEmits.

Row activation requires `rowClickable=true` and `disabled=false`; attaching a
listener alone does not make rows clickable. Desktop rows use Enter/Space with
preventDefault for Space; the mobile open-row control follows the same contract.
Do not inspect `$listeners`, `$attrs` or internal VNode listeners for activation.
A row-click payload retains `{ row, rowKey, index, event }`. Native root `@click`
is separate from row-click; custom events must not fall through to the DOM.
Controls, links, selection, actions and disclosure stop row activation. An ordinary
cell click may emit one cell-click followed by one row-click when enabled; action
and link controls must never also activate the row. Disabled blocks both events;
read-only mobile disclosure remains usable. Custom slots own their disabled and
HTML/URL safety behavior, with disabled included in relevant contexts.

Slot names remain toolbar, toolbar-prepend/append, header and header.<key>, cell
and cell.<key>, filter.<key>, action.<key>, row-actions, mobile-summary/details,
loading, empty, error, footer, export-progress. Specific header/cell slots win over
generic ones. row-actions replaces built-in row actions; action.<key> replaces
one action. State slots get `{ state }`; header gets `{ column }`; cell gets
`{ row, rowKey, column, value, formattedValue, rowIndex, mobile }`; filter gets
`{ column, clause, disabled, setClause, clear }`; action gets
`{ action, row, rowKey, disabled, loading, trigger }`; row-actions gets
`{ row, rowKey, actions, disabled }`; mobile gets
`{ row, rowKey, columns, rowIndex, disabled }`. Error gets `{ error, retry }` and
export-progress gets `{ percent }`. Loading/empty and toolbar prepend/append have
no props. Dynamic slot keys are strings; types do not prove a key exists in schema.

State display precedence is error → loading → empty/no-results → rows. No-results
uses the same empty slot with the distinct message when filters are active.
Pagination mutating UI is disabled during loading/error or disabled=true; row/page
selection acts only on displayed data. There is no separate no-results slot.

## Ref methods and export

Only expose the `SmartDataTableExpose` interface with defineExpose:
refresh(), resetFilters(), clearSelection(), resetColumnVisibility(),
exportData(exporterKey, scope='current'), and getState(). No generic reset or
internal setters/load/timers are public. Refresh/retry uses the fixed `refresh`
reason; arbitrary refresh(reason) input is intentionally removed.

Methods remain callable when disabled. Resets respect controlled ownership;
parents can reject a proposal. getState returns independent container snapshots,
not mutable internal arrays/objects; opaque filter values/errors remain consumer
objects and must not be mutated. It includes effective models, total, loading and
error, not provider internals.

Exporter context includes snapshot columns/rows/query, total, fileName, signal,
reportProgress and fetchPage. Current scope exports the displayed page. All scope
iterates the accepted filtered/sorted query from page 1 without changing live
page/models. Capture context and input containers at start; later model replacements do not
change the export query. Rows and opaque values are shared business objects;
consumers should replace data immutably rather than mutating it during export. Mode/provider/context replacement aborts exports. Only one export
runs at a time; concurrent calls reject. Export during a pending/failed load rejects
to avoid mixing a new query with old displayed rows. Unknown adapters/unsupported
scopes reject before export-start; begun exports emit success/error and settle
cleanly. Abort rejects with AbortError and emits export-error unless unmounted.

The CSV adapter retains UTF-8 BOM, escaping, CRLF, formula guards, long/leading-zero
numeric preservation, HTML-to-text conversion, cell truncation, and exportValue.
Its implemented options retain key/label/fileName/pageSize/download and add maxRows
(default 100,000); download may return void or Promise<void>. Exceeding the positive integer cap fails with no partial download;
this is an in-memory export, not an unlimited streaming API. Progress is clamped
to 0–100; fetchPage honors signal and validates responses. The default downloader
needs a browser only when export is invoked; callers can inject download for other
runtimes. A backend must support page/offset export of the same query, with stable
ordering; a changing dataset cannot be guaranteed to provide a transactional snapshot.

## Verification status

Compile-only fixtures in tests/contracts now use the actual exported generic
SmartDataTable SFC. They exercise six models, formatters/slots, event payloads and
rejected incompatible types. They prove signatures; mounted and browser checks
provide separate desktop/mobile runtime evidence in the matrix. Source-shell
hydration has a narrow jsdom check; packed-consumer/SSR/hydration acceptance
remains stage 8.

The selected supported baseline stays Vue 3.5.44, TypeScript 5.9.3 and vue-tsc
3.3.13. Generic SFCs, defineSlots and tuple emits are available from Vue 3.3; this
does not establish support for older versions. No defineModel default is used.
See the official [script setup reference](https://vuejs.org/api/sfc-script-setup.html),
[models guide](https://vuejs.org/guide/components/v-model.html), and
[event declarations](https://vuejs.org/guide/components/events.html).

## Implemented adapter surface (stage 4)

The root now exports `createCsvExporter`, `CsvExporterOptions`,
`createLocalStoragePersistenceAdapter`, and `LocalStoragePersistenceOptions`.
No adapter subpaths are defined. They are implemented independently of the table;
stage 5 coordinates them through internal composables, and stage 6 connects the
public desktop SFC and its controls.

CSV all-scope export requires each fetched page to honor pageSize and report the
same total as the starting query. A short/oversized page or changed total rejects
without a partial download; no claim of a transactional backend snapshot is made.
Abort is checked before work, after each fetch, and before download, including
providers that ignore signal. Async download failures are awaited and propagated.
Default browser download is checked only when invoked; inject download for Node.

Storage options retain prefix (default `smart-data-table:`) and accept an injected
getItem/setItem/removeItem storage object. The adapter accesses window.localStorage
only inside method calls and catches blocked getters, corrupt JSON, invalid
version/key arrays, read/quota/remove failures. Loads return fresh deduplicated
string-key containers. Async restore precedence and save ordering belong to the
stage 5 state composables, not this synchronous-storage wrapper.

Pure local filtering retains the reference treatment of incomplete between
clauses: keep them in provider filters but do not filter locally until both bounds
exist. Numeric missing values no longer match zero through Number(null). Nullish
and invalid sort values sort last stably in either direction. Core helpers are
internal, with no root exports or Vue/DOM imports.

## Reactive coordination implemented in stage 5

The internal useDataTable coordinator implements the model/query lifecycle above
and supplies the six-method object exposed by the public SFC. Its four responsibility
groups are models/local state, provider work, column persistence, and export.
They are not root/headless exports. StateHarness tests mount the real composables;
positive/negative template fixtures now compile the actual SmartDataTable SFC.

Accepted query changes invalidate pending work immediately and coalesce after
Vue's parent/component update flush. An idle filter debounce contributes to
getState().loading, while loading-change describes actual provider work; replacement
requests keep a continuous loading interval. Context changes are detected by
identity, not deep in-place mutation. Request/event containers are copied so a
provider modifying its received page cannot alter the accepted table state.

Only accepted visibility interactions and resets persist columns. External parent
models synchronize without interaction events or implicit storage writes. Restores
wait for this coordinator's earlier writes to the same adapter/key, reject stale
intent/key/version results, and never emit a user interaction. Pending saves are
ordered per adapter/key; optional failures do not become data errors. Unmount
prevents new queued work and stale state commits, but cannot undo an opaque
adapter operation already started by consumer code.

Export captures the accepted query, visible/schema column containers, local items,
provider, normalizer and row-key definition. Changing live filters or visibility
does not change that export. Mode/provider/normalizer/context replacement or
unmount aborts it. Concurrent work, pending/failed data and server data belonging
to an older accepted query are rejected before export-start. With autoLoad=false,
last successful rows can remain displayed after model changes, but export remains
blocked until refresh accepts the current query. Custom providers/exporters must
honor signal to stop their own external side effects; ignoring it still cannot
commit stale library state or late lifecycle success/error events.

Mounted state fixtures verify controlled/uncontrolled handoff, coalescing,
cancellation, retry, rejected page correction, persistence races and export
snapshots. The desktop playground now uses the actual table, simulated provider,
column persistence and CSV download. It remains a development example; the
release documentation/demo and packed-consumer/SSR acceptance remain later stages.

## Desktop presentation implemented in stage 6

SmartDataTable declares all canonical emits and exposes exactly the six methods
above. Absent model props remain undefined, while enabled-by-default boolean
controls are explicitly defaulted. Component and default exports reference the
same SFC. Import the separate `/styles.css` export in an eventual package consumer;
source SFC development already includes these styles.

SmartTableDesktop renders a semantic table with scoped headers, sort buttons,
selection, row keyboard activation, constrained scrolling and fixed headers.
Native click listeners fall through to the root once. Built-in ordinary cells
emit cell-click; enabled rows can also emit row-click once. Controls/actions/links
own their clicks. Custom cell slots own their interaction events and must respect
the documented disabled contract.

Specific header/cell slots win over generic slots, including when conditional
slots change after mount. Filter slots receive the accepted clause, guarded
setClause/clear functions and disabled state. Action slots receive current visible
row/action context and a guarded trigger; row-actions replaces the whole region.
Leading actions precede trailing/default actions; menu actions use a native
readable disclosure with ordinary focusable buttons, not an ARIA menu widget.

All twelve cell kinds render safe text by default. SVG definitions render as
attributes, without fonts, HTML injection or string aliases. Links/images use the
core URL allowlist. Copy feedback follows a successful clipboard write only;
clipboard permission failures are caught. The columns dialog uses native modality,
Escape, a Tab boundary and trigger focus return; choices retain mandatory columns.

Toolbar/footer/loading/empty/error/progress slots replace their respective default
regions. The built-in empty state distinguishes active-filter no-results and
provides reset. Pagination disables during loading/error/disabled states, validates
localized page input and positive sizes. Export menu failures show the localized
exportFailed message while programmatic exportData still rejects for callers.

Light is the default palette, with no ancestor theme bridge. Stage 7 adds the
responsive/RTL/theme/keyboard checks below. No cross-browser support claim is made.

## Responsive rendering and accessibility (stage 7)

The same coordinator remains mounted while the renderer changes. A finite numeric
mobileBreakpoint (default 960) selects mobile strictly below the viewport width;
exactly 960 is desktop. Zero disables mobile rendering. Invalid runtime values
fall back to 960. The observer starts after mount and removes its resize listener
on disposal; changing breakpoint re-evaluates against the current width.

Both SSR and the first client render use the desktop shell. After mount a narrow
client switches to mobile. This intentional layout shift avoids guessing a
viewport on the server. A source-SFC SSR/jsdom hydration check verifies this shell
transition without mismatch warnings; installed-package/browser hydration and
support claims remain stage 8.

Mobile renders a named semantic list of rows, selection checkboxes, reference
summary fields, native readable details and an explicit keyboard-operable open-row
button when rowClickable is enabled. Explicit mobile.summary columns sort by
mobile.order; otherwise use schema order. mobileSummaryLimit defaults to 3.
Remaining visible columns are details; compact=false, long values, copy/link and
expandable-text use the reference full-width rules. Expandable text is fully
readable on mobile. Custom mobile-summary/details receive the documented full
row/key/columns/index/disabled context; a custom summary owns its selection UI.

Selection, filters, sort and page survive viewport changes; resizing alone does
not issue a provider request. Details open state survives desktop/mobile changes
for rows on the current displayed page. It is pruned as rows leave that page and
cleared if the row-key definition changes. Disabled rows/actions remain guarded,
while native details can still be opened to read their content.

Direction and palette are scoped to each table; they do not change the host page,
language or Intl locale. Previous/next icons mirror in RTL; numeric page ranges
and values use bidi isolation. Text is inherited and long values wrap; horizontal
scrolling is intentional inside the desktop table region when columns need more
width. Native dialog Tab boundaries/Escape/focus return, sort/select/page controls,
row activation and mobile disclosure are covered by focused keyboard checks.
Selected normal text palette pairs meet the project's 4.5:1 contrast target; the
light muted token is #687672 to also meet it on the light tint. These checks are
not an assistive-technology audit or a cross-browser support matrix.

See [actual screenshots and visual approval scope](responsive-review.md).
