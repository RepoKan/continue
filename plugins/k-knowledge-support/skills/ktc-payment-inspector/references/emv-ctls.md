# EMV and CTLS Review

Use this reference when a change touches card acquisition, kernel configuration, callbacks, TLV/tag collection, CVM, online processing, Field 55, contact, contactless, or fallback behavior.

## Required trace

Inspect as applicable:

card interface -> kernel/API call -> callback/state -> EMV/CTLS result -> TLV/tag collection -> Field 55 mapping -> ISO8583 request -> host response -> kernel completion -> transaction result -> reversal/timeout implications

## Review rules

- Separate contact and contactless behavior when their kernels or callbacks differ.
- Verify tag provenance before changing, adding, dropping, or reformatting a TLV.
- Verify Field 55 construction and length/encoding at the message boundary.
- Check asynchronous callback ordering and terminal state transitions.
- Check timeout, cancellation, fallback, and double-completion risks.
- Check whether SDK version behavior is supported by official vendor documentation.
- Do not infer scheme/kernel semantics from application code alone.
- Treat any change that can alter authorization data as high risk until host mapping and regression tests are proven.

Require relevant contact/contactless and online/decline/timeout tests before `READY TO APPLY`.
