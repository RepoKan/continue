# K Knowledge Supporting — Android Application Development Environment

- Status: Confirmed project-environment record with time-bounded compatibility observations
- Last verified: 2026-09-29
- Commit: `RepoKan/continue` `main@eca9fde907c447d4a4ecaf5fd13d9ed1da2faf12` (source baseline before this record)
- Scope: Kotlin/Android, Compose Multiplatform, Room KMP, KSP, permissions, SUNMI/POS/EDC, CI, skills, agents, plugins, knowledge synchronization, and weekly review governance

## Question

What reusable Android application development environment should K Knowledge Supporting load, maintain, and review across GitHub, Notion, and the K Knowledge Supporting Library?

## Finding

K Knowledge Supporting should treat Android application support as a governed capability set rather than a single toolchain note. It combines build compatibility, shared UI and data behavior, device/payment integration, evidence-first diagnosis, and controlled knowledge synchronization.

The versions below are not a blanket upgrade mandate. They summarize the latest compatibility conclusions captured in this conversation through 2026-09-14. Re-check official sources and the actual project revision before changing a build.

## Capability and routing register

| Capability                         | Primary route                                            | Use when                                                                                                           | Boundary                                                                    |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Project inspection and safe change | `k-knowledge-support`                                    | Architecture tracing, diagnosis, implementation, testing, and reusable knowledge capture in `RepoKan/continue`     | Current source and tests outrank derived notes                              |
| Android/Compose/APK readiness      | Android Compose APK Reviewer                             | Kotlin/Compose or mixed Java projects, Gradle failures, APK readiness, Sunmi integration, and configuration review | Never claim APK readiness without a produced APK                            |
| Payment and Production analysis    | `ktc-payment-inspector` plus the payment-production gate | SUNMI P3, EMV/CTLS, ISO8583, TLE, reversal, settlement, host, and transaction-location behavior                    | Missing exact source/spec/runtime evidence means `HOLD - IMPACT NOT PROVEN` |
| System-specialist output           | Banking Payment System Specialist V3 Enterprise          | RCA, business/technical impact, developer tasks, validation, rollback, and prevention                              | Separate confirmed cause from ranked hypotheses                             |
| MCP support                        | PAYMENT EDC Global MCP                                   | Project-local payment/POS/EDC assistant integration                                                                | Transport/configuration is not factual authority                            |
| Local AI                           | Project-local AMD/Lemonade profile where available       | Bounded local coding and retrieval tasks                                                                           | Verify live model catalog; do not silently substitute models                |
| Connected knowledge                | Notion, GitHub, and ChatGPT Library connectors           | Search, preserve, and synchronize governed records                                                                 | Connector access does not expand permissions or source authority            |

## Android and Compose Multiplatform toolchain gates

| Area                  | Recorded compatibility conclusion                                                                                                                                                  | Required action before adoption                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Kotlin                | Kotlin 2.4.20 was the stable controlled-migration candidate in the 2026-09-14 review. Kotlin 2.2.20–2.2.21 remained capped at AGP 8.11.1 and Gradle 8.14.                          | Verify the current official Kotlin compatibility matrix and align Kotlin compiler, Compose compiler plugin, and serialization compiler plugin. |
| KSP                   | KSP 2.3.12 requires AGP 8.12.0 or newer. It has no supported overlap with the Kotlin 2.2.x/AGP 8.11.1 ceiling recorded above.                                                      | Upgrade Kotlin, AGP, Gradle, and KSP as one tested set; never move KSP independently.                                                          |
| AGP and Gradle        | The controlled candidate window was AGP 8.12–9.3.1 with Kotlin 2.4.20 and Gradle no newer than 9.7.0. AGP 9.4 was preview-only.                                                    | Use the selected AGP release's required Gradle version and verify the current matrices before editing the wrapper.                             |
| JDK                   | JDK 21 is the project-safe Gradle/CI baseline recorded in the reviews.                                                                                                             | Pin the CI and IDE Gradle JVM. Test newer JDKs in a separate lane only after Gradle and AGP support them.                                      |
| Compose Multiplatform | Keep the production line on a stable Compose release. The 1.13 alpha line was preview-only and carried future minSdk 24 and removed-API implications.                              | Do not adopt a preview solely for freshness; use it only for a reproduced issue and isolate the validation.                                    |
| Room KMP              | Room 2.8.5 makes suspend queries and invalidation operations fail explicitly after `RoomDatabase.close()`.                                                                         | Cancel database-owned collectors/work before close; regenerate and diff schemas after KSP or Room changes.                                     |
| Android-KMP plugin    | Legacy KMP use of `com.android.library` relies on APIs expected to disappear in AGP 10. A KMP module using `com.android.application` requires an Android application module split. | Prepare `androidApp` plus shared KMP library boundaries before AGP 10; treat temporary DSL opt-outs only as migration aids.                    |
| Permissions           | `moko-permissions` 0.20.1 was the last recorded stable release and included an Android activity-leak fix.                                                                          | Validate grant, denial, permanent denial, settings return, lifecycle recreation, and iOS restricted states.                                    |

## Architecture and engineering expectations

- Keep Android application packaging separate from shared Kotlin Multiplatform libraries.
- Keep UI, transaction use cases, SDK/transport adapters, protocol framing, persistence, and host integration separated.
- For Compose, review state hoisting, stability, recomposition, side effects, navigation arguments, lifecycle-aware collection, and main-thread blocking.
- For Kotlin and Java, review null safety, structured concurrency, resource cleanup, lifecycle leaks, exception handling, and incremental migration risk.
- For Room KMP, verify schema export, migrations, drivers, transactions, concurrent access, `Flow` invalidation, close/reopen behavior, and Android/iOS differences.
- For Sunmi or payment work, bind vendor services before use and trace transaction state through success, decline, timeout, unknown outcome, retry, reversal, settlement, and process death.
- Never place credentials, API keys, private endpoints, payment keys, PIN data, unmasked PAN, customer payloads, or unredacted Production logs in synchronized knowledge.

## Dependency-ordered validation sequence

1. Record the current project SHA, version catalog, Gradle wrapper, AGP, Kotlin, Compose, KSP, Room, JDK, Xcode, CocoaPods, and deployment targets.
2. Confirm official compatibility matrices and release status; distinguish stable, beta, RC, EAP, preview, issue-tracker evidence, and inference.
3. Resolve Android module boundaries required by the Android-KMP plugin and AGP 10 migration.
4. Pin JDK and Gradle, then align AGP and Kotlin/KGP.
5. Align the Compose and serialization compiler plugins with Kotlin.
6. Upgrade KSP, then Room and other processors; regenerate and diff generated sources and exported schemas.
7. Keep Compose Multiplatform, permissions, and vendor/payment SDK changes separate unless a verified compatibility requirement forces them together.
8. Run clean, incremental, device, simulator, physical-device, process-recreation, migration, minified, signed, and release-framework checks.

## Focused regression matrix

| Surface                  | Minimum evidence                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build and CI             | Clean Android assemble; warm rebuild; configuration/build cache; KSP regeneration; iOS simulator link; `iosArm64` release link; pinned Gradle JVM                               |
| Android device           | Install and upgrade; minimum supported API; lifecycle recreation; Room queries/transactions; resources; minified APK/AAB smoke test                                             |
| iOS simulator and device | Fresh database and migrations; DAO `Flow`; background/foreground; text input; accessibility; navigation; resources; release XCFramework; CocoaPods or SwiftPM integration       |
| Compose UI               | Cross-module composables; default parameters; state restoration; focus; dialogs/popups; navigation transitions; Android accessibility and iOS VoiceOver/Dynamic Type            |
| Permissions              | Grant; deny; permanent deny; restricted state; settings return; process recreation; foreground/background transitions                                                           |
| Payment/POS              | SDK binding; approved/declined paths; timeout and uncertain outcome; duplicate prevention; reversal/advice; settlement continuity; printer/slip output; sensitive-log redaction |

## Weekly review specification

The CMP Toolchain Review should run weekly and report only meaningful deltas. Each run should:

1. Review official release notes, compatibility matrices, deprecations, migration guidance, and known regressions for Kotlin/KGP, Compose Multiplatform, KSP, Room KMP, AGP, Gradle, JDK, Coroutines, serialization, moko-permissions, Xcode, CocoaPods, and Kotlin/Native.
2. Inspect the K Knowledge Supporting environment inventory: active project skills, agent contracts, plugins/connectors, MCP configurations, model/tool availability, mirror integrity, and CI/verification capabilities.
3. Compare GitHub, Notion, and Library records for provenance, revision drift, missing mirrors, stale links, and confidentiality violations.
4. State compatibility impact for Android builds, iOS builds, shared UI, shared data, permissions, payment/device integration, and CI.
5. Separate mandatory action, recommended validation, optional preview evaluation, and no meaningful change.
6. Produce a dependency-ordered sequence, a focused regression matrix, and only a few developer-review questions.
7. Do not mutate repositories, skills, plugins, schedules, permissions, Production settings, or payment behavior during the review. Propose an exact synchronization diff for separate authorized execution.

## Constraints and decisions

- Reusable facts must remain traceable to source identity, version/date, and authority status.
- Official vendor/project sources outrank issue commentary and derived summaries.
- Preview releases do not justify production upgrades unless they resolve a reproduced, relevant defect.
- GitHub skill changes must keep `.continue`, `.claude`, and packaged plugin mirrors byte-aligned.
- Kotlin/Android RCA Git commits, pushes, and merges require explicit scope. Critical payment, security, destructive, permission, and Production-governance actions retain fresh approval.
- The weekly automation's cadence or management configuration must not change without its separate management validation.

## Verification

- GitHub repository, default branch, current head, and write permission — Confirmed before synchronization
- Existing Notion KKS master and Android development record — Fetched before update
- Existing Library record with the same title — Not found; create a new durable record
- CMP Toolchain Review prompt scope — Updated to include the KKS environment audit; cadence, time zone, timing mode, title, and enabled state unchanged
- Android project build or device tests — Not run; this is an environment/knowledge synchronization record, not a source-code release

## Open items

- Re-verify the live toolchain matrices at the next scheduled review before recommending any upgrade.
- Confirm the actual Android/CMP repository's current version catalog and module topology when source access is available.
- Monitor the next weekly run for correct source coverage, mirror checks, confidentiality handling, and concise delta-only reporting.
