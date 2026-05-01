# Repository Notes

## Release Process

- Release workflow: `.github/workflows/publish.yml`.
- npm Trusted Publisher should be configured for owner `kitlangton`, repository `ghui`, workflow `publish.yml`, environment `npm`.
- Add a changeset for every user-facing change with `bun run changeset`.
- Check pending changesets with `bun run changeset:status`.
- Apply pending changesets with `bun run changeset:version`; this bumps `package.json` and updates `CHANGELOG.md` when release notes exist.
- Run `bun run typecheck` before committing the version bump.
- Commit and push the version bump and consumed changesets to `main`.
- Create a GitHub release named and tagged `v<package.json version>`.
- Publishing to npm happens from GitHub Actions via trusted publishing; do not use an `NPM_TOKEN`.
- The workflow verifies the release tag matches `package.json` and then runs `npm publish`.

## Commands

- Typecheck: `bun run typecheck`.
- Create changeset: `bun run changeset`.
- Check changesets: `bun run changeset:status`.
- Apply changesets: `bun run changeset:version`.
- Create release: `gh release create vX.Y.Z --target main --title "vX.Y.Z" --notes "..."`.
- Check publish run: `gh run list --workflow publish.yml --limit 5`.
- Check npm version: `npm view @kitlangton/ghui version`.

## Future Work

- PR details: show top-level PR conversation/comments in expanded detail view, likely as a compact section beneath the summary and before tests/notes when present.
