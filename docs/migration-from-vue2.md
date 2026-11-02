# Migration from Vue 2

The Vue 3 component is implemented and verified with an independently installed
package, strict types, production builds and minimal SSR/browser hydration.
It is still unpublished. The repositories and version histories are independent;
this is a migration from `vue2-smart-datatable` v0.3.1, not an in-place upgrade.

## Package and imports

Use `@reydi-dev/vue3-smart-datatable`, not the unrelated unscoped npm package.
The root exports default/named SmartDataTable, types and CSV/storage factories.
Import CSS explicitly from `@reydi-dev/vue3-smart-datatable/styles.css`.
There are no adapter subpath exports. ESM is the supported format.
See the [README](../README.md) for installing a local tarball before publication.

## Models and ownership

- Replace `value` / `input` with `modelValue` / `update:modelValue`, or Vue 3 v-model.
- Replace `.sync` with v-model:page, v-model:items-per-page, v-model:sort,
  v-model:filters, and v-model:visible-columns.
- In script, canonical events are update:itemsPerPage and update:visibleColumns.
  Templates may use kebab-case listeners. The old script spellings are not emitted.
- A defined model is now strictly controlled, rather than optimistic internal
  state. Accept proposals in the parent (v-model does this) or pass undefined for
  internal state. Empty arrays and sort=null remain meaningful controlled values.
- Parent changes do not echo update events. Reset page explicitly when changing
  query props directly; built-in UI transactions reset it automatically.
- Selections remain keys across pages/dataset changes. selection-change.rows
  remains only the currently displayed selected rows. Clear stale keys explicitly.

See [API ownership rules](api.md#ownership-and-synchronization) for flush order,
controlled/uncontrolled transitions, and loop prevention.

## UI and interaction

Set rowClickable=true in addition to @row-click. Listener presence no longer
implicitly enables activation. row-click retains the reference payload index;
cell slots retain rowIndex. All events are declared, so a listener is not attached
twice through attribute fallthrough. Native root click remains a separate event.

All 12 cell types and the existing slot names remain. Slot Row types now flow
from your items/columns. Filter slots additionally get disabled; row-actions and
mobile slots additionally get rowKey (and mobile slots disabled). Read-only input
arrays are accepted and never mutated. Custom slots remain responsible for safe
URLs/HTML and disabling their own controls.

Use numeric mobileBreakpoint (default 960). Legacy Vuetify aliases are removed.
Use explicit SVG definitions for icon overrides and icon cells, e.g.
`{ path: 'M4 12h16', viewBox: '0 0 24 24', stroke: true }`.
MDI font-name strings and raw path-string shorthand are removed; wrap raw paths
in an object. No CDN font is required. All cell kinds remain available.

Omitted theme now means light. Set theme='dark' explicitly instead of relying on
an ancestor .theme--dark bridge. The reference design and namespaced tokens remain
the UI baseline; this is not a redesign.

## Provider, exports and refs

The backend-neutral request/normalizer model stays. Invalid totals (including
fractions) and invalid/duplicate displayed row keys become explicit errors.
Provider responses remain unknown at the component boundary; validate business
row shapes in your provider or normalizer.

autoLoad=false now suppresses every automatic load, including model/provider/
context changes. Call refresh() or retry to load explicitly. Ref methods remain
available while disabled. Request cancellation must handle providers that ignore
abort; stale results may not commit or emit success/error.

The six supported ref methods remain, except refresh() no longer accepts an
arbitrary reason argument. Use Vue's template ref with SmartDataTableExpose.
No other Options API methods are public.

ExporterContext gains signal; custom adapters should stop work when aborted.
Built-in CSV has a 100,000 row default cap (configurable maxRows) and reject
partial/over-limit exports rather than downloading an incomplete result.
Exports keep a query snapshot and do not navigate the visible table. Only one can
run at a time. Storage remains optional with version-1 visibility state; stale
async restores no longer overwrite newer parent/user intent.

## Runnable Vue 3 migration

[MigrationExample.vue](examples/MigrationExample.vue) binds all six models and a
public template ref; copy its [data.ts](examples/data.ts) helper too. These exact
files are compiled against the installed package in CI. Use `v-model:items-per-page`
for an editable size: `:items-per-page="10"` deliberately holds the size at 10.
[http-provider.ts](examples/http-provider.ts) shows a typed POST provider that
passes AbortSignal to fetch and validates the returned business row shape.

SSR renders a deterministic desktop shell; mobile switches after mount. Keep
server/client items and formatting inputs identical. Set `dateFormat.timeZone`
explicitly when using date columns across servers with different default zones.
The verified SSR scope is described in [distribution validation](distribution-validation.md);
Nuxt and other browser engines have not been verified.

See the [API](api.md) and [parity matrix](contract-matrix.md) for full contracts.
