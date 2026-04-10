Review the current changes against our conventions:

1. Run `npx svelte-check --tsconfig ./tsconfig.json` and report any type errors
2. Run `npx eslint src/` and report violations
3. Run `npx vitest run` and report test results
4. Run `cd src-tauri && cargo check` and report errors
5. Run `cd src-tauri && cargo test` and report test results
6. Run `cd src-tauri && cargo clippy` and report warnings
7. Check that no business logic exists in +page.svelte files
8. Check that no feature imports from another feature
9. Check that all stores and services have corresponding test files
10. Check that all components with interactive elements have interaction tests
11. Check that no `any` types exist in the codebase
12. Check that no `px` units are used for layout sizing
13. Verify imports don't cross the frontend/backend boundary incorrectly

Summarize findings as pass/fail with details on any failures.
