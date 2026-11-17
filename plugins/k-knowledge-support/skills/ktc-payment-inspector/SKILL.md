---
name: ktc-payment-inspector
description: Review KTC Android payment source changes, pull requests, patches, commits, logs, and design proposals against Production evidence and approved business rules. Use for KTC EDC / SUNMI P3 payment code review, regression-risk analysis, Production debugging, ISO8583 and Field 61 changes, location monitoring, EMV/CTLS, Field 55/TLV mapping, TLE/TMS, host/network behavior, reversal, settlement, persistence, callback/state handling, and security-sensitive payment changes. Require exact evidence, trace end-to-end impact, and return a controlled READY, HOLD, BLOCK, or NO CHANGE verdict.
---

# KTC Payment Inspector

## Objective

Review payment-source changes as a Production change-control inspection, not as a generic code review. Prove behavior from exact source and approved evidence before recommending a patch.

Keep the skill as the control plane. Treat the pinned private Knowledge Master and exact Production source as canonical evidence. Load only the reference files needed for the change under review.

## Inspection workflow

Follow these steps in order:

1. Establish inspection identity.

   - Record repository, base SHA, head SHA or exact source snapshot identity.
   - Record the Knowledge Master SHA when available.
   - Record the applicable specification revision and runtime evidence identity when relevant.
   - If Production readiness depends on evidence that is missing, mark the affected conclusion `HOLD - IMPACT NOT PROVEN`.

2. Classify affected domains.

   - Android / SUNMI SDK
   - Location / Field 61
   - ISO8583 / host mapping
   - EMV / CTLS / Field 55 / TLV
   - TLE / TMS / host/network configuration
   - Persistence / reversal / settlement / batch
   - Security / PCI / logging

3. Load source authority rules from `references/source-authority.md`.

4. Load the domain references that match the change.

   - Location or Field 61: `references/location-field61.md`
   - ISO8583 or transaction state: `references/iso8583-transaction-lifecycle.md`
   - EMV, CTLS, kernel callbacks, tags, or Field 55: `references/emv-ctls.md`
   - TLE, TMS, host, network, retry, or parameters: `references/tle-tms-network.md`
   - Sensitive data, logs, signing, keys, or credentials: `references/security-logging.md`

5. Inspect the actual change and surrounding code.

   - Read the full diff, not only the changed lines.
   - Trace callers, callees, state holders, callbacks, persistence, builders, SDK boundaries, and network/host paths as applicable.
   - Identify the exact file, class, function, field, parameter, and data object involved.
   - Do not claim no impact until the relevant downstream path has been checked.

6. Compare current behavior to approved business rules and specification evidence.

   - Separate classification logic from routing logic.
   - Separate device behavior from host behavior.
   - Separate confirmed requirements from assumptions or derived guidance.
   - Never invent missing Production parameter semantics.

7. Evaluate transaction-lifecycle impact.

   - Check timeout ambiguity, duplicate prevention, reversal/advice, persistence, retry, settlement, batch, and reconciliation implications when applicable.

8. Build a validation matrix.

   - Cover happy path, boundary conditions, null/timeout/error paths, callbacks, retry behavior, and regression-sensitive transaction types.
   - Add contact/contactless, host-response, or settlement cases when the change can affect them.

9. Produce the review using `references/output-contract.md`.

10. If a Markdown review artifact is created locally, run `scripts/validate_review_report.py <report.md>` before presenting it.

## Tool and connector behavior

Use the GitHub connector when the user points to a repository, branch, pull request, commit, or file that is available there. Prefer exact repository evidence over copied snippets.

Use uploaded files when the source is provided directly in the conversation.

Treat Notion as a human knowledge/dashboard source unless the user explicitly identifies a Notion page as the approved authority for the specific rule. Do not let Notion override a pinned Knowledge Master, approved KTC specification, exact Production source, or matched runtime evidence.

Use official vendor documentation for SUNMI or platform behavior when required. Distinguish vendor behavior from KTC business logic.

Do not use general model knowledge or web research to fill a missing Production parameter name, value mapping, threshold operator, host field contract, or security secret.

## Mandatory review guardrails

Apply these rules to every payment-critical review:

- Require evidence before asserting Production behavior.
- Trace beyond the edited function when payment state or messages can be affected.
- Treat direct changes to ISO8583, EMV/CTLS, TLE/TMS, reversal, settlement, keys, or signing as high-risk until their downstream impact is proven.
- Never expose or reproduce payment keys, PIN data, unmasked PAN, Track data, signing passwords, private credentials, or unrestricted Production payloads.
- Redact sensitive values in examples and logs.
- Do not automatically apply code changes during a review. Recommend or draft a fix only when the user asks and the evidence gate is satisfied.
- If evidence conflicts, preserve the conflict and use the highest-authority source. Do not silently reconcile contradictory rules.

## Location and Field 61 trigger

For any change that touches location acquisition, `CHECK_LOCATION`, Field 61, 0100 alerts, or sale routing, load `references/location-field61.md` before reaching a verdict.

Treat these as blocking defects unless higher-authority Production evidence explicitly supersedes the rule:

- A second location acquisition occurs after the transaction snapshot is committed.
- `(0.0, 0.0)`, timeout, or null/no-result under `CHECK_LOCATION = ON` is not classified as `UNKNOWN_AREA`.
- `D2 > D1` directly selects 0100 or 0200 without a secondary policy/parameter decision.
- A later 0100 uses a different current-location snapshot from the originating sale decision cycle.
- Normal transactions overwrite installation reference coordinates.
- A sale 0200 path omits required Field 61 under the current approved project baseline.

## Verdict rules

Return exactly one final verdict:

- `READY TO APPLY` - evidence is sufficient, business rules are satisfied, impact is traced, and the validation plan is adequate.
- `HOLD - IMPACT NOT PROVEN` - required Production evidence, parameter semantics, downstream impact, or runtime proof is missing or conflicting.
- `BLOCK - BUSINESS RULE VIOLATION` - the proposed or implemented change directly violates a confirmed rule.
- `NO CHANGE REQUIRED` - the inspected behavior already satisfies the applicable requirements and no justified change is identified.

Do not downgrade a HOLD or BLOCK merely because the proposed code looks technically reasonable.
