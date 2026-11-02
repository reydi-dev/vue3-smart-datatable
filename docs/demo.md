# Demo operations

The production demo offers local selection/filtering/CSV/persistence, an abortable
synthetic async provider, custom cells/actions, and Persian RTL with a theme switch.
Every example exposes its actual source. Data is synthetic; no external service
or user account is required. The npm package is still unpublished.

## Local preview

Use Node from `.nvmrc`, then `npm ci`, `npm run build:demo` and
`npm run preview:demo`. Open the printed URL with `/vue3-smart-datatable/`.
Fragments `#local`, `#async`, `#slots` and `#rtl` select examples and survive reload.
`npm run dev` supports live editing; its `?fixture=interaction` route is only for
development/browser tests. Production excludes that fixture and its debug tools.

The public examples use package imports. Demo-only aliases resolve those imports
to source for development. `test:consumer` copies every documented example into
an independently locked temporary project and strictly compiles the installed
archive without those aliases. README quick-start source is checked for equality
with `docs/examples/QuickStart.vue` by the normal typecheck command.

## Real media

Start a production preview on port 4185 with
`npm run preview:demo -- --port 4185 --strictPort`. Install Playwright Chromium,
then run `node scripts/capture-demo.mjs`. An existing browser can be selected with
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; `DEMO_URL` overrides the capture URL.
The script saves real desktop/mobile screenshots and six interaction frames.
With Pillow installed in a separate Python environment, run
`python scripts/encode-demo-gif.py` to encode the frames. Pillow is an optional
documentation tool, not a package/runtime dependency. Commit reviewed media only.

## Public hosting approval and deployment

Public hosting is not enabled by this PR. Repository guidance requires explicit
maintainer approval before deploying the demo. The prepared workflow is manual;
merging alone does not deploy anything.

After approval:

1. Merge the reviewed PR and wait for successful push CI on the exact main commit.
2. Enable GitHub Pages with GitHub Actions as its build source in repository settings.
3. Run the **Deploy demo** workflow on `main`. Its guard rejects other branches
   and requires successful `ci.yml` push validation for that exact SHA.
4. Inspect the deployment output URL and verify HTTP success, JS/CSS asset loading,
   all four examples, fragment reload and narrow RTL layout on the actual site.
5. Set the repository homepage and README live-demo link to that verified URL;
   record the deployment run and result in progress/issue #11.

Vite's base is `/vue3-smart-datatable/`. `build:demo` checks asset paths and the
absence of development fixtures in the public bundle. A custom domain or renamed
repository requires updating that base and checking the resulting assets again.
Keep deployment credentials in Actions; never commit or print tokens.

The workflow separates build/deploy jobs, grants Pages/OIDC permissions only to
deployment and uses the `github-pages` environment. See GitHub's
[custom Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
and [workflow runs API](https://docs.github.com/en/rest/actions/workflow-runs).
