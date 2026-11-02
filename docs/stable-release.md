# First stable release checklist

Candidate: `@reydi-dev/vue3-smart-datatable@0.1.0`, public, `latest`. The
published beta is `0.1.0-beta.1`. This document prepares the release; it does not
claim that 0.1.0 is already published.

## Before approval

- Review user feedback, outstanding blocking defects, compatibility limitations,
  the complete release diff, successful CI and the current public demo.
- Validate the exact candidate tarball locally and in an independent installed
  consumer and the Vue 3 package lab. Record its commit and integrity in the PR.
- Verify the requested version is absent on npm, and confirm registry tags. A 404
  is not a reservation or proof of publishing permission.
- Obtain explicit maintainer approval for merge, npm publication to `latest`, and
  the matching stable Git tag and GitHub Release.

## After approval

- Recheck the approved PR head and CI, squash-merge, compare the final main tree
  with the approved candidate, and wait for successful main CI.
- Build and pack on that commit; compare the tarball integrity and contents with
  the approved candidate. Publish the verified archive explicitly with
  `npm publish <archive> --access public --tag latest`.
- Verify npm registry version, integrity, `latest` and a fresh unqualified npm
  install. Verify CSS, types and representative browser/SSR use from the registry.
  If processing is pending or the response is ambiguous, check the registry
  before retrying; never republish an existing version.
- Tag the published commit as `v0.1.0`, create the matching non-prerelease GitHub
  Release, update documentation/demo to the verified release status, and check
  the live demo and README media. Record results in issues #12, #13 and #27.
- Keep the beta and stable releases distinct. `next` may remain on the beta unless
  explicitly changed; do not infer a change from publication to `latest`.
- Report any required authentication prompt to the maintainer for a secure
  interactive flow. Never place credentials or one-time codes in chat or Git.

Vue 2 and Vue 3 are independent projects. Triage fixes by impact and demand;
there is no obligation to synchronize versions or copy changes between repos.
SSR and browser support are limited to the evidence in
[distribution validation](distribution-validation.md) and the release PR.

Reference: [npm distribution tags](https://docs.npmjs.com/adding-dist-tags-to-packages/).
