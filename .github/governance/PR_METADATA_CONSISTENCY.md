# PR metadata consistency control

Draft is a GitHub lifecycle flag. HOLD is a decision gate. A PR description does not set platform metadata. Clean mergeability does not prove approval, CI success or merge authorization.

The trusted metadata workflow validates live REST data after metadata/commit transitions; it never checks out PR code, executes PR files, posts comments, or changes draft state. It uses only the repository token with contents/pull-requests read and commit-status write permissions; no external actions or packages.

Scope: PR #17 requires a contract even if the marker is removed; other PRs opt in with the same marker. Exactly one JSON comment is required: `<!-- pr-state-contract: {"schema":1,"gate":"HOLD","required_draft":true,"recorded_head_sha":"FULL_40_CHARACTER_LOWERCASE_SHA"} -->`. READY must set required_draft=false; it does not establish review or owner authorization. Duplicate keys, unknown fields, missing contracts, invalid booleans and stale SHA fail.

After each commit, reconcile the recorded SHA and validation evidence. Before ready-for-review: independently dispose of HOLD, record required evidence and authorization, update contract, change GitHub metadata, re-fetch API state, and synchronize the existing private session ledger. Never copy private ledger content or its URL into public CI.

Activation: independently review and merge this workflow through normal controls. It is not active on the default branch while this PR is open. Dispatch pr_number after activation to audit existing PRs. To enforce merges, separately adopt the exact check name `PR metadata consistency` in applicable protected-branch rules after checking it is reported correctly; do not remove existing checks. Stacked PRs may target unprotected branches and require separate branch coverage.

Limits: no GitHub policy can prevent all authorized body/workflow edits. This check detects consistency, not whether READY evidence is truthful. It does not automatically revert Ready transitions, prove absence of security defects, certify product behavior or enforce Notion synchronization in other clients. Runner Python and OS are managed by GitHub, so execution is not fully hermetic. Repository administrators and rule bypasses remain separate controls. A read-only failure must never be treated as permission to escalate token privileges.

Validation: 17 synthetic regression cases passed on the actual inline validator source (hold/draft, ready, stale/missing/malformed/duplicate contracts, opt-in scope and closed PR handling). Python compilation passed. Hosted Actions and required-check enforcement remain NOT RUN until activation.

## Enforced merge status

The workflow posts `PR metadata / merge gate` on the live PR head SHA, not the default-branch workflow SHA. Draft or HOLD always posts failure. Validation starts pending and re-fetches metadata before publishing a result; changed snapshots fail. Protect main and any stacked base with this exact status emitted by GitHub Actions. Do not count the default-branch workflow check as PR-head enforcement. Unknown live PR state is rejected.

The workflow now runs 17 embedded consistency regression cases before any live API action. Seven additional mocked publisher scenarios validated head binding and failure behavior during preparation. The trusted pull_request_target context is intentional: only default-branch inline code executes, no PR checkout, no untrusted expression interpolation, no external action or secret is used. A trigger-only scanner warning does not establish an exploitable checkout path; retain the no-checkout boundary.
