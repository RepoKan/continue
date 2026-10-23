---
name: Test Coverage
description: Ensure new functionality includes corresponding tests
---

# Test Coverage Check

Review this pull request to determine if new functionality has adequate test coverage.

## When Tests Are Expected

1. **New exported functions or classes** - Any new public function, class, or module that is exported and used by other parts of the codebase should have at least basic unit tests covering:

   - The happy path (expected inputs produce expected outputs)
   - Edge cases (empty inputs, null/undefined, boundary values)
   - Error cases (invalid inputs throw or return appropriate errors)

2. **New CLI commands or subcommands** - Should have:

   - Smoke tests verifying the command registers and runs
   - Tests for flag parsing and validation
   - Tests for expected output format

3. **Bug fixes** - If a PR fixes a bug, there should be a regression test that:

   - Reproduces the original bug condition
   - Verifies the fix resolves it

4. **New API endpoints or handlers** - Should have integration tests covering:
   - Successful request/response
   - Error responses for invalid inputs
   - Authentication/authorization (if applicable)

## Applicability and Review Output — GOV-007, GOV-011, GOV-016, GOV-023

Do not waive validation by file extension. First decide whether the changed behavior needs a test. Documentation or styling that cannot affect behavior may be `NOT APPLICABLE`; configuration, dependency manifests, workflows, rules, and agent definitions require impact/activation review when they can alter selection, permissions, install state, runtime behavior, or CI. Select the validation from the owning package's scripts and configuration, not a repository-wide filename suffix assumption.

During review, report findings only; do not write tests or mutate the PR. For each coverage gap, identify the behavior and a focused positive, boundary, or failure case. An implementation request may add the tests in a separate authorized implementation step.

## Test Infrastructure Reference

Core uses Jest and Vitest; GUI and CLI commonly use Vitest. Package scripts and test configuration are authoritative for a particular path. Treat suffix examples as local conventions only, not as proof that a file is discovered or executed.
