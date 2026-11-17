# PR metadata consistency control

Draft is a GitHub lifecycle flag. HOLD is a decision gate. A PR description does not set platform metadata. Clean mergeability does not prove approval, CI success or merge authorization.

The read-only workflow validates live REST data after metadata/commit transitions; it never checks out PR code, executes PR files, posts comments, or changes draft state. It uses only the repository token with read permissions and no external actions or packages.

Scope: PR #17 requires a contract even if the marker is removed; other PRs opt in with the same marker. Exactly one JSON comment is required: `<!-- pr-state-contract: {"schema":1,"gate":"HOLD","required_draft":true,"recorded_head_sha":"FULL_40_CHARACTER_LOWERCASE_SHA"} -->`. READY must set required_draft=false; it does not establish review or owner authorization. Duplicate keys, unknown fields, missing contracts, invalid booleans and stale SHA fail.

After each commit, reconcile the recorded SHA and validation evidence. Before ready-for-review: independently dispose of HOLD, record required evidence and authorization, update contract, change GitHub metadata, re-fetch API state, and synchronize the existing private session ledger. Never copy private ledger content or its URL into public CI.

Activation: independently review and merge this workflow through normal controls. It is not active on the default branch while this PR is open. Dispatch pr_number after activation to audit existing PRs. To enforce merges, separately adopt the exact check name `PR metadata consistency` in applicable protected-branch rules after checking it is reported correctly; do not remove existing checks. Stacked PRs may target unprotected branches and require separate branch coverage.

Limits: no GitHub policy can prevent all authorized body/workflow edits. This check detects consistency, not whether READY evidence is truthful. It does not automatically revert Ready transitions, prove absence of security defects, certify product behavior or enforce Notion synchronization in other clients. Runner Python and OS are managed by GitHub, so execution is not fully hermetic. Repository administrators and rule bypasses remain separate controls. A read-only failure must never be treated as permission to escalate token privileges.

Validation: 17 synthetic regression cases passed on the actual inline validator source (hold/draft, ready, stale/missing/malformed/duplicate contracts, opt-in scope and closed PR handling). Python compilation passed. Hosted Actions and required-check enforcement remain NOT RUN until activation.
