# ISO8583 and Transaction Lifecycle Review

For any change affecting transaction state, message builders, host fields, retries, or result handling, trace the full lifecycle.

## Required trace

Inspect as applicable:

sale entry -> transaction state -> request builder -> ISO8583 field mapping -> network send -> host response -> persistence -> receipt/result -> timeout handling -> retry/duplicate control -> reversal/advice -> settlement/batch/reconciliation

## Review rules

- Verify MTI selection from approved business logic; do not infer MTI from a classification label alone.
- Verify changed data elements at the builder and host-message boundary.
- Check null/default/format/length behavior for every modified field.
- Check whether a timeout leaves an ambiguous financial state.
- Check duplicate prevention and STAN/RRN/reference behavior where applicable.
- Check whether request or response changes alter reversal/advice conditions.
- Check whether local persistence remains consistent with host outcome.
- Check settlement/batch/reconciliation impact before declaring a payment-path change complete.
- Do not claim host compatibility without specification or matched runtime evidence.

If downstream host, reversal, or settlement impact cannot be proven for a financially material change, return `HOLD - IMPACT NOT PROVEN`.
