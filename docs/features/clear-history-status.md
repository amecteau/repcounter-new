# Feature: Clear History — Status

> **Per-feature status file.** Tracks the Clear History setting in detail.
> The top-level [docs/project-status.md](../project-status.md) lists this feature in its "Features" section and points here.
> Update this file after completing each task. Do not batch updates.

---

## Goal

Add a "Clear History" action to the Settings screen that permanently deletes all recorded workout data (sets and reps). A confirmation dialog must be shown before deletion. Custom exercises are not affected.

## Constraint

After history is cleared, all custom exercises become unreferenced and can be deleted via "Clear Custom Exercises". This feature is a prerequisite for fully clearing the exercise list, but it is independently buildable and shippable on its own.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked (see notes)
- 🔁 Needs rework (see notes)

## Current State

**Current phase**: ⬜ CH.1 — Not started. Plan complete (2026-04-29).

---

## Reference Documents

- UI mockup: [docs/ui-spec.md](../ui-spec.md)
- Architecture: [.claude/AGENTS.md](../../.claude/AGENTS.md)
- Related feature: [features/clear-exercises-status.md](clear-exercises-status.md)

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Scope | **Delete all history** | No "referenced" constraint here — history is always fully clearable. No scoping needed. |
| Atomicity | **Transaction: sets first, then workouts** | Deleting sets before workouts respects the FK relationship and keeps the DB consistent if the transaction fails mid-way. |
| Count returned | **Workout count** | More meaningful to the user than set count ("2 workouts deleted" vs. "38 sets deleted"). |
| Local state after clear | **Set `workouts = []` directly** | No need to reload from DB — we know the result is empty. Simpler than re-fetching. |
| Feature folder | **Extends `settings/` (component) + `history/` (store method)** | `ClearHistoryControl.svelte` in `settings/components/`. `historyStore` gains `clearAll()`. |
| i18n section heading | **`settings.clearDataSection` shared with Clear Exercises** | Both features live in the same "CLEAR DATA" settings section. Whichever feature is implemented first adds the key; the other skips it. |

---

## Phases

### CH.1 — Rust: repo function + command

| # | Task | Status | Notes |
|---|---|---|---|
| CH.1.1 | Add `clear_all_history(conn) -> Result<u32, String>` to `workout_repo.rs`. In a transaction: read workout count via `SELECT COUNT(*) FROM workouts`, DELETE FROM sets, DELETE FROM workouts, return count | ⬜ | |
| CH.1.2 | Thin Tauri command `clear_all_history` in `commands/workout.rs`; register in `lib.rs` | ⬜ | |
| CH.1.3 | Rust tests: (a) empty DB → returns 0; (b) 2 workouts with sets → both deleted, sets gone, count=2; (c) after clear, `get_workouts` returns empty | ⬜ | |

### CH.2 — Frontend: service + store

| # | Task | Status | Notes |
|---|---|---|---|
| CH.2.1 | `clearHistory(): Promise<ServiceResult<number>>` in `history.service.ts`; add service test | ⬜ | |
| CH.2.2 | `clearAll(): Promise<ServiceResult<number>>` in `historyStore` — calls service; on `ok: true` sets local workouts to `[]`; returns result with count | ⬜ | |
| CH.2.3 | historyStore tests: success path empties local workouts and returns count; failure path leaves existing workouts unchanged | ⬜ | |

### CH.3 — i18n: new translation keys

| # | Task | Status | Notes |
|---|---|---|---|
| CH.3.1 | Add to `locales/en.ts` and `locales/es.ts`: `settings.clearDataSection` (skip if already added by CE.3.1), `settings.clearHistoryButton`, `settings.clearHistoryConfirmTitle`, `settings.clearHistoryConfirmBody`, `settings.clearHistoryDeleted` (uses `{n}` placeholder), `settings.clearHistoryNone` | ⬜ | |

### CH.4 — UI: component + settings page

| # | Task | Status | Notes |
|---|---|---|---|
| CH.4.1 | `ClearHistoryControl.svelte` in `settings/components/`: receives `labels` prop, renders a danger-styled button; tapping opens `ConfirmDialog`; on confirm fires `onClear()` callback; no store imports | ⬜ | |
| CH.4.2 | Wire into `/settings/+page.svelte`: import `historyStore`, build `labels` from `t()`, call `historyStore.clearAll()` on confirm, show inline 3s-autodismiss message ("2 workouts deleted" or "Nothing to clear") below the button | ⬜ | |
| CH.4.3 | `ClearHistoryControl.test.ts`: button renders with correct label; clicking button opens dialog; clicking cancel dismisses without firing `onClear`; clicking confirm fires `onClear`; Spanish labels render correctly | ⬜ | |

### CH.5 — Sensor pass

| # | Task | Status | Notes |
|---|---|---|---|
| CH.5.1 | `npx svelte-check`, `npx eslint src/`, `npx vitest run`, `cargo check && cargo test && cargo clippy` — all pass | ⬜ | |

---

## Steering Log (this feature only)

| Date | What changed | Why |
|---|---|---|
| 2026-04-28 | Created stub status file | Feature captured for future planning |
| 2026-04-29 | Wrote full phase plan (CH.1–CH.5) | Planning session. Decided: delete all (no scoping), transaction with sets-first delete, return workout count, set local state to [] on success, share `settings.clearDataSection` key with Clear Exercises feature. |
