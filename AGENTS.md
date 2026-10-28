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
- Use descriptive `feat/`, `fix/`, `chore/`, `docs/`, `test/`, or `ci/` branch names.
  Never include `codex` anywhere in a branch name. Submit PRs to `main`. The minimal bootstrap
  commit is the only direct-main exception. Obtain stage approval before merge;
  prefer squash merge and delete the working branch afterward.
- npm publication, public releases, and demo deployment require explicit user
  approval at their planned stages. Never store or print credentials.
- Use Node from `.nvmrc` and `npm ci`. Current checks: `npm run validate`.
  `npm run dev` starts the playground; `npm run build` emits ESM/CSS/types.
  `test:components` covers mounted state/provider/persistence/export and desktop/mobile UI fixtures.
  `test:dist` requires the build. Unit tests cover pure core/adapters. `test:e2e` runs four real desktop/mobile browser flows;
  install Playwright Chromium first (or provide PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH).
  CI runs validate, Chromium E2E and test:consumer on Ubuntu. The consumer check
  requires build and Chromium, installs a real tarball outside the repository,
  and writes test-results/packed-consumer-report.json. Its fixture has a separate
  lock/tsconfig; never add source aliases or symlinks to make it pass.
  preview:consumer runs the same checks and keeps a production SSR preview alive.
- Link stage issues in PRs, keep issue labels honest, and update roadmap/progress.
- Run checks appropriate to the change; avoid redundant tests and unsupported
  claims of passing tests or product capabilities.
