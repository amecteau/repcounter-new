# Feature: Export History (CSV) — Status

> **Per-feature status file.** Tracks the Export History feature in detail.
> The top-level [docs/project-status.md](../project-status.md) lists this feature in its "Features" section and points here.
> Update this file after completing each task. Do not batch updates.

---

## Goal

Add an "Export History" action to the Settings screen that generates a CSV file of the user's complete workout history and triggers a native save dialog. Each row in the CSV represents one set (data replication by row), with columns for date, exercise name, set number within that exercise in that workout, reps, weight, and unit.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked (see notes)
- 🔁 Needs rework (see notes)

## Current State

**Current phase**: ⬜ EH.1 — Not started. Plan complete (2026-04-29).

---

## Reference Documents

- UI mockup: [docs/ui-spec.md](../ui-spec.md)
- Architecture: [.claude/AGENTS.md](../../.claude/AGENTS.md)

---

## CSV Format

One row per set. Columns:

| Column | Source | Notes |
|---|---|---|
| `Date` | `workout.date` | ISO 8601 date string (YYYY-MM-DD) |
| `Exercise` | Resolved exercise name | Default exercises looked up by ID; custom exercises use stored name |
| `Set #` | Calculated | 1-based ordinal among sets with same `exercise_id` in the workout, ordered by `timestamp` |
| `Reps` | `set.reps` | Integer |
| `Weight` | `set.weight` | Empty cell if `null` (bodyweight); otherwise numeric |
| `Unit` | `set.unit` | `kg` or `lb` — empty if weight is null |

Headers are translated to the active app language. Fields containing commas, quotes, or newlines are quoted per RFC 4180.

**Example (English):**
```
Date,Exercise,Set #,Reps,Weight,Unit
2026-04-14,Bench Press,1,12,135,lb
2026-04-14,Bench Press,2,10,135,lb
2026-04-14,Squat,1,8,225,lb
2026-04-14,Pull-Up,1,8,,
```

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| CSV row granularity | **One row per set** | User requirement. Most useful for analysis in Excel/Sheets. |
| CSV generation location | **TypeScript (`shared/utils/buildCsv.ts`)** | Frontend has access to default exercise names (TypeScript constant) and i18n column headers. Rust has neither. |
| File I/O | **Tauri plugins (`tauri-plugin-dialog` + `tauri-plugin-fs`)** | File system access belongs in the backend per architecture. Plugins abstract the platform difference (desktop save dialog vs. Android file picker). |
| New Tauri commands | **None** | Existing `get_workouts` command returns all data needed. Plugins are invoked via their own JS bindings in the service. |
| Cross-feature isolation | **`buildCsv()` in `shared/utils/`; settings route orchestrates** | `buildCsv()` is a pure function with no feature affiliation. The settings route imports `exerciseStore` to build the name map and passes it in — no cross-feature imports in the service layer. |
| Exercise name resolution | **Route builds `Record<string, string>` and passes to `buildCsv()`** | Default exercise names live in the exercises feature constant; custom names from the store. Settings route has access to both via `exerciseStore`. |
| Set number calculation | **`buildCsv()` calculates per exercise group per workout** | Sets are grouped by `exercise_id` within a workout, sorted by `timestamp`, then numbered 1-based. The DB has no set-number column. |
| Bodyweight sets | **Empty `Weight` and `Unit` cells** | `null` weight → empty string. Do not write `0`. |
| User cancels save dialog | **`ok: true, data: null` — not an error** | Cancellation is a valid user action. Only actual write failures surface an error. |
| Translated column headers | **Yes** | File content matches the active app language — consistent for the user reading their own export. |
| Empty history | **Show "Nothing to export" message — do not open save dialog** | Check workout count before proceeding; avoid opening an empty-file dialog. |

---

## Phases

### EH.1 — Dependencies: Tauri plugins

| # | Task | Status | Notes |
|---|---|---|---|
| EH.1.1 | Add `tauri-plugin-dialog` and `tauri-plugin-fs` to `src-tauri/Cargo.toml`; register both plugins in `lib.rs` | ⬜ | |
| EH.1.2 | Add plugin permissions to `tauri.conf.json`: `dialog:allow-save` and `fs:allow-write-text-file` | ⬜ | |
| EH.1.3 | `npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-fs` | ⬜ | |

### EH.2 — CSV builder utility

| # | Task | Status | Notes |
|---|---|---|---|
| EH.2.1 | `shared/utils/buildCsv.ts` — pure `buildCsv(workouts: Workout[], exerciseNames: Record<string, string>, labels: CsvLabels): string`. Groups sets by exercise within each workout, sorts by timestamp, assigns 1-based set numbers. Empty weight and unit cells for bodyweight sets. RFC 4180 quoting. | ⬜ | `CsvLabels` is a local type: the 6 translated column header strings |
| EH.2.2 | `shared/utils/buildCsv.test.ts`: (a) empty workouts → header row only; (b) single set → correct columns; (c) bodyweight set → empty weight and unit cells; (d) multiple exercises in one workout → correct set numbering per exercise; (e) multiple workouts → rows in date order; (f) exercise name containing a comma → field is quoted | ⬜ | |

### EH.3 — Export service

| # | Task | Status | Notes |
|---|---|---|---|
| EH.3.1 | `settings/export.service.ts` — `getAllWorkouts(): Promise<ServiceResult<Workout[]>>` (calls existing `get_workouts` Tauri command); `saveFile(csv: string, defaultFilename: string): Promise<ServiceResult<string \| null>>` (calls `dialog.save()` → if path returned calls `fs.writeTextFile(path, csv)` → returns path; if cancelled returns `ok: true, data: null`) | ⬜ | |
| EH.3.2 | `settings/export.service.test.ts`: mock `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs`; test: `getAllWorkouts` returns workouts on success; `saveFile` calls `dialog.save` with correct filter options; `saveFile` writes file when path returned; `saveFile` returns `null` data (not error) when user cancels | ⬜ | |

### EH.4 — i18n: new translation keys

| # | Task | Status | Notes |
|---|---|---|---|
| EH.4.1 | Add to `locales/en.ts` and `locales/es.ts`: `settings.exportButton`, `settings.exportSuccess` (uses `{path}` placeholder), `settings.exportNone`, `export.colDate`, `export.colExercise`, `export.colSet`, `export.colReps`, `export.colWeight`, `export.colUnit` | ⬜ | `export.*` keys are CSV column headers — translated to match active language |

### EH.5 — UI: component + settings page

| # | Task | Status | Notes |
|---|---|---|---|
| EH.5.1 | `ExportHistoryControl.svelte` in `settings/components/`: receives `labels` prop; shows export button; shows loading spinner/disabled state while export is in progress; shows 3s-autodismiss success or "Nothing to export" message; emits `onExport(): Promise<void>` callback; no store imports | ⬜ | |
| EH.5.2 | Wire into `/settings/+page.svelte`: import `exerciseStore` for name map and `historyStore` (or export service directly) for data; on button tap: call `getAllWorkouts()`, bail with "nothing to export" if empty, build exercise name map from `exerciseStore`, call `buildCsv()` with translated column labels, call `saveFile(csv, 'setforge-history.csv')`, show result | ⬜ | Default filename: `setforge-history.csv` |
| EH.5.3 | `ExportHistoryControl.test.ts`: button renders; button is disabled while `onExport` is running; success message appears after export; "Nothing to export" shown when `onExport` resolves with no data; Spanish labels render correctly | ⬜ | |

### EH.6 — Sensor pass

| # | Task | Status | Notes |
|---|---|---|---|
| EH.6.1 | `npx svelte-check`, `npx eslint src/`, `npx vitest run`, `cargo check && cargo test && cargo clippy` — all pass | ⬜ | |

---

## Steering Log (this feature only)

| Date | What changed | Why |
|---|---|---|
| 2026-04-28 | Created stub status file | Feature captured for future planning |
| 2026-04-29 | Wrote full phase plan (EH.1–EH.6) | Planning session. One row per set (user requirement). CSV built in TypeScript (has exercise names + i18n); file I/O via Tauri plugins; `buildCsv()` as pure shared utility; settings route orchestrates to avoid cross-feature imports; user cancel is not an error; translated column headers. |
