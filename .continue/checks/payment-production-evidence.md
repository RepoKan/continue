---
name: Payment Production Evidence Gate
description: Block payment-sensitive changes that are not grounded in the exact Production revision, applicable specification, and required runtime evidence
---

Audit payment-relevant changes introduced by this pull request or task.

Require the reviewer to identify the exact Production source/artifact revision and the applicable KTC/host/vendor specification for the changed behavior. Runtime-dependent claims must also have device, SDK/kernel, network, or host evidence as applicable.

Flag as `BLOCKER` when a change can affect transaction outcome, authorization data, TLE/crypto state, reversal, settlement, or reconciliation but its Production baseline is unknown or contradictory evidence was silently reconciled.

Flag as `HIGH` when an affected payment layer is declared `NO IMPACT` without a producer/consumer or state trace proving that conclusion.

Do not accept generic Android, EMV, ISO8583, SUNMI, or prior-project knowledge as a substitute for missing Production evidence. Label unsupported conclusions `SOURCE BOUNDARY` or `IMPACT NOT PROVEN - HOLD CHANGE`.

Do not expose secret or cardholder values while presenting evidence.
