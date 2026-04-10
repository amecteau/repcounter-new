Run the full test and check suite:

1. `npx svelte-check --tsconfig ./tsconfig.json`
2. `npx vitest run`
3. `cd src-tauri && cargo check`
4. `cd src-tauri && cargo test`
5. `npx eslint src/ --max-warnings 0`
6. `cd src-tauri && cargo clippy`

Report results as pass/fail with details on any failures.
If everything passes, say "All sensors green ✓"
