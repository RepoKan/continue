# Security and Logging Guardrails

Apply these guardrails to every review.

Never include or recommend storing these values in source control, Notion, logs, screenshots, test fixtures, or review artifacts:

- payment or transport keys
- PIN or PIN block data
- unmasked PAN
- Track 1 or Track 2 data
- CVV/CVC/CID
- keystore files or signing passwords
- API tokens or private credentials
- unrestricted Production request/response payloads containing sensitive data

Use masked or synthetic values in examples.

Flag logging changes that can expose sensitive data.

Check release/signing configuration boundaries when build files, keystore configuration, or CI secrets are changed.

Treat secret exposure as a blocking security issue independent of functional correctness.
