# CLAUDE.md

## Project
Gym rep counter desktop app. Tauri v2 (Rust) + SvelteKit (TypeScript). Single user, local only.

## Before Every Task
- Read `.claude/AGENTS.md` for architecture rules and conventions
- Read `docs/project-status.md` to know where we are
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

## After Every Task
Run the full checklist:
```
npx svelte-check --tsconfig ./tsconfig.json
npx eslint src/
npx vitest run
cd src-tauri && cargo check && cargo test && cargo clippy
```
Fix all failures before moving on.

## Status Tracking
Update `docs/project-status.md` after completing each task (⬜→🔄→✅).
Log any harness changes in the Steering Log at the bottom of that file.

## Do Not
- Add features not in the UI spec without asking
- Create files outside the defined feature folder structure
- Skip writing tests
