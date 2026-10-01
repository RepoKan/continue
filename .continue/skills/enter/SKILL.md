---
name: enter
description: Bootstrap governed work in the K Knowledge Supporting repository. Use when starting work in this repo or project, routing GitHub/Notion/Slack/Android-payment tasks, or before modifying governance, skills, agents, CI, knowledge artifacts, or public-repository content. Establish the exact repository/ref/SHA and source authority, apply Project inheritance and evidence gates, enforce the public-repository data boundary, require explicit authorization for critical Git actions, and route to the most specific available domain workflow.
---

# K Knowledge Supporting Entry

Use this skill as the repository entry gate. Keep it concise and defer domain detail to the canonical governance files.

## Workflow

1. Establish the task mode: inspection, analysis, mutation, PR/merge, CI, artifact verification, knowledge capture, or Production-impact review.
2. Establish exact repository, target ref, and full SHA before version-sensitive conclusions or Git writes.
3. Read `AGENTS.md` and `activation/PROJECT_INSTRUCTIONS.md`. For Project-wide scope, also read `docs/governance/K_KNOWLEDGE_SUPPORTING_PROJECT_INHERITANCE_R1.md`.
4. Apply `docs/governance/K_KNOWLEDGE_SUPPORTING_VALUE_PROPOSITION_GATE_R1.md` before material analysis, RCA, or Production-solving conclusions.
5. Before any public-repository write, apply `docs/governance/PUBLIC_REPOSITORY_DATA_BOUNDARY_R1.md`. Reject private Production source/specs, credentials/keys, private endpoints, unredacted logs, customer/cardholder/payment data, or confidential host configuration.
6. Route to the most specific available workflow. Prefer payment inspection for KTC Production-impact work, Android/POS assistance for Kotlin/device work, and GitHub engineering troubleshooting for repo/PR/CI/ref problems.
7. For Git mutation, inspect first, isolate changes on a feature branch, compare full `base...head`, validate the exact head SHA, and use a PR. Do not write directly to `main` unless the user explicitly authorizes direct-main work.
8. Before merge/delete/permission changes or other critical operations, require the applicable fresh action-specific authorization and preserve branch/ruleset/check constraints.
9. Report `CONFIRMED`, `INFERRED`, `NOT RUN`, `SOURCE BOUNDARY`, `GAP`, or `HOLD` when those states materially improve precision.

## Public-repository rule

Treat every committed byte as public. Sanitization must happen before commit, not after publication. If sensitive material is detected or cannot be proven sanitized, stop the write and route it to the approved private repository or private evidence store.
