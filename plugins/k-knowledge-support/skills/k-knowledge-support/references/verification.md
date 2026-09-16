# Verification guide

Run commands from the owning package. Reuse installed dependencies when present; do not perform a broad install, dependency upgrade, or lockfile rewrite merely to answer a question.

## Baseline

- Node: `20.20.1` from `.node-version` and `.nvmrc`
- TypeScript modules: use the script declared by that module's `package.json`
- Tests: prefer focused Vitest coverage for new work where the existing area permits it
- Existing Jest tests remain Jest unless the requested change includes migration

## Checks by area

| Changed area                   | Focused test                                                        | Static/build check                                                   |
| ------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `core/` Vitest (`*.vitest.ts`) | `cd core && npm run vitest -- path/to/file.vitest.ts`               | `cd core && npm run tsc:check`                                       |
| `core/` Jest (`*.test.ts`)     | `cd core && npm test -- path/to/file.test.ts`                       | `cd core && npm run lint` when appropriate                           |
| `gui/`                         | `cd gui && npm test -- path/to/file.test.tsx`                       | `cd gui && npm run tsc:check`                                        |
| `extensions/cli/`              | `cd extensions/cli && npm test -- path/to/file.test.ts`             | `cd extensions/cli && npm run typecheck`                             |
| `extensions/vscode/`           | `cd extensions/vscode && npm test -- path/to/file.test.ts`          | `cd extensions/vscode && npm run tsc:check`                          |
| `packages/config-yaml/`        | `cd packages/config-yaml && npm test -- path/to/file.test.ts`       | `cd packages/config-yaml && npm run build`                           |
| `packages/openai-adapters/`    | `cd packages/openai-adapters && npm test -- path/to/file.test.ts`   | `cd packages/openai-adapters && npm run build`                       |
| `packages/fetch/`              | `cd packages/fetch && npm test -- path/to/file.test.ts`             | `cd packages/fetch && npm run build`                                 |
| `packages/terminal-security/`  | `cd packages/terminal-security && npm test -- path/to/file.test.ts` | `cd packages/terminal-security && npm run build`                     |
| `binary/`                      | `cd binary && npm test`                                             | `cd binary && npm run rebuild` only when packaging logic is affected |
| `sync/`                        | `cargo test --manifest-path sync/Cargo.toml`                        | `cargo check --manifest-path sync/Cargo.toml`                        |
| `extensions/intellij/`         | `cd extensions/intellij && ./gradlew test`                          | Use JDK 17, as set by the Gradle JVM toolchain                       |

Confirm the script still exists before running a command because package scripts can drift.

## Selection rules

1. Start with the smallest test file or package covering the changed behavior.
2. Add the module type check or build when types, exports, schemas, or shared contracts changed.
3. Test both sides of a boundary when changing protocol messages, config schemas, shared package exports, or GUI-to-core behavior.
4. Run broad E2E, packaging, IDE downloads, networked provider tests, or release workflows only when the request requires them and their prerequisites are available.
5. Never use production credentials for a test. Prefer mocks, fixtures, or documented test variables.

## Regression-sensitive flows

For changes near onboarding, profiles, configuration, telemetry, tools, MCP, or IDE startup, use `TESTING.md` as a manual regression inventory. Mark each applicable item as executed, not applicable, or blocked.

## Result reporting

Record the exact command, exit status, and meaningful result. Distinguish:

- passed;
- failed because of the change;
- blocked by missing dependencies, credentials, platform, or network;
- not run because it falls outside the change scope.
