---
name: Payment Sensitive Data and Diagnostics
description: Prevent cardholder, PIN, key, credential, certificate, and Production-secret exposure while preserving useful payment diagnostics
---

Audit payment-relevant code, tests, fixtures, documentation and logs introduced or changed by the current work.

Flag as `BLOCKER` any newly exposed or persisted clear sensitive authentication data, PIN/PIN block, cryptographic working key, private key, credential/token, or prohibited cardholder data. Flag unmasked PAN, track data, private endpoint credentials, or full sensitive Production logs according to the applicable security requirement and context.

Verify that diagnostic logging uses stable non-sensitive correlation identifiers where possible and redacts sensitive fields before logcat, files, crash reporting, screenshots, test output or documentation.

Do not weaken TLS, certificate validation, host verification, encryption/MAC handling, secure storage, or masking merely to improve debugging.

Test data must be synthetic or approved test fixtures. Never require Production credentials or real cardholder data to validate a change.

If a security-sensitive value is required to understand control flow, refer to its variable/key identifier and state transition, not its actual value.
