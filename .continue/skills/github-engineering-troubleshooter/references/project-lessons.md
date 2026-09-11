# K Knowledge Supporting: GitHub troubleshooting lessons

- Status: Confirmed project knowledge
- Last verified: 2026-09-11
- Scope: `RepoKan/continue` GitHub engineering workflow
- Purpose: Persistent project knowledge for future GitHub troubleshooting. Historical SHAs below are evidence examples, not current-head assumptions; always re-fetch current refs before acting.

## Lessons captured from the K Knowledge Support rollout

### 1. Start read-only and isolate writes

The K Knowledge Support payment-governance change was developed on a feature branch, reviewed by compare/diff, then merged by PR. This prevented unreviewed direct mutation of `main` and made rollback bounded to the feature changes.

Reusable rule: inspect first, create a feature branch for mutations, and only merge after exact diff/impact review.

### 2. Verify the whole branch, not only the latest commit

A feature branch can contain earlier commits that affect marketplace activation, plugin packaging, or configuration. Reviewing only the most recent commit can miss those inherited changes.

Reusable rule: compare `base...head` for the complete merge candidate, then optionally compare the latest parent-to-head for the incremental change.

### 3. Initial PR mergeability can be transient

PR #1 initially surfaced a non-mergeable snapshot immediately after creation, while a subsequent PR metadata fetch reported `mergeable: true` after GitHub finished its background calculation.

Reusable rule: do not classify a fresh PR as conflicted from the first mergeability snapshot alone; re-fetch before declaring a blocker.

### 4. No CI is not a pass

The first payment-governance head had no GitHub commit status checks/workflow runs for the feature. The project explicitly recorded that absence instead of presenting it as success. Local skill validation and exact blob matching were used as bounded evidence, but the missing GitHub CI remained a separate fact.

Reusable rule: use `NO STATUS`/`NOT RUN` for absent CI and state which deterministic checks actually ran.

### 5. Add feature-specific validation when the evidence gap matters

A dedicated `K Knowledge Support Validation` workflow was added in PR #2. The branch head `71837e573301913fb88832e5de7b9c1731f9bceb` completed the feature-specific workflow successfully before merge. The merge produced `main` head `37a71581276745229fd96fe11ffd4179f06072d3`, which then ran the same validation on `main` and completed successfully.

Reusable rule: when a feature needs repeatable head evidence, put deterministic validation in GitHub Actions and verify it both pre-merge and post-merge.

### 6. Validate the exact head SHA

The validation workflow recorded the `head_sha`, and the uploaded artifact metadata pointed back to that same run and SHA. Merge used an expected head SHA to prevent a time-of-check/time-of-use race if the branch moved after review.

Reusable rule: bind validation, artifact, and merge to exact SHAs rather than branch names alone.

### 7. Artifact wrappers need a second integrity check

GitHub Actions produced an artifact archive containing the user-facing `skill.zip`. The artifact metadata provided a digest for the wrapper archive, while the inner `skill.zip` needed its own integrity/hash verification before delivery.

Reusable rule: distinguish the GitHub artifact container digest from the checksum of the actual deliverable inside it.

### 8. Repository-wide workflows are separate evidence

Opening PR #2 triggered unrelated repository workflows such as CLI PR checks, PR checks, and VSIX build in addition to the feature-specific validation. These runs must be observed separately from the K Knowledge Support gate.

Reusable rule: define which workflow proves the feature requirement, while still reporting unrelated failing repository checks if they matter to merge policy.

### 9. Connector capability boundaries matter

A commit-workflow helper can be scoped to pull-request-triggered runs. Push validation on the merged `main` head was therefore verified using an approved GitHub Actions REST resource through the connector rather than concluding that no run existed.

Reusable rule: read the connector action contract and use another approved GitHub read path when event scoping would hide relevant runs.

### 10. Local network failure does not justify weaker evidence

When a local validator environment could not use outbound DNS, repository files were retrieved through the authorized GitHub connector and validated locally from those exact bytes. The workflow was not weakened to bypass the evidence requirement.

Reusable rule: change the retrieval path, not the validation standard.

### 11. Public-repository boundary is a publication boundary

`RepoKan/continue` is public. Project-specific payment governance can be published when intentionally written as generalized policy, but confidential Production archives, real credentials, private endpoints, cardholder data, or sensitive logs must not be copied into the repository.

Reusable rule: before every write to a public repo, scan the proposed content for confidential Production details and secrets.

## Project decision

For future K Knowledge Supporting GitHub work, use this troubleshooting sequence:

`verify repo/ref/SHA -> inspect read-only -> branch isolation -> smallest atomic change -> compare full branch -> validate exact head -> PR/review gate -> merge with expected head SHA -> verify new main head -> verify post-merge run/artifact -> record rollback`.

This sequence is project knowledge, not a substitute for current GitHub evidence. Re-fetch current state at every version-sensitive step.
