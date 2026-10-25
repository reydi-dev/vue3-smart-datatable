# vue3-smart-datatable

An independent Vue 3 data table library, built with TypeScript and no required
UI framework.

**In development — not published.** The planned npm package is
`@reydi-dev/vue3-smart-datatable`. No installable Vue 3 release is available yet.
The development page contains a temporary pipeline probe, not the finished table.

## Goal and progress

The first release targets local/server data, sorting, filters, pagination,
selection, responsive desktop/mobile layouts, RTL, themes, custom cells and CSV.
These features are planned; the current work establishes the development pipeline.

- [Roadmap and scope](docs/roadmap.md)
- [Milestones](https://github.com/reydi-dev/vue3-smart-datatable/milestones)
- [Stage issues](https://github.com/reydi-dev/vue3-smart-datatable/issues)
- [Progress and validation](docs/progress.md)
- [Architecture decisions](docs/architecture.md)

## Local development

Use Node 24.21.0 (see `.nvmrc`) and npm 11 or later.

```sh
npm ci
npm run dev
```

```sh
npm run validate
```

Validation checks formatting, lint, types, the pipeline component, library/package
outputs, and the playground build. Unit and browser suites will be added with
the corresponding features; their commands currently have no tests to run.

The library build emits ESM, declarations and separate CSS. The package remains
private to prevent accidental publication during development.

## Reference and contribution

The independent [Vue 2 project](https://github.com/reydi-dev/vue2-smart-datatable)
remains active. Its pinned reference is documented in
[the transfer inventory](docs/reference-inventory.md). This repository has no
runtime or development dependency on that checkout.

See [contributing](CONTRIBUTING.md) and [security](SECURITY.md). Licensed under
[MIT](LICENSE), copyright Mohammad Reza Dehghani.
