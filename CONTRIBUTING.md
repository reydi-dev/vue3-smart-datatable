# Contributing

This library is in development and has no published Vue 3 release yet.

Use a `codex/` branch and open a pull request against `main`. Keep changes focused
on the current implementation stage. Stage results need maintainer approval
before merge; package publication, public releases, and demo deployment need
explicit approval at their release stages.

Use Node from `.nvmrc` and run `npm ci`. `npm run dev` starts the temporary
playground. `npm run validate` runs the checks currently required by CI.
Individual commands: `format:check`, `lint`, `typecheck`, `test:components`,
`build`, `test:dist` (after build), and `build:demo`.

`test:unit` and `test:e2e` are configured for future meaningful suites and currently
fail because there are no tests in those categories. Do not add fake tests or
claim those categories pass. Playwright browser installation is not required for
the current validation command.

Check the [roadmap](docs/roadmap.md) and existing issues before opening work. Use
the issue forms for reproducible bugs or use cases; link the relevant issue in
each PR. Keep future stages marked planned until work begins.

Update `docs/progress.md` with actual validation, limitations, and the next step.
Preserve the MIT notice when adapting reference code. Do not modify the separate
Vue 2 repository as part of work here.
