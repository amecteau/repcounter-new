Release a new version to GitHub and trigger the CI build. Takes a bump type as argument: `patch`, `minor`, or `major`.

**Step 1 — Confirm bump type**
Use $ARGUMENTS as the bump type. If $ARGUMENTS is empty or not one of `patch` / `minor` / `major`, ask the user which to use before continuing. Do not proceed without a confirmed bump type.

**Step 2 — Handle uncommitted changes**
Run `git status`. If there are uncommitted tracked changes:
- Show the file list to the user
- Stage tracked changes only (`git add -u`) and create a commit — ask the user for a commit message, or suggest one based on what changed
- If there are untracked files, list them and ask whether to include each one before staging

If the tree is already clean, skip this step.

**Step 3 — Bump version**
Run `npm version <bump>`. This automatically:
- Bumps `package.json`
- Runs `scripts/version-sync.mjs` (syncs the new version into `src-tauri/tauri.conf.json` and stages it)
- Creates a version commit and a `v<X.Y.Z>` git tag

**Step 4 — Push**
Run `git push` then `git push --tags`.

Report the new version number and tag that was pushed. Remind the user that GitHub Actions will run tests first and only build the release if they pass — they can monitor progress at the repo's Actions tab.
