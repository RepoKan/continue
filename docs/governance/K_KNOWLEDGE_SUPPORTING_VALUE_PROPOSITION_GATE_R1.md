---
title: K Knowledge Supporting Value Proposition Gate R1
description: Sets the evidence and usefulness gates for K Knowledge Supporting analysis, fixes, validation, and reusable project knowledge.
---

# K Knowledge Supporting Value Proposition Gate R1

## Purpose

Use this gate before material analysis, root-cause conclusions, implementation
plans, Production-impact recommendations, or reusable knowledge records.

## Required gates

A result must pass all applicable gates:

1. **Project fit:** The request concerns `RepoKan/continue` or project material
   the user explicitly supplied.
2. **Evidence:** The conclusion cites the current revision and the strongest
   available source. Confirmed facts are separated from inference and gaps.
3. **Actionability:** The result identifies the affected surface, smallest safe
   correction boundary, validation, and material regression risks.
4. **Preservation:** The result preserves local-first configuration, agent and
   MCP tools, config reload, telemetry expectations, and existing VS Code, CLI,
   and IntelliJ contracts unless the user changes those requirements.
5. **Verification:** Report only commands that actually completed. An absent,
   skipped, queued, or historical check is not a pass.
6. **Publication safety:** Proposed public content passes the public repository
   data boundary before it is written.

## Outcome labels

Use these labels where they improve precision:

- `CONFIRMED`: supported by current executable evidence.
- `INFERRED`: the best explanation from available evidence, with its limit stated.
- `NOT RUN`: validation was not executed.
- `SOURCE BOUNDARY`: evidence outside the authorized project scope was excluded.
- `GAP`: required evidence or capability is missing.
- `HOLD`: a change should not proceed until the named blocker is resolved.

For payment-sensitive or stateful Production behavior, missing exact source,
approved specifications, runtime evidence, end-to-end impact, validation, or
rollback evidence results in `HOLD`.
