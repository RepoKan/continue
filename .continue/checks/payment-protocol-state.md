---
name: Payment Protocol and State Integrity
description: Verify EMV/CTLS, ISO8583, TLE, host, reversal, settlement, and durable transaction-state integrity for payment-sensitive changes
---

Review only payment protocol or state behavior affected by the current change.

Trace every affected producer and consumer through the applicable boundaries: card-entry/kernel result, TLV transformation, ISO8583 field construction and parsing, TLE/session/MAC or encryption boundary, host routing/response, persistence, retry, reversal/advice, settlement and reconciliation.

For EMV/CTLS authorization-data changes, verify the exact kernel/tag source through the host payload, including DE55 when applicable. Check encoding, length and conditional presence against the applicable transaction specification.

For ISO8583 changes, verify the exact transaction MTI, bitmap, changed data elements, private-field structure, request/response behavior and reversal/advice contract. Do not infer one transaction's field rules from another transaction.

For TLE or stateful changes, verify state transitions and identifiers without exposing key material. Check restart/retry behavior and whether a partial failure can leave the terminal and host with inconsistent state.

Require coverage of uncertain outcome after transmission, duplicate prevention, persisted recovery work and settlement/reconciliation impact when applicable.

Use `BLOCKER` for a confirmed protocol/financial-state violation. Use `HIGH` when material protocol or recovery impact remains unproven. A BLOCKER/HIGH result means `HOLD CHANGE`.
