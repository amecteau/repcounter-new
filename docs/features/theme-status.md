# Feature: Light / Dark Mode — Status

> **Per-feature status file.** Tracks the Light/Dark/System theme setting in detail.
> The top-level [docs/project-status.md](../project-status.md) lists this feature in its "Features" section and points here.
> Update this file after completing each task. Do not batch updates.

---

## Goal

Allow users to choose between Light, Dark, and "Match system" color themes. The preference is persisted in `UserSettings` alongside the existing language preference. "Match system" reads `prefers-color-scheme` at launch and reacts to OS changes live. The Settings screen hosts the control (same shape as `LanguageControl`).

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked (see notes)
- 🔁 Needs rework (see notes)

## Current State

**Current phase**: ⬜ TH.1 — Not started. Plan complete (2026-04-30).

---

## Reference Documents

- UI mockup: [docs/ui-spec.md](../ui-spec.md)
- Architecture: [.claude/AGENTS.md](../../.claude/AGENTS.md)

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Dark mode CSS strategy | **Tailwind `dark:` variant, class-based** | Consistent with the existing Tailwind utility pattern. Configured via `@custom-variant dark` in `app.css`. Each component adds light-mode base classes + `dark:` prefixed dark variants. No CSS custom properties needed. |
| Where to apply theme | **`.dark` class on `<html>`** | Standard pattern; `dark:` variants cascade to the entire document. `settingsStore.applyTheme()` adds/removes the class. |
| System detection | **`matchMedia('(prefers-color-scheme: dark)')`** | Detected once at load in `settingsStore.load()`. Also registers a `change` listener so flipping the OS theme while the app is open updates the UI without restart. |
| Change listener owner | **`settingsStore`** | The store owns all theme state; the listener calls `applyTheme()` directly. The listener is registered only when preference is `'system'` and torn down when the user picks a fixed theme. |
| Stored type | **`ThemePreference = 'system' \| 'light' \| 'dark'`** | Matches the `LanguagePreference` pattern exactly. `'system'` is persisted; resolution happens fresh at runtime. |
| Resolved type | **`Theme = 'light' \| 'dark'`** | Derived value — never persisted, never stored in Rust. Used only by `applyTheme()` and passed to `ThemeControl` to show the resolved label in the "Match system" option. |
| Default | **`'system'`** | App opens matching the OS. Consistent with language preference default. |
| Feature folder | **Extends `settings/`** | No new feature folder. `ThemeControl.svelte` lives in `settings/components/`. Store and service are extended, not replaced. |
| i18n | **4 keys added to `en.ts` + `es.ts`** | `settings.theme.heading`, `settings.theme.matchSystem`, `settings.theme.light`, `settings.theme.dark`. TypeScript enforces `es.ts` completeness. |
| Component light-mode audit | **Add light base + `dark:` variants per component** | The app currently has dark-only Tailwind colors everywhere. Each component file gets light-mode base classes added alongside existing dark colors (e.g., `bg-white dark:bg-zinc-900`). Mechanical but necessary — no architectural change. |

---

## Phases

### TH.1 — Types and Rust backend

| # | Task | Status | Notes |
|---|---|---|---|
| TH.1.1 | Add `Theme = 'light' \| 'dark'` and `ThemePreference = 'system' \| Theme` to `src/lib/shared/types/settings.ts`. Add `theme: ThemePreference` to `UserSettings` interface. | ⬜ | |
| TH.1.2 | Add `pub theme: String` to Rust `UserSettings` struct in `src-tauri/src/models/settings.rs`. Add serialization test: `theme` field round-trips as camelCase. | ⬜ | |
| TH.1.3 | Update `settings_repo.rs`: `save_settings` upserts `("theme", settings.theme)`. `get_settings` reads `"theme"` key with default `"system"`. Add Rust tests: (a) default is `system` when key absent; (b) persists and retrieves `light`; (c) persists and retrieves `dark`. | ⬜ | |

---

### TH.2 — Store: state, resolution, and apply-theme

| # | Task | Status | Notes |
|---|---|---|---|
| TH.2.1 | Add `theme = $state<ThemePreference>('system')` to `settingsStore`. Add `resolvedTheme = $derived(...)` that resolves `'system'` using `matchMedia`. Expose both via getters. | ⬜ | `resolvedTheme` is a derived `Theme` value used only at runtime. |
| TH.2.2 | Add `applyTheme(resolved: Theme): void` that adds/removes `'dark'` class on `document.documentElement`. Call it inside an `$effect` that watches `resolvedTheme`. | ⬜ | Effect ensures the DOM stays in sync whenever the preference or system theme changes. |
| TH.2.3 | Register a `matchMedia` change listener in `settingsStore.load()` when preference is `'system'`. Tear it down (store the listener ref, call `removeEventListener`) when preference changes away from `'system'`. | ⬜ | Allows live OS theme switching to update the app without restart. |
| TH.2.4 | Add `setTheme(p: ThemePreference): void` that sets `theme`, calls `persist()`, and manages the media query listener. | ⬜ | |
| TH.2.5 | Update `settingsStore` unit tests: (a) default resolves `system` to the matchMedia result; (b) `setTheme('light')` sets resolved to `light` regardless of system; (c) `setTheme('dark')` sets resolved to `dark`; (d) `setTheme('system')` defers back to matchMedia. | ⬜ | Mock `window.matchMedia` in Vitest setup. |

---

### TH.3 — Tailwind dark mode configuration

| # | Task | Status | Notes |
|---|---|---|---|
| TH.3.1 | Add `@custom-variant dark (&:is(.dark, .dark *));` to `src/lib/app.css` (after the `@import "tailwindcss"` line). This tells Tailwind v4 to activate `dark:` utilities when any ancestor has class `dark`. | ⬜ | Without this, `dark:` variants respond to `prefers-color-scheme` media query by default, not the class. |
| TH.3.2 | Verify the configuration works: add a temporary `dark:bg-red-500` to `+layout.svelte`, manually set `document.documentElement.classList.add('dark')` in the browser console, confirm the class activates. Remove temporary test code. | ⬜ | Manual smoke test before the full component audit. |

---

### TH.4 — Component light-mode audit

Add light-mode base classes to every component that uses dark Tailwind colors. The `dark:` variant preserves the existing dark styles. Pattern: replace `bg-zinc-900` with `bg-white dark:bg-zinc-900`, replace `text-zinc-100` with `text-zinc-900 dark:text-zinc-100`, etc.

| # | Task | Status | Notes |
|---|---|---|---|
| TH.4.1 | `src/routes/+layout.svelte` — top bar, bottom nav wrapper, overall page background. | ⬜ | |
| TH.4.2 | `src/lib/shared/components/BottomNav.svelte` — nav bar background, active/inactive tab colors, icon colors. | ⬜ | |
| TH.4.3 | `src/lib/shared/components/ConfirmDialog.svelte` — modal backdrop, dialog surface, button colors. | ⬜ | |
| TH.4.4 | `src/lib/shared/components/SwipeToReveal.svelte` — revealed action background, text colors. | ⬜ | |
| TH.4.5 | `src/lib/features/counter/components/RepCounter.svelte` — card surface, rep count color, button colors. | ⬜ | Rep count accent color likely stays the same in both themes. |
| TH.4.6 | `src/lib/features/counter/components/WeightInput.svelte` — card surface, input background, stepper button colors. | ⬜ | |
| TH.4.7 | `src/lib/features/counter/components/SetList.svelte` — set row background, text, divider colors. | ⬜ | |
| TH.4.8 | `src/lib/features/exercises/components/ExercisePicker.svelte` — full-screen overlay, search bar, list item colors. | ⬜ | |
| TH.4.9 | `src/lib/features/exercises/components/ExerciseList.svelte` — section headers, row colors. | ⬜ | |
| TH.4.10 | `src/lib/features/exercises/components/AddExerciseForm.svelte` — form background, input, button colors. | ⬜ | |
| TH.4.11 | `src/lib/features/history/components/WorkoutCard.svelte` — card surface, text, meta colors. | ⬜ | |
| TH.4.12 | `src/lib/features/history/components/WorkoutDetail.svelte` — expanded view surface, set row text. | ⬜ | |
| TH.4.13 | `src/lib/features/settings/components/LanguageControl.svelte` — radio group, option row colors. | ⬜ | |
| TH.4.14 | `src/lib/features/settings/components/FontScaleControl.svelte` — button surface, text colors. | ⬜ | |
| TH.4.15 | Route files (`counter/+page.svelte`, `history/+page.svelte`, `exercises/+page.svelte`, `settings/+page.svelte`) — any page-level background or section colors. | ⬜ | |

---

### TH.5 — ThemeControl component and settings page

| # | Task | Status | Notes |
|---|---|---|---|
| TH.5.1 | Add i18n keys to `src/lib/features/i18n/locales/en.ts`: `'settings.theme.heading'`, `'settings.theme.matchSystem'`, `'settings.theme.light'`, `'settings.theme.dark'`. TypeScript will fail in `es.ts` until step TH.5.2. | ⬜ | Add to `en.ts` first — this updates the `TranslationKey` type. |
| TH.5.2 | Add matching Spanish translations for the 4 keys to `locales/es.ts`. Verify `svelte-check` passes. | ⬜ | |
| TH.5.3 | Create `src/lib/features/settings/components/ThemeControl.svelte`. Props: `preference: ThemePreference`, `resolvedTheme: Theme`, `labels: { heading, matchSystem, light, dark }`, `onChange: (p: ThemePreference) => void`. Three radio options: Match system (shows resolved label in parens), Light, Dark. Mirror `LanguageControl` structure exactly. | ⬜ | No store import in the component — data flows via props. |
| TH.5.4 | Write `ThemeControl.test.ts`: rendering tests (all three options present, resolved label shown in system option, correct option is checked); interaction tests (selecting each option fires `onChange` with correct value). | ⬜ | Use `@testing-library/user-event`, query by role. |
| TH.5.5 | Wire `ThemeControl` into `src/routes/settings/+page.svelte`: import `settingsStore`, build labels object from `t()`, pass `preference`, `resolvedTheme`, and `setTheme` as `onChange`. Add a THEME section above the LANGUAGE section. | ⬜ | Route calls `t()` — component never imports `i18nStore`. |
| TH.5.6 | Update `docs/ui-spec.md`: add THEME section to the Settings screen layout and interactions table. Document the three options, the resolved-label behaviour, and that the control sits above the LANGUAGE section. | ⬜ | |

---

### TH.6 — Full checklist

| # | Task | Status | Notes |
|---|---|---|---|
| TH.6.1 | `npx svelte-check --tsconfig ./tsconfig.json` — zero errors | ⬜ | |
| TH.6.2 | `npx eslint src/` — zero warnings | ⬜ | |
| TH.6.3 | `npx vitest run` — all tests pass | ⬜ | |
| TH.6.4 | `cd src-tauri && cargo check && cargo test && cargo clippy` — clean | ⬜ | |
| TH.6.5 | Manual smoke test: switch all three options, verify light/dark renders correctly, verify "Match system" follows OS theme live. | ⬜ | |

---

## Exit Criteria

- [ ] `ThemePreference` persisted and loaded correctly across app restarts.
- [ ] "Match system" follows the OS theme at launch and updates live without restart.
- [ ] Light and dark modes render all screens without any dark-only Tailwind color leaking into light mode.
- [ ] Selecting a theme in Settings takes effect immediately with no page reload.
- [ ] All new code covered by tests (ThemeControl rendering + interaction, store theme state, Rust repo persistence).
- [ ] All checklist sensors green.

---

## Steering Log (this feature only)

| Date | What changed | Why |
|---|---|---|
| 2026-04-28 | Created stub status file | Feature captured for future planning |
| 2026-04-30 | Full plan written — 6 phases, 30 tasks | Planning session |
