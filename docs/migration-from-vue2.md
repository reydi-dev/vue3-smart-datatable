# Migration from Vue 2 — proposed contracts

This guide describes the stage 3 proposal. The Vue 3 table is not implemented or
published yet. Do not replace a production Vue 2 installation with this repository.
The two repositories and package versions remain independent.

## Package and imports

The intended package is `@reydi-dev/vue3-smart-datatable`, not the existing
unrelated unscoped npm package. Once released, the intended default/named component
export is SmartDataTable, with type exports and `@reydi-dev/vue3-smart-datatable/styles.css`.
The current root exports only types and the temporary PipelineProbe.
CSV and storage factories will be root exports after their implementation; no
adapter subpath is promised until a real independent export is built.
ESM is the supported build format; no Vue 2 compatibility layer or CJS is planned.

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
Built-in CSV will have a 100,000 row default cap (configurable maxRows) and reject
partial/over-limit exports rather than downloading an incomplete result.
Exports keep a query snapshot and do not navigate the visible table. Only one can
run at a time. Storage remains optional with version-1 visibility state; stale
async restores no longer overwrite newer parent/user intent.

None of these runtime differences is implemented by the stage 3 type fixtures.
Review and approve the [matrix](contract-matrix.md) before the core/UI port.
