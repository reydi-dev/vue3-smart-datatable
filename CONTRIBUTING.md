# Contributing

This library is in development and has no published Vue 3 release yet.

Use a descriptive branch such as `feat/public-contracts` or `chore/tooling`.
Never include `codex` in branch names. Open a pull request against `main`. Keep changes focused
on the current implementation stage. Stage results need maintainer approval
before merge; package publication, public releases, and demo deployment need
explicit approval at their release stages.

Use Node from `.nvmrc` and run `npm ci`. `npm run dev` starts the temporary
playground. `npm run validate` runs the checks currently required by CI.
Individual commands: `format:check`, `lint`, `typecheck`, `test:components`,
`test:unit`, `build`, `test:dist` (after build), and `build:demo`.

`test:unit` runs pure core and adapter behavior tests in a Node environment;
`test:components` runs the existing pipeline SFC check. `test:e2e` is configured
for the future real UI and currently has no tests. Do not claim it passes.
Playwright browser installation is not required for the current validation command.

Check the [roadmap](docs/roadmap.md) and existing issues before opening work. Use
the issue forms for reproducible bugs or use cases; link the relevant issue in
each PR. Keep future stages marked planned until work begins.

Update `docs/progress.md` with actual validation, limitations, and the next step.
Preserve the MIT notice when adapting reference code. Do not modify the separate
Vue 2 repository as part of work here.
