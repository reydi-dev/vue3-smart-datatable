# Vue 3 Smart DataTable

[![CI](https://github.com/reydi-dev/vue3-smart-datatable/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/reydi-dev/vue3-smart-datatable/actions/workflows/ci.yml)

A TypeScript-ready data table for Vue 3, with no required UI framework. Local and
async data use the same responsive table, with filters, sorting, selection, typed
slots, RTL, light/dark themes and optional CSV/persistence adapters.

**Unpublished preview.** The package name is `@reydi-dev/vue3-smart-datatable`.
It has not been published to npm. Do not install the unrelated unscoped
`vue3-smart-datatable` package as a substitute. The independent
[Vue 2 library](https://github.com/reydi-dev/vue2-smart-datatable) remains separate.

## Demo and previews

The production demo includes local data, a cancellable async provider, custom
cells/actions and Persian/RTL with themes. All records are synthetic. Public
GitHub Pages hosting is prepared and awaits maintainer deployment approval.

```sh
npm ci
npm run build:demo
npm run preview:demo
```

Open the `/vue3-smart-datatable/` URL printed by Vite. To inspect an actually
installed tarball's production SSR example, run `npm run build` followed by
`npm run preview:consumer`. See the
[demo/deployment guide](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/demo.md).

## Install the preview today

Use Vue **3.5.44+**. The verified baseline is Vue 3.5.44, TypeScript 5.9.3 and
vue-tsc 3.3.13. The library is ESM-only; import its CSS explicitly. To use the
unpublished build in an existing Vue 3 application:

```sh
# Build an actual local npm archive (Node 24.21.0 / npm 11+ tooling).
git clone https://github.com/reydi-dev/vue3-smart-datatable.git
cd vue3-smart-datatable
npm ci
npm run build
npm pack
```

Then, from your Vue 3 application directory:

```sh
npm install /absolute/path/to/reydi-dev-vue3-smart-datatable-0.0.0.tgz
```

This archive installation is checked in an independent project in CI. The
registry installation command will replace it after an explicitly approved beta
publication; no registry release is claimed here.

## Quick start

Copy this component into your application. CSS may instead be imported once in
your client entry. This exact example is typechecked against the installed package.

<!-- quick-start:start -->

```vue
<script setup lang="ts">
import SmartDataTable from '@reydi-dev/vue3-smart-datatable'
import '@reydi-dev/vue3-smart-datatable/styles.css'
import type { DataTableColumn } from '@reydi-dev/vue3-smart-datatable'
interface Customer {
  id: number
  name: string
  amount: number
}
const items: Customer[] = [
  { id: 1, name: 'Ada Morgan', amount: 125.5 },
  { id: 2, name: 'Jordan Patel', amount: 240 },
]
const columns: DataTableColumn<Customer>[] = [
  { key: 'name', label: 'Customer', sortable: true, filterable: true },
  {
    key: 'amount',
    label: 'Amount',
    type: 'number',
    numberFormat: { style: 'currency', currency: 'USD' },
  },
]
</script>
<template><SmartDataTable :columns="columns" :items="items" /></template>
```

<!-- quick-start:end -->

## Examples

| Example                                                                                                         | What it demonstrates                                              |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Local data](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/examples/LocalExample.vue)        | Selection, filters, CSV and saved columns.                        |
| [Async provider](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/examples/AsyncExample.vue)    | Synthetic server, signal cancellation, filter/sort/page requests. |
| [HTTP provider](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/examples/http-provider.ts)     | Forward signal to fetch and validate unknown business rows.       |
| [Cells and actions](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/examples/SlotsExample.vue) | Typed specific slots and guarded action triggers.                 |
| [Persian / RTL](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/examples/RtlExample.vue)       | Messages, Persian numbers, responsive layout and theme.           |
| [Vue 2 migration](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/migration-from-vue2.md)      | Vue 3 models, emits, slots and public refs.                       |

Examples that import `./data.js` use the adjacent
[data.ts](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/examples/data.ts).
Every runnable example is copied into and typechecked in the independent tarball
consumer. The public demo uses those same example components.

## Models and interaction

Use `v-model` for selected **keys**, and `v-model:page`, `v-model:items-per-page`,
`v-model:sort`, `v-model:filters` or `v-model:visible-columns` when the parent owns
those values. Omit a model for internal state. A defined value is strictly
controlled: a fixed `:items-per-page="10"` keeps that value fixed; use v-model
when the built-in control should update it. Empty arrays and `sort=null` are
meaningful controlled values.

Set `row-clickable` explicitly to enable row activation. All twelve reference
cell kinds remain available, with plain text by default and typed slots for
custom content. Icons accept SVG definition objects; an external icon font is
not required. See the full
[API](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/api.md).

## Actual Vue 3 captures

Desktop/mobile PNGs and the interaction GIF are captured from the built Vue 3
demo. They are not mockups or captures of the Vue 2 repository.

![Desktop demo](https://raw.githubusercontent.com/reydi-dev/vue3-smart-datatable/c848622bf3ab79f3a838785bd7502132906cabcf/docs/media/desktop.png)

![Mobile RTL and dark demo](https://raw.githubusercontent.com/reydi-dev/vue3-smart-datatable/c848622bf3ab79f3a838785bd7502132906cabcf/docs/media/mobile.png)

![Selection, sorting, filtering and paging in Vue 3](https://raw.githubusercontent.com/reydi-dev/vue3-smart-datatable/c848622bf3ab79f3a838785bd7502132906cabcf/docs/media/interaction.gif)

## Validation and scope

CI checks strict contracts, focused core/component/browser behavior, production
demo output and a genuinely installed npm tarball. The tarball consumer verifies
public types/CSS/adapters, normal client/server builds, Node import/SSR without
DOM globals, and controlled production hydration in Chromium at desktop/mobile
widths. The same table uses a desktop server/initial-client shell and switches
layout after mount on a narrow viewport.

This is scoped SSR evidence, not a Nuxt integration or a second-browser guarantee.
For SSR, keep server/client rows and formatter results consistent; choose an
explicit `dateFormat.timeZone` for dates that must render identically. See
[distribution evidence](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/distribution-validation.md).

Virtualization, inline editing, grouping/pivoting, multi-sort, Excel/PDF export and
a Nuxt module are outside the first-release scope. See the
[roadmap](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/roadmap.md)
and [progress](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/docs/progress.md).

## Contribute and license

Use Node from `.nvmrc` and `npm ci`. `npm run validate` runs formatting, lint,
contracts, core/component checks, package outputs and both builds. After installing
Chromium, `npm run test:e2e` runs the interaction fixture and production demo;
`npm run test:consumer` checks the independent installed package and all documented
examples. See [CONTRIBUTING](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/CONTRIBUTING.md).

Report reproducible issues with synthetic data. Use the
[security policy](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/SECURITY.md)
for vulnerabilities. MIT, copyright Mohammad Reza Dehghani; see
[LICENSE](https://github.com/reydi-dev/vue3-smart-datatable/blob/main/LICENSE).
