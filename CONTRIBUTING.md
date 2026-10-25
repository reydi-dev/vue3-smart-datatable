# Contributing

This library is in development and has no published Vue 3 release yet.

Use a descriptive branch such as `feat/public-contracts` or `chore/tooling`.
Never include `codex` in branch names. Open a pull request against `main`. Keep changes focused
on the current implementation stage. Stage results need maintainer approval
before merge; package publication, public releases, and demo deployment need
explicit approval at their release stages.

Use Node from `.nvmrc` and run `npm ci`. `npm run dev` starts the development
playground. `npm run validate` runs the checks currently required by CI.
Individual commands: `format:check`, `lint`, `typecheck`, `test:components`,
`test:unit`, `build`, `test:dist` (after build), and `build:demo`.

`test:unit` runs pure core and adapter behavior tests in a Node environment;
`test:components` runs mounted state/provider/persistence/export and desktop/mobile UI
checks. `test:e2e` runs four Chromium flows against the actual playground. Install
Chromium with `npx playwright install chromium` first; CI uses `--with-deps` on
Ubuntu. An existing executable can be selected with
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Browser checks are separate from
`validate` so non-browser checks can run without downloading a browser. Both
commands run in CI.

Check the [roadmap](docs/roadmap.md) and existing issues before opening work. Use
the issue forms for reproducible bugs or use cases; link the relevant issue in
each PR. Keep future stages marked planned until work begins.

Update `docs/progress.md` with actual validation, limitations, and the next step.
Preserve the MIT notice when adapting reference code. Do not modify the separate
Vue 2 repository as part of work here.
