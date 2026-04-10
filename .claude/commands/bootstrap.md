Initialize the rep-counter project. Follow these steps in order. Stop and report if any step fails.

## Step 1: Scaffold
```
npm create tauri-app@latest rep-counter -- --template sveltekit-ts
cd rep-counter
```

## Step 2: Install frontend dependencies
```
npm install -D tailwindcss @tailwindcss/vite
npm install -D vitest @testing-library/svelte @testing-library/user-event @testing-library/jest-dom
npm install -D eslint eslint-plugin-svelte prettier prettier-plugin-svelte
```

## Step 3: Configure TypeScript
Set `"strict": true` in tsconfig.json. Ensure `compilerOptions` includes:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

## Step 4: Configure Tailwind
Add `@tailwindcss/vite` to vite.config.ts plugins. Create `src/lib/app.css` with:
```css
@import "tailwindcss";
```
Import it in `src/routes/+layout.svelte`.

## Step 5: Configure Vitest
Add `svelteTesting` plugin to vite.config.ts:
```typescript
import { svelteTesting } from '@testing-library/svelte/vite';
// Add to plugins array: svelteTesting()
```

## Step 6: Configure ESLint
Create eslint.config.js with svelte and typescript support. Include this custom rule:
```javascript
'no-restricted-imports': ['error', {
  patterns: [{
    group: ['**/src-tauri/**'],
    message: 'Frontend code must not import from src-tauri/. Use a service in your feature folder to wrap Tauri commands.'
  }]
}]
```

## Step 7: Create feature folder structure
```
mkdir -p src/lib/features/counter/components
mkdir -p src/lib/features/exercises/components
mkdir -p src/lib/features/history/components
mkdir -p src/lib/features/settings/components
mkdir -p src/lib/shared/components
mkdir -p src/lib/shared/types
mkdir -p src/lib/shared/utils
mkdir -p src-tauri/src/commands
mkdir -p src-tauri/src/models
mkdir -p src-tauri/src/repo
mkdir -p src-tauri/src/db
mkdir -p tests/fixtures
mkdir -p docs
```

## Step 8: Create shared type files
Create the TypeScript type files in `src/lib/shared/types/` matching the data model in AGENTS.md:
- exercise.ts (Exercise, MuscleGroup)
- workout.ts (WorkoutSet, Workout, WeightUnit)
- settings.ts (UserSettings, FontScale, FONT_SCALE_VALUES)
- common.ts (ServiceResult<T>)

## Step 9: Create Rust module structure
Create mod.rs files in commands/, models/, repo/, db/ so they compile.
Create the Rust model structs in models/ matching the TypeScript types with `#[serde(rename_all = "camelCase")]`.

## Step 10: Enable Rust test feature
In src-tauri/Cargo.toml, ensure tauri has the "test" feature enabled.
Add `rusqlite` and `serde_json` as dependencies.

## Step 11: Create database schema
In src-tauri/src/db/mod.rs, create an `initialize_db` function that creates the SQLite tables:
- workouts (id TEXT PRIMARY KEY, date TEXT NOT NULL, duration_minutes INTEGER)
- sets (id TEXT PRIMARY KEY, workout_id TEXT NOT NULL, exercise_id TEXT NOT NULL, reps INTEGER NOT NULL, weight REAL, unit TEXT NOT NULL, timestamp TEXT NOT NULL, notes TEXT DEFAULT '')
- custom_exercises (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, muscle_group TEXT NOT NULL)
- settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)

## Step 12: Write first tests
- A serialization test in Rust: verify WorkoutSet serializes to camelCase JSON
- A schema test in Rust: verify initialize_db runs without error on in-memory DB
- A TypeScript test: verify a shared type can be imported (smoke test for the build)

## Step 13: Run all sensors
```
npx svelte-check --tsconfig ./tsconfig.json
npx eslint src/
npx vitest run
cd src-tauri && cargo check
cd src-tauri && cargo test
cd src-tauri && cargo clippy
```
All must pass. Fix anything that fails before reporting.

## Step 14: Copy harness files
- Copy CLAUDE.md to repo root
- Copy AGENTS.md to .claude/AGENTS.md
- Copy settings.json to .claude/settings.json
- Copy commands/ to .claude/commands/
- Copy ui-spec.md and project-status.md to docs/

## Step 15: Report
Tell me what succeeded, what failed, and what the project looks like. Then update docs/project-status.md to mark all Phase 1 tasks that are complete.
