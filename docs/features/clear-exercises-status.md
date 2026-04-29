# Feature: Clear Custom Exercises — Status

> **Per-feature status file.** Tracks the Clear Custom Exercises setting in detail.
> The top-level [docs/project-status.md](../project-status.md) lists this feature in its "Features" section and points here.
> Update this file after completing each task. Do not batch updates.

---

## Goal

Add a "Clear Custom Exercises" action to the Settings screen that permanently deletes all user-defined exercises. A confirmation dialog must be shown before deletion.

## Constraint

A custom exercise **cannot** be removed if it appears in any workout history. The action must be blocked (or scoped to only unused exercises) until history is cleared. This dependency couples this feature to the Clear History feature.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked (see notes)
- 🔁 Needs rework (see notes)

## Current State

**Current phase**: Not planned. Awaiting design/planning session.

---

## Reference Documents

- UI mockup: [docs/ui-spec.md](../ui-spec.md)
- Architecture: [.claude/AGENTS.md](../../.claude/AGENTS.md)
- Related feature: [features/clear-history-status.md](clear-history-status.md)

---

## Phases

> To be defined in a planning session.

---

## Steering Log (this feature only)

| Date | What changed | Why |
|---|---|---|
| 2026-04-28 | Created stub status file | Feature captured for future planning |
