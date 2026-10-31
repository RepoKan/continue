# Location and Field 61 Rules

## Authority labels

Use these labels when reporting evidence:

- `SPEC-V3.3`: Field 61 specification version 3.3 dated 29-Sep-2025.
- `PROJECT-APPROVED`: approved project implementation baseline.
- `BUSINESS-CLARIFICATION-2026-09-12`: explicit project business clarification.

A later approved Production specification or exact parameter contract supersedes lower-authority guidance.

## CHECK_LOCATION contract

Treat `CHECK_LOCATION` as a strict two-state parameter.

Allowed effective values:

- `ON`
- `OFF`

Require exactly one effective value at a time. Do not silently interpret null, blank, malformed, mixed, or unsupported values as a third state.

For `CHECK_LOCATION = OFF`:

- Bypass location enforcement and decision logic.
- Preserve the normal sale 0200 plus Field 61 path under the current approved project baseline.

For `CHECK_LOCATION = ON`:

- Start exactly one current-location acquisition for the sale decision cycle.
- Commit exactly one immutable transaction-scoped `TransactionLocationSnapshot`.
- Reuse that same snapshot for all later location-dependent logic.

## One transaction, one snapshot

After the first `TransactionLocationSnapshot` is committed:

- Do not call `getLocation()` again in the same transaction.
- Do not start a second location acquisition for Unknown recovery.
- Do not start a second location acquisition for 0100.
- Do not let a late callback replace the committed snapshot.
- Reuse the same snapshot for classification, D1/D2 comparison, Field 61, policy evaluation, 0200, and any eventual 0100.

Flag a second acquisition as `BLOCK - BUSINESS RULE VIOLATION` unless higher-authority Production evidence explicitly changes the rule.

## UNKNOWN_AREA classification

When `CHECK_LOCATION = ON`, classify the result as `UNKNOWN_AREA` when the single acquisition produces any of these outcomes:

- coordinates `(0.0, 0.0)`
- `TIMEOUT`
- `NULL` or no location result

Preserve the first attempt and failure state in the same `TransactionLocationSnapshot`.

Do not retry location acquisition inside the same transaction.

Treat `UNKNOWN_AREA` as classification only. It does not directly select 0100, 0200, allow, or reject.

Represent the Unknown/current-location state through Field 61 on the applicable message path. Let the approved secondary policy/parameter select the later action.

## Out-of-Area classification

Use the current business clarification:

`D2 > D1` -> `OUT_OF_AREA`

Current confirmed meaning:

- `D2`: Current Location or a current-location-derived comparison value.
- `D1`: business comparison reference/limit.

Do not invent the exact Production definition, unit, source, or mapping of `D1` when it has not been supplied.

Treat `D2 > D1` as classification only.

Do not encode either of these shortcuts:

- `OUT_OF_AREA -> 0100`
- `OUT_OF_AREA -> 0200`

After `D2 > D1`, require a secondary policy/parameter check before selecting the next message/action.

If the patch depends on unresolved D1 semantics or unresolved secondary-parameter mapping, return `HOLD - IMPACT NOT PROVEN`.

## Field 61 payment structure

For the applicable Field 61 v3.3 payment format, use strict key order:

1. `MD`
2. `SN`
3. `VA`
4. `Ref1`
5. `Ref2`
6. `SI`
7. `L`

Use `$` between key-value pairs.

Validate the final Field 61 length against ANS255 before send. Do not silently truncate.

Use the zero-location convention for unavailable location where the applicable specification requires it.

Under the current approved project baseline, every sale 0200 includes Field 61 regardless of `CHECK_LOCATION` state. Do not generalize this rule to all MTIs without evidence.

## 0100 location alert

For the applicable Field 61 specification, check the alert payload for:

- MessageType
- OriginalLat
- OriginalLong
- CurrentLat
- CurrentLong
- LastLocationDateTime

Use `yyyy-MM-dd_HH:mm:ss` where the applicable specification requires that format.

If a policy decision eventually selects 0100, reuse the exact same transaction location snapshot used by the originating sale decision. Never reacquire location for alert construction.

## Installation reference coordinates

Treat `ORIGINAL_LAT` and `ORIGINAL_LONG` as installation/profile reference coordinates.

- Persist them only from an approved valid installation/profile fix.
- Do not accept `(0.0, 0.0)` as a valid installation reference.
- Do not overwrite them during normal payment transactions.

## Required tests

Require tests appropriate to the change, including:

- `CHECK_LOCATION` ON and OFF
- malformed/unsupported `CHECK_LOCATION`
- valid current location
- `(0.0, 0.0)`
- timeout
- null/no-result
- exactly one acquisition per sale attempt
- late callback rejection
- immutable snapshot reuse
- D2 below/equal/above D1 when D1 semantics are known
- secondary policy routing when its exact mapping is known
- Field 61 order and length boundary
- 0200 and eventual 0100 snapshot equality
