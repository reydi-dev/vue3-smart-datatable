# Roadmap

Build an independent, UI-framework-neutral Vue 3 table library under the npm
name `@reydi-dev/vue3-smart-datatable`. Preserve the reference design and useful
behavior while adopting Vue 3 contracts, strict types, and maintainable layers.

**Status:** in development, not published. No release dates are promised.
Desktop/mobile UI and visual review are approved. An independent packed consumer
now covers strict types, production builds and minimal SSR/browser hydration.
Documentation and the production demo are prepared for review. Public hosting
and package publication await their approval gates; see progress for evidence.

## Delivery milestones

- [0.1.0-beta.1](https://github.com/reydi-dev/vue3-smart-datatable/milestones): first public beta, published with `next` only after explicit approval.
- [0.1.0](https://github.com/reydi-dev/vue3-smart-datatable/milestones): stable release after real consumer feedback and approval.

## Stages

Issue status is the live source of delivery status. PRs close issues when their
acceptance criteria are met; future stages remain planned until work begins.
Stages 0 and 1 were recorded retrospectively after their actual completion.

| Stage | Tracking issue                                                     | Deliverable                           |
| ----- | ------------------------------------------------------------------ | ------------------------------------- |
| 0     | [#2](https://github.com/reydi-dev/vue3-smart-datatable/issues/2)   | Destination and identity              |
| 1     | [#3](https://github.com/reydi-dev/vue3-smart-datatable/issues/3)   | Repository foundation                 |
| 2     | [#4](https://github.com/reydi-dev/vue3-smart-datatable/issues/4)   | Toolchain and CI                      |
| 3     | [#5](https://github.com/reydi-dev/vue3-smart-datatable/issues/5)   | Public contracts                      |
| 4     | [#6](https://github.com/reydi-dev/vue3-smart-datatable/issues/6)   | Pure core and adapters                |
| 5     | [#7](https://github.com/reydi-dev/vue3-smart-datatable/issues/7)   | Reactive state and provider           |
| 6     | [#8](https://github.com/reydi-dev/vue3-smart-datatable/issues/8)   | Desktop UI                            |
| 7     | [#9](https://github.com/reydi-dev/vue3-smart-datatable/issues/9)   | Mobile, RTL, themes and accessibility |
| 8     | [#10](https://github.com/reydi-dev/vue3-smart-datatable/issues/10) | Distribution, types and SSR           |
| 9     | [#11](https://github.com/reydi-dev/vue3-smart-datatable/issues/11) | Documentation and demo                |
| 10    | [#12](https://github.com/reydi-dev/vue3-smart-datatable/issues/12) | Public beta                           |
| 11    | [#13](https://github.com/reydi-dev/vue3-smart-datatable/issues/13) | Stable release                        |

## Initial release scope

Local and server data, single-column sorting, filters, pagination, row selection,
configurable columns, custom slots, existing reference cell types, desktop and
mobile layouts, RTL/LTR, light/dark themes, CSV export, persistence adapters, and
TypeScript declarations. Desktop functionality is implemented in stage 6; the
remaining scope and validation follow the stages above.

Virtualization, inline editing, pivot/grouping, multi-sort, Excel/PDF, a Nuxt
module, and a redesign are outside the initial scope. SSR claims are limited to
what stage 8 actually verifies.

## Project process

Each stage uses a focused PR, relevant validation, updated progress notes, and
maintainer approval before merge. Ordinary implementation decisions stay in the
PR. Public package, Release, and demo publication require separate approval.
Labels describe work type and current status; milestones describe outcomes.

See [implementation plan](implementation-plan.md) for acceptance details,
[progress](progress.md) for evidence, and [architecture](architecture.md) for
technical decisions. The confirmed scoped npm name overrides the original
unscoped suggestion in the preserved plan.
