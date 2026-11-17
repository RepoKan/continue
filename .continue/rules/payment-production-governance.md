---
name: Payment Production Governance
description: Apply strict Production evidence, impact-analysis, validation, and rollback rules to KTC Payment, EDC, SUNMI P3, EMV/CTLS, ISO8583, TLE, host, reversal, settlement, and Production-debugging work
alwaysApply: true
---

# Payment Production Governance

This rule is loaded globally so the selector cannot silently omit it. Apply its domain checks only when the task concerns KTC Payment or a payment-sensitive EDC path; otherwise do not add payment tests or gates. Follow GOV-005, GOV-006, GOV-008, GOV-014, GOV-015, GOV-016, GOV-018, and GOV-021 in `.continue/rules/engineering-governance.md` for shared authority, evidence, readiness, review, and recovery requirements.

- Use exact Production source/artifact, applicable approved specification, and runtime logs; generic knowledge cannot fill a missing contract.
- For EMV/CTLS authorization-data changes, trace kernel/TLV data through parsing/transformation to the exact host field, including DE55 when applicable.
- For ISO8583 changes, verify MTI, bitmap, exact changed fields, length/encoding, request/response and reversal/advice behavior for that transaction type.
- For TLE/crypto changes, reason from state and identifiers without exposing keys, PIN data, credentials, certificates/private keys, or sensitive cardholder data.
- When affected state is durable, trace uncertain outcomes, retries, duplicate prevention, reversal persistence, settlement/batch, and reconciliation.
- A missing call/data/state trace cannot support `NO IMPACT`. Record the unproven path and hold the affected gate.
- Do not approve a payment-critical change with unresolved critical findings, an unknown host/EMV/TLE contract, or no safe recovery path for stateful Production behavior. Risk exceptions must satisfy GOV-027 and cannot fabricate a contract.
