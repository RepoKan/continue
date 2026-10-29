---
title: K Knowledge Supporting Environment RCA
description: Records the causes, corrections, verification evidence, and publication limits of the K Knowledge Supporting cloud setup gaps.
---

# K Knowledge Supporting Environment RCA

- Status: Confirmed findings with explicit open items
- Last verified: 2026-10-29
- Commit: `89b8447bc159c334e729c52b843ec2085bfc32ba` (source baseline)
- Scope: Repository selection, shell toolchains, governance entry files, and development environment readiness

## Question

Why did the cloud workspace report missing project governance and use unexpected
runtime versions after the repository and JDK setup changed?

## Finding

The gaps came from configuration and instruction drift across separate setup
surfaces. They were not evidence of a compiler failure or missing repository
write permission.

| Gap                                                          | Confirmed cause                                                                                                                                                           | Correction                                                                                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startup guidance described a different repository            | Repository membership was changed separately from the saved startup instructions. The old instructions retained the former checkout path and its test commands.           | Make `RepoKan/continue` the sole workspace repository and update the complete startup instructions together.                                                              |
| Shell selected Node 24 and Java 21                           | Installing Node 20.20.1 and JDK 24.0.2 did not put their executable directories before the system runtimes on `PATH`. Bash also returned early for noninteractive shells. | Initialize toolchain paths before that return and provide explicit exports in startup instructions.                                                                       |
| Expected governance files were absent                        | Agent skill instructions referenced canonical paths absent from the baseline tree and the Git history and branch snapshots inspected during setup.                        | Add a public-safe governance baseline derived from existing project-owned skills and rules. These are new documents; no deletion or original policy text was established. |
| Saved setup was described as though it were active           | Draft saving, filesystem preparation, environment publication, and validation after restoration are separate operations.                                                  | Record each operation separately and require confirmed publication and a new-instance check before claiming restoration.                                                  |
| GitHub access was confused with a ChatGPT Project attachment | Repository permissions and local checkout access do not establish host Project membership.                                                                                | Report verified repository access separately; verify any Project attachment through the host UI.                                                                          |

## Evidence

- `.node-version` and `.nvmrc` pin Node.js `20.20.1`.
- `extensions/intellij/gradle/wrapper/gradle-wrapper.properties` pins Gradle
  `8.14.3`; `extensions/intellij/build.gradle.kts` declares a JVM 17 compilation
  toolchain. Running Gradle on JDK 24 does not change that compilation target.
- The initial clean checkout and local history contained none of the five
  expected governance entry paths. The remote branch snapshots and historical
  revisions checked during setup also returned no copies. This supports absence
  in the inspected sources, not a claim that the files never existed elsewhere.
- Existing K Knowledge Support skills and
  `.continue/rules/payment-production-governance.md` provide the evidence and
  change-control basis for the new governance documents.
- The current Bash login shell resolves Node `20.20.1` and `javac 24.0.2` after
  toolchain activation.

## Constraints and decisions

- Keep the workspace scoped to `RepoKan/continue` and use a feature branch.
- Keep dependency declarations, lockfiles, application behavior, and telemetry
  behavior unchanged for this correction.
- Install committed dependencies with `npm ci`; build shared packages in their
  dependency order before building the CLI.
- Preserve the existing JVM 17 compilation target for IntelliJ while using
  JDK 24.0.2 to run the supported Gradle wrapper.
- The governance documents are a newly authored baseline for review, not
  recovered copies of a previously approved policy.
- Keep credentials, private network details, host configuration, raw logs, and
  customer or payment data out of this public record.

## Verification

The following results were recorded during the setup correction on the source
baseline above. They are local results, not GitHub CI or Production certification.

- `npm ci` at the repository root — Passed.
- `npm ci` and `npm run build` in `packages/config-types`, `packages/fetch`,
  `packages/llm-info`, `packages/terminal-security`, `packages/config-yaml`,
  `packages/openai-adapters`, and `core` — Passed.
- `npm ci` in `extensions/cli`, including its build lifecycle — Passed.
- `npm run typecheck` in `extensions/cli` — Passed.
- `npm test` in `extensions/cli` — Passed: 1,688 tests; 29 skipped.
- `./gradlew --no-daemon test` in `extensions/intellij` on JDK 24.0.2 — Passed:
  53 tests in seven suites, no failures, errors, or skips; 14 Gradle tasks executed.
  Persisted XML results were inspected after the successful run.
- Prettier checks on the five new governance entry files — Passed.
- `bash -lc 'node --version; javac -version'` — Passed: Node `20.20.1`,
  `javac 24.0.2`.

The original Gradle session lost its execution connection and had no persisted
test result. That attempt was not counted as a pass. A subsequent completed run
provided the result above.

## Open items

- Cloud publication is performed through the product's environment settings.
  Saving a draft does not publish it; validate checkout scope, runtime versions,
  and startup after a published snapshot is restored.
- ChatGPT Project attachment remains unverified because the available tools do
  not expose a Project attachment action.
- Android Emulator execution needs a host with KVM or an approved device service.
  This repository contains a Kotlin IntelliJ plugin, not an Android application;
  the prior Compose template check does not establish Android product readiness.
- Legacy Gradle and Kotlin deprecation warnings remain in the existing project.
  The successful local test run does not establish compatibility with a future
  Gradle major version or coverage of IDE UI and physical-device journeys.
