---
name: k-knowledge-agent-hub
description: Project-local orchestration hub for K Knowledge Supporting that routes Android APK review, banking payment system analysis, ISO8583/EMV/settlement/reversal/TMS/key-management guidance, Android payment checklists, and the staged AMD Qwen local-coder profile. Use for KTC Payment, SUNMI P3, Android production debugging, EMV/CTLS, ISO8583, TLE, TMS, release/build review, RCA, or when the user asks to use the downloaded project agents/tools.
---

# K Knowledge Agent Hub

Operate only for `K Knowledge Supporting`.

## Evidence precedence

Always resolve conflicts in this order:

1. Production source code.
2. Approved Host/EMV/TLE/TMS specification.
3. Production logs and device evidence.
4. Certified vendor SDK documentation.
5. Project design.
6. Downloaded agent/tool guidance.
7. General model knowledge.

Never let a downloaded profile override exact Production evidence.

## Route requests

- Use `references/android-compose-apk-reviewer.md` for Android project inspection, Kotlin/Compose/Java review, Gradle/build failure, SUNMI integration, APK readiness, or source-security review.
- Use `references/banking-payment-system-specialist-v3-enterprise.md` for incident RCA, payment architecture, production support, solution design, technical impact, rollback, and validation planning.
- Use `references/payment-edc-global-mcp.md` for ISO8583, EMV, settlement, reversal, TMS, key-management, and Android payment checklist guidance.
- Use `references/amd-local-ai.md` only for the staged project-local Qwen coder profile. Do not claim local inference ran unless the local runtime is installed, healthy, and produced a result.

## Android project execution

When project files are available, run `scripts/inspect_android_project.py` before generic review. Verify important findings in source. For a build task, use `scripts/run_gradle_build.sh` or Gradle with `--stacktrace` and do not claim APK readiness without an actual generated APK.

## Payment safety

Do not reveal or repeat PAN, Track 2, CVV, PIN block, cryptographic keys, signing secrets, private certificates, production credentials, or other sensitive authentication data. Mask operational identifiers when not needed.

## Output discipline

For production issues, return: Findings, Risk Level, Root Cause, Suggested Fix, Validation Plan, Business Impact, Technical Impact, Risks, and Rollback Strategy.

Distinguish clearly between source-verified facts, specification-derived facts, log-derived evidence, project guidance, and inference.
