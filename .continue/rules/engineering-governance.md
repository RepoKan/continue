---
name: Engineering Governance R2
description: Mandatory scope, authorization, evidence, validation, review, merge, and recovery controls for this repository
alwaysApply: true
---

# Engineering Governance R2

**Policy ID:** `repo-kan-continue-engineering`  
**Scope:** `RepoKan/continue` only. Other repositories do not inherit this policy without a separate, explicit adoption record.  
**Effective point:** when this change is merged to `main`; a branch or open pull request is proposed policy, not effective policy.  
**Canonical source:** this file. Agents, checks, skills, and workflows may explain how to apply a rule but must not create a competing version of its requirement.

## Status vocabulary and precedence

- `PASS` means the stated check ran against the exact identified inputs and met its acceptance criteria.
- `FAIL` means a check ran and found a violation. `BLOCK` is reserved for a confirmed prohibited or unsafe condition.
- `HOLD` means a required fact, authorization, validation, or review is missing or unresolved. `NOT RUN` and `UNDETERMINED` are never passes.
- `NOT APPLICABLE` requires a short, evidence-based scope reason. A skipped workflow job is not a pass and is not a blocker when its condition is demonstrably outside scope.
- `NO CHANGE` describes implementation activity; it does not establish merge readiness.

Resolve conflicts in this order: (1) host/platform constraints and applicable law; (2) mandatory security, privacy, and domain safety requirements; (3) the effective repository policy and its valid, scoped exceptions; (4) the user's task-specific scope and action authorization; (5) implementation preferences and style guidance. User authorization is required for actions but cannot waive a higher-level prohibition.

Specific procedures may clarify a higher-level requirement but may not weaken it. If two applicable normative requirements at the same authority level cannot both be met, do not choose by recency, specificity, file order, or vote: mark the affected decision `HOLD`, record the conflict and evidence, and escalate to `GS` and the accountable owner for the affected rule. Resolve the conflict through a reviewed policy/specification change under GOV-024 before treating the affected gate as passed.

Keep normative authority separate from factual evidence. Approved specifications and project decisions describe intended behavior; source, tests, CI logs, browser observations, and production records describe observed behavior. A mismatch is a finding to resolve, not permission for code or a passing test to silently override an approved contract.

## Roles, accountability, and decision order

Roles are decision responsibilities, not a seniority ladder. Assign one accountable role (`A`) to every rule. Map each required role to a currently eligible person or system in the pull request record; do not invent an assignment.

| Role | Decision responsibility | Cannot substitute for |
| --- | --- | --- |
| `PO` — Project Owner | Scope, action authorization, adoption, and permitted risk exceptions | Platform constraints, independent review, or domain evidence |
| `GS` — Governance Steward | Policy version, applicability, conflicts, and canonical references | Product approval or merge authorization |
| `SR` — Security Reviewer | Trust boundaries, data exposure, supply chain, and security findings | Risk acceptance by an authorized owner |
| `PV` — Payment Verifier | Payment contracts, transaction state, and recovery when applicable | Approved host or production evidence |
| `IM` — Implementer | Authorized, bounded source or configuration changes | Review or approval of their own change |
| `QA` — Verification Owner | Exact-revision CI, browser, backend, and evidence reuse | Security/domain acceptance or independent review |
| `IR` — Independent Reviewer | Findings and disposition on the reviewed revision | Review of their own changes or action authorization |
| `RM` — Release/Merge Operator | Aggregate gate decision, authorized merge/release, and post-action verification | Waiving required gates or changing policy during a merge |

Decision order: determine policy and scope (`GS`); identify required domain/security reviewers; assess applicable constraints (`SR`/`PV`); have `PO` authorize the exact action after material risks are known; implement (`IM`); verify (`QA`); review independently (`IR`); aggregate and execute only when authorized (`RM`). A security or domain owner may hold/block only within its applicable gate and must cite evidence. `QA` reports evidence, `IR` reports review, and `PO` accepts only risks that policy permits. Disagreement or missing role authority is `HOLD`, not a vote or a seniority override.

`A` in the registry means the single role accountable for the rule's disposition and evidence; it does not mean that role must perform every task or can approve another role's gate. Map that role to an eligible actor for the candidate. A role may be involved at more than one stage (for example, an initial risk assessment and a later independent review are separate decisions). Role authority and decision separation apply only to gates in scope; a missing role holds only the gate that requires it.

## Canonical rules

Each rule has one accountable role, one priority, explicit dependencies, and a measurable outcome. The dependency registry is the single source for those three metadata fields; rule sections contain requirements and acceptance criteria only, avoiding duplicated metadata. Priority classifies urgency and stage, not authority, applicability, or permission to skip a rule. Every applicable rule remains binding at every priority. `P0` conditions must be resolved before the consequential action or decision they govern; safe read-only preparation may continue. Evidence about a candidate must be bound to its resulting revision before that evidence supports a gate decision. `P1` change-specific security, domain, validation, and review gates must be resolved before the dependent integration or merge decision. `P2` traceability and maintenance obligations must be completed by the decision point they support. A lower priority cannot weaken a higher-authority rule, waive a required gate, or convert an unresolved status into `PASS`.

The dependency registry is a prerequisite graph, not a command to run every gate or test for every task. A dependency means its scope and disposition must be evaluated before relying on the dependent rule; the dependency need not be `PASS` when it is demonstrably `NOT APPLICABLE`. A `HOLD`, `BLOCK`, or unresolved status on an applicable dependency prevents a dependent gate from being called `PASS` when that dependency affects its outcome. Dependencies do not prescribe test order or duplicate checks. Conditional rules may be `NOT APPLICABLE` only under GOV-007.

### GOV-001 — Repository scope and adoption
Apply this policy only to `RepoKan/continue`. Before applying another repository's rules, record its repository/ref, owner, policy version, adoption decision, and effective scope. A shared account, fork relationship, skill reference, or open PR does not transfer policy authority. Never publish private project details as a shortcut to resolve a missing reference.

**Accept when:** the decision record identifies the exact repository and effective policy. **Otherwise:** `HOLD` cross-repository policy claims; continue safe work within this repository.

### GOV-002 — Authority and evidence
Use the precedence and status vocabulary above. Preserve intended-contract evidence separately from observed behavior. When sources disagree, record the conflict, source revision, and owner who can resolve it; do not infer authority from recency, file type, or a green process exit alone.

**Accept when:** each material claim identifies whether it is a requirement, observation, inference, or unknown. **Otherwise:** `HOLD` the decision that depends on the conflict.

### GOV-003 — Role assignment and separation
Use the role definitions above. Name the eligible actor for each role required by a gate. A person or automation that authored a change cannot provide its independent review. Separate implementation, verification, review, risk acceptance, and release where the applicable gate requires separation.

**Accept when:** required roles and any separation are recorded for the candidate. **Otherwise:** `HOLD` only the gate that lacks an accountable actor.

### GOV-004 — Action-specific authorization
Before a consequential write, record the action, target, scope, expected side effects, and authorizing instruction. Read-only inspection, reversible local preparation, and writing to an explicitly authorized PR branch may proceed within scope. Commit, push, merge, release, publish, permission change, or external communication each needs authorization that covers that action; authorization to review or edit does not imply those later actions. A still-valid earlier authorization need not be requested again.

**Accept when:** authorization matches the exact action and target. **Otherwise:** `HOLD` that write while continuing independent read-only work.

### GOV-005 — Data boundary and secrets
Use only the minimum data needed in the authorized repository and service. Do not expose credentials, private customer/payment data, keys, tokens, or private project material in public files, logs, prompts, or reports. Redact before storing evidence. A connector's availability is not permission to disclose or publish data.

**Accept when:** destinations and evidence contain no unauthorized sensitive material. **Otherwise:** stop the exposure path, preserve non-sensitive evidence, and follow GOV-028.

### GOV-006 — Revision-bound evidence
Identify candidate SHA, base SHA, relevant files/configuration, toolchain, environment, and observation time. Separate direct observation from inference and historical evidence. A process exit status establishes the process's own result, not a policy verdict, unless the documented command is specifically configured to produce that verdict. Do not claim `PASS` from a PR label, expected behavior, stale run, screenshot, or mergeability flag.

**Accept when:** evidence identifies the exact inputs and an explicit result. **Otherwise:** mark `UNDETERMINED` and apply GOV-018.

### GOV-007 — Applicability and conditional gates
Decide each gate as `REQUIRED`, `NOT APPLICABLE`, or `UNDETERMINED` from behavior, data flow, and risk—not file extension or filename alone. Configuration, agent prompts, workflows, tests, and policy can change runtime behavior or permissions and require impact assessment. Record why a conditional gate applies or does not apply.

**Accept when:** every gate in the decision matrix has a supported applicability state. **Otherwise:** `HOLD` only unresolved dependent gates.

### GOV-008 — Bounded impact trace
Start with the diff, then inspect the smallest proven relevant producer, consumer, dependency, protocol/state transition, configuration, and test path. Do not stop at changed files when trust, compatibility, data flow, or durable state crosses the diff. Do not expand into unrelated cleanup. Treat internal input as trusted only when a verified boundary enforces that invariant.

**Accept when:** affected paths and excluded adjacent paths are explained. **Otherwise:** `HOLD` claims of no impact; do not make broad changes by speculation.

### GOV-009 — Minimal, reviewable change
Make the smallest coherent change authorized by the task. Keep review/check roles findings-only; they report a finding and suggested fix but do not edit, commit, push, open a PR, or merge. Implementation-mode changes require explicit scoped authorization and their own diff/validation. Avoid unrelated upgrades and hidden companion changes.

**Accept when:** diff, rationale, and rollback implications are bounded. **Otherwise:** stop unauthorized mutation and report the state.

### GOV-010 — Dependency and lockfile integrity
Change manifests and their package-manager lockfiles coherently. Preserve security updates already present in the target base; never lower or remove a resolved security fix to make files agree. Validate supported package managers with frozen/clean install checks and record intentional ecosystem-specific resolution differences. Compare security findings with the target-base baseline and identify introduced findings separately.

**Accept when:** manifest/lockfile consistency, installability, and security delta are evidenced. **Otherwise:** `HOLD` dependency merge; do not silently revert baseline updates.

### GOV-011 — CI and test evidence
Run or reuse checks only when candidate inputs and applicability justify them. Bind every reported result to its SHA and configuration. Use the owning package's scripts/configuration to select tests; suffix conventions alone do not determine framework or command. A skipped conditional job is `NOT APPLICABLE` only with its condition recorded. Distinguish process success, test success, structured policy verdict, and deployment success.

**Accept when:** every required check is `PASS` on the exact reviewed candidate, or its status is justified as `NOT APPLICABLE`. An exception may disposition only a finding expressly permitted by GOV-027; it never changes a check's `FAIL`, `NOT RUN`, `HOLD`, or `UNDETERMINED` result into `PASS`. **Otherwise:** `HOLD` the affected gate.

### GOV-012 — Browser and embedded integration
For browser, iframe, navigation, origin, preview-editor, or embedded-host claims, test the actual supported host/browser path and relevant positive and negative cases. Unit or DOM-simulation tests do not establish cross-origin browser behavior. Record host, browser, exact build/deployment, steps, and outcome; do not enter credentials unless separately authorized.

**Accept when:** actual integration evidence covers each required behavior. **Otherwise:** `NOT RUN` or `HOLD`; never infer browser success from build success.

### GOV-013 — Backend and authentication integration
For backend/authentication claims, verify the real configured identity, redirect/callback, session, protected resource, and failure path in an authorized non-production environment. Do not fabricate credentials or treat a rendered login page as successful authentication. Keep secrets out of evidence.

**Accept when:** the required end-to-end contract is exercised safely. **Otherwise:** record `NOT RUN` and hold claims that depend on it.

### GOV-014 — Payment and protocol contracts
When payment-sensitive behavior is applicable, use exact production evidence and approved contracts. Trace transaction fields, encodings, state, retry/duplicate behavior, reversal/advice, settlement, reconciliation, and durable recovery as affected. Never infer missing host, EMV, TLE, or production rules from generic knowledge; never expose keys or cardholder data. If evidence confirms unsafe durable-state behavior or a critical contract is incompatible or absent such that behavior cannot be shown safe, `BLOCK` the affected change. If evidence needed to establish the contract is missing, `HOLD`.

**Accept when:** the domain trace and applicable recovery evidence are reviewed by `PV`. **Otherwise:** `HOLD` the payment-sensitive gate; if the path is proven out of scope, document `NOT APPLICABLE`.

### GOV-015 — Security findings and baseline
Review introduced attack surfaces and proven dependencies, not only changed lines. Record severity, evidence, exploitability, and baseline status. A zero increase in findings does not mean vulnerability-free. A confirmed prohibited exposure is `BLOCK`; a missing assessment or unresolved material finding is `HOLD`. A permitted exception can disposition only an expressly acceptable risk finding under GOV-027; it does not waive a required assessment or turn a failed gate into `PASS`.

**Accept when:** introduced risk and residual baseline are separately dispositioned, with any permitted exception recorded under GOV-027 while retaining the finding and its original status. **Otherwise:** `HOLD` or `BLOCK` according to evidence, not tool wording alone.

### GOV-016 — Independent review
Review the full relevant diff and evidence on the exact candidate SHA. Return findings with severity, location, evidence, impact, and disposition. The author cannot self-approve. Agent/check success is not an independent review unless a documented reviewer verdict is actually produced and accepted by the repository. Resolve or explicitly disposition material findings under GOV-027.

**Accept when:** an eligible independent reviewer records a verdict on the candidate. **Otherwise:** `HOLD` merge readiness.

### GOV-017 — Evidence reuse and invalidation
Reuse successful evidence when candidate changes do not materially affect the evidence's inputs, configuration, environment, or scope. Record `RETAIN`, `INVALIDATE`, or `REVALIDATE` with the original evidence SHA, candidate SHA, changed inputs, impact rationale, and affected gates. Re-run only invalidated or newly required checks; do not repeat completed remediation or unchanged successful tests without a reason. Reused evidence remains tied to its original inputs and is never relabeled as a fresh result for a new SHA.

**Accept when:** each gate has a freshness decision and rationale. **Otherwise:** `HOLD` stale dependent claims, not unrelated work.

### GOV-018 — Readiness decision
Use `READY` only when all required gates pass, N/A states are justified, no material policy conflict remains, permitted residual findings are dispositioned under GOV-027 without erasing their status, and review/action prerequisites are met. Use `HOLD` for missing or unresolved prerequisites. Use `BLOCK` for confirmed prohibited or unsafe conditions. State the blocked action, missing evidence, owner role, and release condition. `mergeable=true` is only one input.

**Accept when:** the decision record cites candidate/base SHA, policy version, gate matrix, residual risk, and accountable roles. **Otherwise:** do not report overall readiness.

### GOV-019 — Merge gate and expected head
Immediately before merge, re-read PR, base/head, review state, required checks, and applicable branch/ruleset requirements. Bind approval to the reviewed candidate and use an expected-head guard where supported. If enforcement cannot be read, record `UNKNOWN` and do not bypass it. Re-evaluate affected gates when either ref changes. Include merge-triggered deployment in the action authorization.

**Accept when:** current refs, required gates, authorization, and platform response agree. **Otherwise:** `HOLD` merge; never force-update or write to the target branch to evade a gate.

### GOV-020 — Post-merge and release verification
After merge, read the new target SHA and verify applicable post-merge checks, artifacts, and deployment before release. Report `MERGED`, `POST-MERGE VERIFIED`, and `RELEASED` as separate states. Pre-merge evidence does not automatically prove post-merge behavior.

**Accept when:** post-merge outcomes are tied to the merged SHA and release action is authorized. **Otherwise:** hold dependent release/promotion.

### GOV-021 — Rollback and stateful recovery
Before integrating stateful or externally visible changes, identify rollback trigger, owner, target, and validation. Revert a merge commit through a reviewed revert against the correct parent; do not reset or force-push a shared target branch. Code revert alone does not restore database, host, key, or financial state; define safe compensation or forward recovery when needed.

**Accept when:** a bounded recovery plan matches changed state. **Otherwise:** `HOLD` a change without safe recovery.

### GOV-022 — Canonical rules and mirrors
Define each normative requirement once with a stable GOV ID. Role prompts, checks, templates, and mirrors reference that ID and may add domain-specific procedure, not alternate policy. Keep required skill mirrors byte-consistent for shared files and declare package-specific metadata separately. Do not remove a required mirror merely because content is repeated.

**Accept when:** canonical path/version and mirror manifest are clear and validated. **Otherwise:** `HOLD` activation of ambiguous or drifting policy.

### GOV-023 — Rule activation and enforcement
Distinguish policy text, adapter configuration, runtime selection, CI verdict, and platform enforcement. For conditional rules, verify deterministic selection and positive/negative scope cases. Do not assume prose keywords cause activation. Always-applied rules must declare supported metadata; globs must be tested against representative matching and non-matching paths. Never claim enforcement based only on a file existing.

**Accept when:** policy version, active-rule list/selector tests, and effective checks are evidenced. **Otherwise:** report `NOT VERIFIED`; use an explicitly documented manual gate until enforcement is validated.

### GOV-024 — Policy change and adoption
Propose policy changes with conflict analysis, affected-file map, role/dependency updates, validation, migration, and rollback. Review the change under the previously effective policy; a draft cannot approve itself or retroactively convert a failed candidate gate into a pass. Record adopter, repository, ref, version, effective time, and superseded rules. A repository's policy never installs globally or transfers to another repository by implication.

**Accept when:** adoption is explicit and review is independent. **Otherwise:** the change remains proposed and non-effective.

### GOV-025 — Current decision ledger and history
Maintain one current decision record per candidate. Preserve older notes as dated snapshots with their original SHA and outcome; later evidence updates the current record without rewriting history. Link evidence and rule IDs. Use owning package scripts/configuration for test instructions; keep product documentation style separate from governance and audit evidence.

**Accept when:** current status and historical chronology are unambiguous. **Otherwise:** correct references; hold only a decision whose evidence cannot be identified.

### GOV-026 — External actions and side effects
Before deployment, publication, permission changes, external messages, or merges that trigger them, record destination, account, payload, visibility, expected cost/side effects, and authorization. A session or connector is not authorization. If a write result is ambiguous, read target state before retrying; never replay through another connector without reconciliation.

**Accept when:** action receipt and before/after target state are available. **Otherwise:** hold the external write; safe preparation may continue.

### GOV-027 — Exceptions and risk acceptance
An exception is separate from permission to act. Record rule/finding IDs, candidate SHA, scope, rationale, evidence, compensating control, authorized approver, expiry, and revalidation trigger. Obtain the accountable domain role's disposition when security/payment is involved. No gate is waivable by default. An exception may disposition only a risk finding that the effective policy explicitly permits the owner to accept. It cannot waive applicable law, mandatory higher-authority security/privacy/domain obligations, action authorization, required independent review, evidence integrity, host/platform controls, forbidden disclosure, fabricated evidence, or an unproven critical contract.

**Accept when:** the exception is policy-permitted and bounded. **Otherwise:** the original gate remains `HOLD` or `BLOCK`.

### GOV-028 — Incident, drift, and ambiguous state
On secret exposure, stale refs, conflicting evidence, or uncertain writes, stop only actions that could worsen the condition. Preserve non-sensitive evidence, inspect actual target state before retry, contain through an authorized process, and invalidate only affected evidence. Never replay a mutation or switch connectors to bypass an unknown result.

**Accept when:** affected scope, observed state, containment/recovery decision, and next owner action are recorded. **Otherwise:** block prohibited continuation or hold dependent writes; continue independent safe work.

## Dependency registry

| Rule | A | Priority | Depends on |
| --- | --- | --- | --- |
| GOV-001 | GS | P0 | — |
| GOV-002 | GS | P0 | GOV-001 |
| GOV-003 | PO | P0 | GOV-002 |
| GOV-004 | PO | P0 | GOV-003 |
| GOV-005 | SR | P0 | GOV-001, GOV-004 |
| GOV-006 | QA | P0 | GOV-001, GOV-002 |
| GOV-007 | GS | P1 | GOV-003, GOV-006 |
| GOV-008 | IM | P1 | GOV-007 |
| GOV-009 | IM | P1 | GOV-004, GOV-005, GOV-008 |
| GOV-010 | SR | P1 | GOV-009 |
| GOV-011 | QA | P1 | GOV-006, GOV-009 |
| GOV-012 | QA | P1 | GOV-007, GOV-011 |
| GOV-013 | QA | P1 | GOV-007, GOV-011 |
| GOV-014 | PV | P1 | GOV-005, GOV-006, GOV-008 |
| GOV-015 | SR | P1 | GOV-005, GOV-008, GOV-010 |
| GOV-016 | IR | P1 | GOV-006, GOV-007, GOV-011, GOV-012, GOV-013, GOV-014, GOV-015, GOV-021, GOV-027 |
| GOV-017 | QA | P1 | GOV-006, GOV-007 |
| GOV-018 | RM | P1 | GOV-016, GOV-017, GOV-025 |
| GOV-019 | RM | P1 | GOV-004, GOV-018, GOV-021, GOV-026 |
| GOV-020 | RM | P1 | GOV-019 |
| GOV-021 | RM | P1 | GOV-008 |
| GOV-022 | GS | P1 | GOV-006 |
| GOV-023 | GS | P1 | GOV-022, GOV-024 |
| GOV-024 | PO | P1 | GOV-004, GOV-006, GOV-022 |
| GOV-025 | GS | P2 | GOV-006, GOV-022 |
| GOV-026 | PO | P0 | GOV-004, GOV-005 |
| GOV-027 | PO | P1 | GOV-002, GOV-003, GOV-006 |
| GOV-028 | RM | P1 | GOV-005, GOV-006 |

The dependency graph must remain acyclic. Automated validation checks registry structure and references; it cannot establish that natural-language rules are semantically consistent, so policy changes still require conflict analysis and independent review under GOV-024.

## Required decision record

For a review/merge decision, record: repository/ref, base and candidate SHA, policy version, required/N/A/unknown gate matrix, evidence links and freshness, findings and dispositions, role-to-eligible-actor mapping, external-action authorization, expected head, decision state, blocked action/owner/exit condition, and rollback limits. Never fill a missing result with an assumption.
