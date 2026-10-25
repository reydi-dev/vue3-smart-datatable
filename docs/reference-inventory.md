# Pinned reference and transfer inventory

Reference repository: https://github.com/reydi-dev/vue2-smart-datatable

- Tag: `v0.3.1`
- Commit: `3e36971d0bb7b5e0f3fbbffdecadf68c4cd5af12`
- Local read-only source: `/Users/mohammadreza/Desktop/Projects/Github/vue2-smart-datatable`
- License: MIT, copyright 2026 Mohammad Reza Dehghani.

The tag was resolved locally to the exact commit above. Reference files were
read with `git show` / `git ls-tree`; its checkout was not changed. The new
library must never depend on the local reference path.

| Treatment | Candidates | Work still required |
| --- | --- | --- |
| Reuse after review | Pure column, filter, local-data, pagination, selection, message, URL, and provider helpers; CSV behavior; MIT notice | Validate against the stage 3 contract and port focused behavior tests in stage 4. No runtime code copied yet. |
| Adapt | Row/column/provider types, components, state lifecycle, slots/events, SVG icons, styles, persistence, examples | Preserve behavior while using Vue 3 models, Composition API, and generic types. Audit browser-only adapter access. |
| Split | `src/core/responsive.ts` | Keep numeric threshold calculation pure; move viewport observation and cleanup to the browser/composable layer. |
| Exclude from the initial Vue 3 design | Vue 2 runtime/tooling, Options API wiring, `value/input`, legacy Vuetify breakpoint aliases, old release outputs and fixtures | Record deliberate public API differences in stage 3 before implementation. |

This is a preliminary inventory, not a completed API parity audit. The final
props/events/slots/cell matrix belongs to stage 3. No capability is claimed ready.
