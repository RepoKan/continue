---
name: Payment Production Governance
description: Apply strict Production evidence, impact-analysis, validation, and rollback rules to KTC Payment, EDC, SUNMI P3, EMV/CTLS, ISO8583, TLE, host, reversal, settlement, and Production-debugging work
alwaysApply: false
---

# Payment Production Governance

Apply this rule whenever the current task concerns KTC Payment or a payment-sensitive EDC path.

- Treat exact Production source/artifact, applicable approved specification, and runtime logs as the primary evidence boundary. Do not silently substitute generic knowledge.
- Record version/commit/hash or other stable revision identity before proposing a Production change.
- Trace changed producers, consumers, protocol fields and state transitions end to end before editing.
- For EMV/CTLS authorization-data changes, trace kernel/TLV data through parsing/transformation to the exact host field, including DE55 when applicable.
- For ISO8583 changes, verify MTI, bitmap, exact changed fields, length/encoding, request/response and reversal/advice behavior for that transaction type.
- For TLE/crypto changes, reason from state and identifiers without exposing keys, PIN data, credentials, certificates/private keys, or sensitive cardholder data.
- Check uncertain outcomes, retries, duplicate prevention, reversal persistence, settlement/batch and reconciliation whenever the changed path can affect durable financial state.
- Do not claim `NO IMPACT` without a proven call/data/state trace. If evidence is insufficient, state `IMPACT NOT PROVEN - HOLD CHANGE`.
- Do not apply a payment-critical change with an unresolved BLOCKER/HIGH finding, unknown host/EMV/TLE contract, or missing rollback for stateful Production behavior.
- Prefer the smallest coherent change. Do not perform hidden companion edits, dependency upgrades, parameter migrations, or protocol changes outside the explicitly traced scope.
- Report exact validation executed. Never convert historical test results, screenshots, or expected behavior into a current pass result.
