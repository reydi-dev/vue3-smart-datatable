# Repository guidance

- This is the independent Vue 3 library. npm name:
  `@reydi-dev/vue3-smart-datatable`; repository: `reydi-dev/vue3-smart-datatable`.
- Follow the stages in `docs/implementation-plan.md`, subject to the user's
  current instructions. Record real outcomes in `docs/progress.md`.
- Keep dependencies directed from components to composables to pure core to
  types. Core must not depend on Vue, the DOM, styles, or the playground.
- Use Composition API, TypeScript strict mode, and Vue as an external peer
  dependency when the toolchain is introduced. Keep browser access lazy and
  clean up timers, listeners, and requests.
- Never change the separate Vue 2 repository. Read the pinned reference with
  Git object commands; retain its MIT copyright notice when adapting code.
- Develop on `codex/` branches and submit PRs to `main`. The minimal bootstrap
  commit is the only direct-main exception. Obtain stage approval before merge;
  prefer squash merge and delete the working branch afterward.
- npm publication, public releases, and demo deployment require explicit user
  approval at their planned stages. Never store or print credentials.
- No Node package or build/test scripts exist yet. For this documentation stage,
  use `git diff --check` and inspect the changed files. Stage 2 must document
  actual commands after adding the toolchain. Do not invent placeholder tests.
- Run checks appropriate to the change; avoid redundant tests and unsupported
  claims of passing tests or product capabilities.
