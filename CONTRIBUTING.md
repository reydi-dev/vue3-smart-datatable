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
`test:unit`, `build`, `test:dist` (after build), `build:demo`, and `test:consumer`
(after build and Chromium installation).

`test:unit` runs pure core and adapter behavior tests in a Node environment;
`test:components` runs mounted state/provider/persistence/export and desktop/mobile UI
checks. After `build:demo`, `test:e2e` runs four development interaction flows and
one production public-demo flow in Chromium. Install
Chromium with `npx playwright install chromium` first; CI uses `--with-deps` on
Ubuntu. An existing executable can be selected with
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Browser checks are separate from
`validate` so non-browser checks can run without downloading a browser. Both
commands run in CI. CI then runs `test:consumer`: an actual tarball installed into
a separately locked temporary project, with strict types, client/SSR builds and
production desktop/mobile hydration. `preview:consumer` performs the same checks
and keeps its local production server alive until Ctrl+C. See
[distribution validation](docs/distribution-validation.md).

Check the [roadmap](docs/roadmap.md) and existing issues before opening work. Use
the issue forms for reproducible bugs or use cases; link the relevant issue in
each PR. Keep future stages marked planned until work begins.

Update `docs/progress.md` with actual validation, limitations, and the next step.
Preserve the MIT notice when adapting reference code. Do not modify the separate
Vue 2 repository as part of work here.

The public demo has local, async, slots/actions and Persian RTL examples with
copyable source. `npm run build:demo && npm run preview:demo` serves the production
output. The development-only interaction fixture is available through
`?fixture=interaction` during `npm run dev`; it is excluded from public builds.
Documented examples import the package name: demo-only aliases support development,
while `test:consumer` copies them into its independent project and typechecks the
actual installed archive without aliases. Quick-start source must match README;
run `node scripts/check-doc-examples.mjs --write` after changing it.

See [demo operations](docs/demo.md) for media reproduction and approved deployment.
