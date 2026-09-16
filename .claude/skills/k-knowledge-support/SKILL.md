---
name: k-knowledge-support
description: Inspect, explain, diagnose, review, test, or safely change the K Knowledge Support Continue fork using project-local evidence. Use for architecture tracing, bug investigation, implementation planning, code changes, production-sensitive payment analysis, and knowledge capture in this repository; do not use for unrelated projects.
---

# K Knowledge Support

Support work on this Continue fork with conclusions grounded in the current checkout.

Explicit instructions in the user's current request override this skill's general workflow guidance unless they conflict with higher-priority safety or authorization controls.

## Project boundary

- Treat the current repository and materials the user explicitly supplies for K Knowledge Support as the available project knowledge.
- When no local checkout is available, use the connected GitHub tools only for `RepoKan/continue` and the ref relevant to the request. Default to `main` only when the user provides no ref.
- Do not search external services, other projects, global conversation history, or connected accounts unless the user explicitly requests that source for the current task.
- Do not upload, publish, send, or copy project content outside the current workspace without explicit authorization.
- Never reveal credential values, tokens, private endpoints, customer data, or full sensitive logs. Refer to secret names and redact values.
- Keep inspection read-only. Diagnose and explain without editing unless the user asks for a change. When a change is requested, modify only the necessary scope.

## Establish evidence

If the necessary target, symptom, desired outcome, or repository ref is missing or ambiguous, ask one focused question and wait instead of guessing.

1. Locate the repository root and inspect `git status` before editing. Preserve unrelated work.
   If the project is available only through GitHub tools, verify the repository, default branch, requested ref, and write permission before any mutation.
2. Read every applicable `AGENTS.md` and the relevant files under `.continue/rules/` before changing code in their scope.
3. Identify the owning module, entry point, callers, data flow, configuration, and nearby tests. Use `rg` and targeted file reads instead of assuming names or behavior.
4. Prefer evidence in this order: executable code and tests, checked-in configuration, maintained project documentation, then clearly labeled inference.
5. Check the current commit before relying on the inspected baseline in [references/project-map.md](references/project-map.md).

Read only the reference needed for the task:

- For ownership, module boundaries, skill discovery, or fork invariants, read [references/project-map.md](references/project-map.md).
- Before changing or testing code, read [references/verification.md](references/verification.md).
- For KTC Payment, EDC, SUNMI P3, EMV/CTLS, ISO8583, TLE, TMS/RKI, host, reversal, settlement, location-in-transaction, or Production debugging work, read [references/payment-production.md](references/payment-production.md) before reaching a conclusion or proposing a change.
- When the user requests a reusable project note, decision record, or handoff, read [references/knowledge-record.md](references/knowledge-record.md).

## Payment-critical routing

When payment scope is active, treat the exact Production source/spec/log and the applicable approved vendor or host documentation as the evidence boundary. Do not generalize a field, message type, kernel behavior, key flow, or recovery path from another transaction without evidence. If required Production evidence is missing, label the gap and hold the change rather than guessing.

For changes that can affect transaction outcome, card data, kernel data, ISO8583 payloads, TLE/session state, reversal, settlement, or host reconciliation, require an end-to-end impact trace plus validation and rollback evidence before declaring the change safe.

## Analyze the request

Trace behavior end to end across boundaries when necessary: UI or command entry, message or protocol layer, core logic, provider or persistence layer, and returned state. Search for both producers and consumers of changed types, messages, configuration keys, and serialized fields.

For a defect, report:

- the observed failure and affected surface;
- the confirmed root cause, or the leading hypothesis with missing evidence;
- the smallest safe correction boundary;
- regression risks and the verification needed.

For an architecture or explanation request, answer from the current implementation and name the relevant paths and symbols. Separate confirmed behavior from intended behavior described only in documentation.

## Preserve fork behavior

Unless the user explicitly changes these requirements, preserve the local-first baseline documented by the repository:

- local profiles and local configuration remain usable without Hub sign-in;
- no PostHog or Sentry network traffic is introduced;
- model configuration, MCP servers, agent tools, and config reload continue to work;
- existing VS Code, CLI, and IntelliJ integration contracts remain compatible;
- the repository's Node baseline remains `20.20.1`.

Do not add authentication, telemetry, remote synchronization, a dependency upgrade, a lockfile rewrite, packaging, publishing, or release changes as incidental work.

## Make requested changes

- Implement the smallest coherent fix and keep public contracts stable unless the request requires a contract change.
- Follow existing patterns in the owning module; do not create a new abstraction only to wrap one call.
- Update all producers, consumers, schemas, protocol types, and tests when a shared contract changes.
- Add focused regression coverage for changed behavior. Add normal, edge, and boundary cases for a new pure function.
- Run the narrowest meaningful checks first, then the owning module's type check or build when justified.
- Do not claim a check passed unless its command completed successfully. If a check cannot run, state the exact blocker and what remains unverified.

## Communicate results

Lead with the answer or completed outcome. Cite repository-relative paths and relevant symbols. Keep the distinction between confirmed facts, inference, and open questions explicit. For changes, summarize modified files, behavioral impact, tests run, and remaining risk; do not bury failures or untested areas.
