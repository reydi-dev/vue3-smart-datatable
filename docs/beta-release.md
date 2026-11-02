# First beta release checklist

Candidate: `@reydi-dev/vue3-smart-datatable@0.1.0-beta.1`, scoped public access,
`next` dist-tag. This beta was published on 2026-11-03. The beta is ESM-only,
requires Vue `^3.5.44`, and has focused Chromium and SSR evidence, not a broad
browser or Nuxt compatibility promise. See [distribution validation](distribution-validation.md).

## Original release checks

- Review issue #12, blocking bugs, release diff, CI and actual demo.
- Run the repository checks and installed tarball consumer against the candidate.
- Record the candidate commit, tarball integrity and archive contents in the PR.
- Verify npm identity and registry name availability again; a 404 does not reserve it.
- Get explicit maintainer approval for merge, public npm beta and Git tag/Release.

## Publication procedure

- Recheck PR head and CI, squash-merge and ensure main's tree matches the approved
  candidate. Check main CI and repeat packaging from the merged commit; compare
  archive integrity/content with the approved candidate before publication.
- Publish the verified archive explicitly with `npm publish <archive> --access public --tag next`.
  Check the exact target and contents first. Respond to any npm authentication
  challenge through the secure interactive flow; never paste credentials into chat.
- Verify registry version and `next` tag, public README/media and an independent
  installation from the registry. Confirm the actual live demo still works.
- Create the Git tag and GitHub Release for the published main commit, mark it
  prerelease, and record registry integrity, links and actual outcomes in #12.
- Update README/demo copy only after registry verification; do not claim release
  success based solely on a successful publish command.

The `next` tag is specified both in `publishConfig` and the publish command.
Scoped public access is explicit. See npm's [scoped package guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/) and [publish reference](https://docs.npmjs.com/cli/v11/commands/npm-publish/).
