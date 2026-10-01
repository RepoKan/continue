# Review Output Contract

Use this structure for every completed review.

# KTC Payment Change Review

## Executive summary

State what changed, what was verified, the most important risk, and the final verdict.

## Inspection identity

Include:

- repository / source package
- base SHA or source identity
- head SHA or patch identity
- Knowledge Master SHA when available
- applicable specification revision
- runtime evidence identity when used

## Findings

For each finding include:

### [Severity] Finding title

- Finding: concise defect or confirmation
- Evidence and authority: exact source path/line/function plus authority level
- Current behavior: what the inspected revision does
- Expected behavior: requirement supported by evidence
- Impact chain: callers/callees/state/SDK/ISO8583/host/persistence/reversal/settlement as applicable
- Risk: financial, functional, operational, compliance, or regression impact
- Proposed fix: include only when justified by evidence

Use severity values: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`.

## Validation matrix

Use a table with:

| Case | Setup | Expected result | Evidence needed |
| ---- | ----- | --------------- | --------------- |

Include boundary, null, timeout, retry, callback, and transaction-lifecycle cases appropriate to the change.

## Rollback

State the minimum safe rollback path and any data/config compatibility concerns.

## Evidence gaps

List unresolved Production facts. Explicitly say when a gap blocks application.

## Final verdict

Return exactly one:

- `READY TO APPLY`
- `HOLD - IMPACT NOT PROVEN`
- `BLOCK - BUSINESS RULE VIOLATION`
- `NO CHANGE REQUIRED`

Do not use `READY TO APPLY` if a material payment-impact path remains unverified.
