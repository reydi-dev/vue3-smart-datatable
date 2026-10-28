# vue3-smart-datatable

An independent Vue 3 data table library, built with TypeScript and no required
UI framework.

**In development — not published.** The planned npm package is
`@reydi-dev/vue3-smart-datatable`. No installable Vue 3 release is available yet.
The development playground runs responsive desktop/mobile tables with synthetic
local/server data. Installed-package and minimal SSR/hydration checks are in place;
release documentation and publication remain.

## Goal and progress

The first release targets local/server data, sorting, filters, pagination,
selection, responsive desktop/mobile layouts, RTL, themes, custom cells and CSV.
The component implements responsive desktop/mobile rendering, local/server
queries, sorting, filtering, pagination, selection, column visibility, row actions,
all 12 cell types, typed slots, CSV and persisted column choices. RTL/LTR and
light/dark layouts have focused keyboard/contrast/browser checks; see the
[visual review](docs/responsive-review.md). An independently installed tarball now
passes strict consumer types, production builds and minimal SSR/browser hydration.
See [distribution evidence](docs/distribution-validation.md); publication remains
a later stage.

- [Roadmap and scope](docs/roadmap.md)
- [Milestones](https://github.com/reydi-dev/vue3-smart-datatable/milestones)
- [Stage issues](https://github.com/reydi-dev/vue3-smart-datatable/issues)
- [Progress and validation](docs/progress.md)
- [Architecture decisions](docs/architecture.md)
- [API contracts and parity matrix](docs/contract-matrix.md)

## Local development

Use Node 24.21.0 (see `.nvmrc`) and npm 11 or later.

```sh
npm ci
npm run dev
```

```sh
npm run validate
```

Validation checks formatting, lint, positive/negative contract types against the
real component, pure core/adapters, mounted state/UI fixtures, package outputs
and the playground build. CI also installs Chromium and runs four browser flows:

```sh
npx playwright install chromium
npm run test:e2e
npm run test:consumer # requires the library build produced by validate
```

For an existing compatible Chromium installation, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path. See
[progress](docs/progress.md) for the actual browser environments verified.

The library build emits ESM, declarations and separate CSS. The package remains
private to prevent accidental publication during development.

## Reference and contribution

The independent [Vue 2 project](https://github.com/reydi-dev/vue2-smart-datatable)
remains active. Its pinned reference is documented in
[the transfer inventory](docs/reference-inventory.md). This repository has no
runtime or development dependency on that checkout.

See [contributing](CONTRIBUTING.md) and [security](SECURITY.md). Licensed under
[MIT](LICENSE), copyright Mohammad Reza Dehghani.

## Source usage during development

```vue
<script setup lang="ts">
import SmartDataTable from './src'
// Package consumers will use @reydi-dev/vue3-smart-datatable and its /styles.css
// export after publication. This example uses the unpublished checkout.
const columns = [{ key: 'name', label: 'Name', sortable: true }]
const items = [{ id: 1, name: 'Example' }]
</script>

<template>
  <SmartDataTable :columns="columns" :items="items" />
</template>
```
