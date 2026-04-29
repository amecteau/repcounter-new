## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# CLAUDE.md

## Project
Gym rep counter desktop app. Tauri v2 (Rust) + SvelteKit (TypeScript). Single user, local only.

## Before Every Task
- Read `.claude/AGENTS.md` for architecture rules and conventions
- Read `docs/project-status.md` to know where we are. If the task belongs to a major feature, read its file under `docs/features/[name]-status.md` for the detailed phase/task list.
- Read `docs/ui-spec.md` before any UI work

## Critical Rules (these get violated most often)
- All sizing in `rem`, never `px` (except borders). This is for font scaling accessibility.
- Components receive data via props. They never import stores.
- Only service files import `@tauri-apps/api`. Never in components, never in stores.
- Features never import from other features. Shared code goes in `shared/`.
- Rust commands are thin — max 10 lines. Logic goes in `repo/`.
- Every component with interactive elements needs BOTH rendering AND interaction tests.
- Use `@testing-library/user-event`, not `fireEvent`.
- Query elements by role or text, not by CSS class or test ID.
- No `.unwrap()` in Rust production code. No `any` in TypeScript.
- **Every user-visible string goes through `t()`.** Add the key to `locales/en.ts` first — TypeScript then enforces `locales/es.ts` completeness. Routes call `t()` and pass results as props. Components never import `i18nStore`.
- **Never mutate local state before a data operation succeeds.** Call the service first; only update in-memory state when `result.ok === true`. No optimistic updates. On failure: delete/clear operations must leave items visible; create/update operations must preserve the form data so the user can correct and retry — do not clear inputs or reset forms on failure.
- **Never request elevated device permissions.** All file operations must go through the OS-mediated dialog (SAF on Android, document picker on iOS) — never write to arbitrary paths directly. No `WRITE_EXTERNAL_STORAGE`, broad storage access, contacts, camera, or any other sensitive permission. If a feature cannot be built without elevated access, raise it for discussion before implementing.

## After Every Task
Update `docs/project-status.md` for the task just completed (⬜→✅) **before starting the next task**. Do not batch status updates to the end of a phase.

Run the full checklist:
```
npx svelte-check --tsconfig ./tsconfig.json
npx eslint src/
npx vitest run
cd src-tauri && cargo check && cargo test && cargo clippy
```
Fix all failures before moving on.

## Status Tracking
Core build progress lives in `docs/project-status.md`. Major-feature progress lives in `docs/features/[name]-status.md` (one file per feature).

- **Core-build task** (Phases 1-8): update `docs/project-status.md` (⬜→🔄→✅).
- **Feature task** (anything tracked in `docs/features/`): update the per-feature file. Do **not** also duplicate the row into `docs/project-status.md` — the project-level file just lists the feature in its "Features" section and points to the per-feature file.

Update statuses after each task — do not batch. Log any harness changes (changes to AGENTS.md, ui-spec.md, eslint rules, etc.) in the Steering Log at the bottom of `docs/project-status.md`. Per-feature files have their own Steering Log for decisions scoped to that feature only.

## Do Not
- Add features not in the UI spec without asking
- Create files outside the defined feature folder structure
- Skip writing tests
