# Payment production verification

Use this reference for KTC Payment, EDC, SUNMI P3, EMV/CTLS, ISO8583, TLE, TMS/RKI, host, reversal, settlement, transaction-location, and Production debugging work.

## Evidence authority

Do not silently reconcile conflicting evidence. Record the revision and purpose of each source.

Use this order for observed Production behavior:

1. Exact Production source or packaged artifact identified by version, commit, or hash, plus current device/host logs when runtime behavior is involved.
2. Approved transaction, host, EMV/CTLS, TLE, security, or vendor specification that applies to that Production revision.
3. Checked-in configuration, tests, parameter tables, and maintained implementation documentation tied to the same revision.
4. Project-derived notes and prior analysis.
5. General Android, EMV, ISO8583, or vendor knowledge, clearly labeled as external context or inference.

For intended contract behavior, an approved specification may define what should happen even when Production code differs. Report that as a discrepancy; do not overwrite either side conceptually.

If the exact Production revision, applicable specification, or runtime evidence required to prove a material conclusion is missing, state `SOURCE BOUNDARY` or `RUNTIME VALUE REQUIRED` and do not guess.

## Mandatory change-impact trace

Before proposing or applying a payment-critical code or configuration change, identify the exact changed symbol/parameter and trace all affected producers and consumers. Cover each applicable layer:

- Android lifecycle, coroutine/thread, callback, timeout, retry, persistence, and process-death behavior;
- SUNMI P3 service/SDK boundary and hardware state;
- card-entry mode and EMV/CTLS kernel flow, including relevant TLV production and consumption;
- ISO8583 MTI, bitmap, exact affected data elements, encoding/length rules, packing, MAC/encryption boundary, request and response parsing;
- TLE/session/key identifiers and state transitions without exposing secret values;
- host routing, response codes, STAN/RRN continuity, duplicate handling, reversal/advice, settlement/batch and reconciliation;
- database or parameter state, retry/idempotency and recovery after partial failure;
- network, TMS/RKI, device-location or external service dependency when part of the changed path;
- PCI/security masking, logging, diagnostics and crash-report exposure;
- build, SDK/dependency, signing and deployment impact when applicable.

Do not claim `NO IMPACT` for a layer unless the call/data/state trace proves it. If evidence is insufficient, use `IMPACT NOT PROVEN - HOLD CHANGE`.

For EMV/CTLS changes that can affect authorization data, trace the exact path from kernel/tag source through parsing/transformation into DE55 or the applicable host field, then through packing and host transmission. Verify tag presence, ordering rules when relevant, length/encoding, and fallback/contactless behavior against the applicable specification.

For ISO8583 changes, verify the transaction-specific contract. Do not assume one transaction's MTI or field population applies to another. Compare request and response, conditional fields, reversal/advice behavior, and any host-specific private field structure using exact evidence.

For TLE or cryptographic changes, never print or persist working key material, PIN data, clear PAN beyond approved masking, credentials, certificates/private keys, or secret configuration values. Verify identifiers, state and cryptographic boundaries without exposing secrets.

## Failure and recovery matrix

For any change that can alter transaction outcome or durable transaction state, validate the applicable cases:

1. normal approved and declined paths;
2. validation or kernel rejection before host send;
3. timeout or connectivity loss before request transmission;
4. uncertain outcome after request transmission but before response is processed;
5. retry/duplicate prevention and idempotency behavior;
6. reversal/advice generation, persistence and later retry where required;
7. process/app/device interruption at state-transition boundaries;
8. settlement/batch/reconciliation continuity when the changed state is included;
9. chip/contactless/swipe/manual or scheme-specific paths only when those entry modes are in scope;
10. sensitive-log redaction and diagnostic usefulness.

Do not mark a recovery case not applicable without evidence from the transaction flow or specification.

## Production debugging protocol

When diagnosing an incident:

1. Establish device/app/version/build, transaction type, timestamp window, host/environment and reproducibility.
2. Correlate app, SDK/kernel and host/network evidence using stable transaction identifiers where permitted; redact sensitive values.
3. Build a timeline before assigning root cause.
4. Separate transport success, TLS/session success, HTTP/API status, ISO8583 response, kernel result and business result; one successful layer does not prove another.
5. Identify the first confirmed divergence from the expected flow.
6. State confirmed root cause only when evidence closes the causal chain. Otherwise give ranked hypotheses and the exact missing evidence.

## Change gate

A payment-critical change is merge-ready only when all applicable conditions are satisfied:

- Production baseline and applicable specification are identified;
- changed symbols/parameters and callers/consumers are traced;
- protocol and state impact is documented;
- no sensitive data is introduced into code, logs, tests or documentation;
- focused tests or deterministic evidence cover the changed behavior;
- failure/recovery cases are verified or explicitly blocked with a reason;
- rollback is defined and does not depend on reconstructing unknown Production state;
- remaining risk is stated plainly.

Any unresolved BLOCKER/HIGH finding, unproven payment impact, unknown host/EMV/TLE contract, or missing rollback for a stateful Production change means `HOLD CHANGE`.
