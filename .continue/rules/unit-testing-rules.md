---
name: Unit Testing Rules
description: Guidelines for unit testing in this project
alwaysApply: false
---

For testing decisions, follow GOV-007 and GOV-011 in `.continue/rules/engineering-governance.md`. This file records project-specific test conventions only; it does not independently waive tests or define merge readiness.

## Testing frameworks

The project uses Vitest and Jest. Use the framework selected by the owning package's scripts and configuration. Do not introduce a repository-wide framework preference that conflicts with a package's established setup.

## Test execution location

Run tests from within the specific package directory (e.g., `cd core && ..`).

## Local test discovery examples

- Core includes Vitest files named `*.vitest.ts`; GUI and CLI also use Vitest files named `*.test.ts`. These are local examples, not universal discovery rules. Check the package config before adding or running a test.
- Run tests using the package's configured command from its owning directory:
  ```bash
  cd [package] && npm run [configured-test-script] -- [test file]
  ```

## Jest tests

- Core uses Jest for files selected by its Jest configuration, including `*.test.ts`.
- Run tests using the package's configured Jest command:
  ```bash
  cd core && npm test -- [test file]
  ```
- The test script uses experimental VM modules via NODE_OPTIONS flag

## Test structure

- Follow the neighboring tests and the owning framework's conventions for `test()` and `describe()` blocks.
- Name tests for the behavior and boundary they verify.
