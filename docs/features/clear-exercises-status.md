# Feature: Clear Custom Exercises — Status

> **Per-feature status file.** Tracks the Clear Custom Exercises setting in detail.
> The top-level [docs/project-status.md](../project-status.md) lists this feature in its "Features" section and points here.
> Update this file after completing each task. Do not batch updates.

---

## Goal

Add a "Clear Custom Exercises" action to the Settings screen that permanently deletes all user-defined exercises. A confirmation dialog must be shown before deletion.

## Constraint

A custom exercise **cannot** be removed if it appears in any workout history. The action is **scoped to unused exercises only** — exercises referenced in any set are silently preserved. The confirmation dialog and result message explain this behaviour. Exercises referenced in history are not a blocker; they are simply skipped.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked (see notes)
- 🔁 Needs rework (see notes)

## Current State

**Current phase**: ⬜ CE.1 — Not started. Plan complete (2026-04-29).

---

## Reference Documents

- UI mockup: [docs/ui-spec.md](../ui-spec.md)
- Architecture: [.claude/AGENTS.md](../../.claude/AGENTS.md)
- Related feature: [features/clear-history-status.md](clear-history-status.md)

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Blocked vs. scoped | **Scoped to unused** | Deleting what can be deleted is more useful than blocking everything because one exercise has history. Dialog body and result message explain what was skipped. |
| Feature folder | **Extends `settings/`** | No new feature folder. `ClearExercisesControl.svelte` lives in `settings/components/`. `exerciseStore` gains `clearUnused()`. |
| Count handling | **Store returns `ServiceResult<number>`** | Route receives the deleted count and renders "3 deleted" / "Nothing to clear". Component is count-unaware. |
| State refresh | **Re-fetch after clear** | After success, `exerciseStore` calls `getCustomExercises()` again — we don't know which IDs were removed, only the count. |
| Dialog | **Reuse shared `ConfirmDialog`** | Already in `shared/components/`. Settings route passes translated labels. |
| i18n | **Add 6 keys to `en.ts` + `es.ts`** | TypeScript enforces completeness. Keys added before building the component. |

---

## Phases

### CE.1 — Rust: repo function + command

| # | Task | Status | Notes |
|---|---|---|---|
| CE.1.1 | Add `clear_unused_custom_exercises(conn) -> Result<u32, String>` to `exercise_repo.rs`. SQL: `DELETE FROM custom_exercises WHERE id NOT IN (SELECT DISTINCT exercise_id FROM sets)`, then `conn.changes()` for count | ⬜ | |
| CE.1.2 | Thin Tauri command `clear_unused_custom_exercises` in `commands/exercise.rs`; register in `lib.rs` | ⬜ | |
| CE.1.3 | Rust tests: (a) empty table → returns 0; (b) one unreferenced exercise → deleted, count=1; (c) one referenced exercise → kept, count=0; (d) mixed → only unreferenced deleted, count accurate | ⬜ | |

### CE.2 — Frontend: service + store

| # | Task | Status | Notes |
|---|---|---|---|
| CE.2.1 | `clearUnusedExercises(): Promise<ServiceResult<number>>` in `exercise.service.ts`; add service test | ⬜ | |
| CE.2.2 | `clearUnused(): Promise<ServiceResult<number>>` in `exerciseStore` — calls service; on `ok: true` calls `getCustomExercises()` to refresh local state; returns the result with count | ⬜ | |
| CE.2.3 | exerciseStore tests: success path reloads exercises and returns count; failure path leaves existing exercises unchanged | ⬜ | |

### CE.3 — i18n: new translation keys

| # | Task | Status | Notes |
|---|---|---|---|
| CE.3.1 | Add to `locales/en.ts` and `locales/es.ts`: `settings.clearDataSection`, `settings.clearExercisesButton`, `settings.clearExercisesConfirmTitle`, `settings.clearExercisesConfirmBody`, `settings.clearExercisesDeleted` (uses `{n}` placeholder), `settings.clearExercisesNone` | ⬜ | |

### CE.4 — UI: component + settings page

| # | Task | Status | Notes |
|---|---|---|---|
| CE.4.1 | `ClearExercisesControl.svelte` in `settings/components/`: receives `labels` prop, renders a danger-styled button; tapping opens `ConfirmDialog`; on confirm fires `onClear()` callback; no store imports | ⬜ | |
| CE.4.2 | Wire into `/settings/+page.svelte`: import `exerciseStore`, build `labels` from `t()`, call `exerciseStore.clearUnused()` on confirm, show inline 3s-autodismiss message ("3 deleted" or "Nothing to clear") below the button | ⬜ | |
| CE.4.3 | `ClearExercisesControl.test.ts`: button renders with correct label; clicking button opens dialog; clicking cancel dismisses without firing `onClear`; clicking confirm fires `onClear`; Spanish labels render correctly | ⬜ | |

### CE.5 — Sensor pass

| # | Task | Status | Notes |
|---|---|---|---|
| CE.5.1 | `npx svelte-check`, `npx eslint src/`, `npx vitest run`, `cargo check && cargo test && cargo clippy` — all pass | ⬜ | |

---

## Steering Log (this feature only)

| Date | What changed | Why |
|---|---|---|
| 2026-04-28 | Created stub status file | Feature captured for future planning |
| 2026-04-29 | Wrote full phase plan (CE.1–CE.5) | Planning session. Decided: scope to unused (not block), extend settings feature, store returns count to route, reload after clear. |
