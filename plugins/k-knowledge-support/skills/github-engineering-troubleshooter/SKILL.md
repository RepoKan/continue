---
name: github-engineering-troubleshooter
description: Diagnose and safely resolve GitHub repository engineering problems using evidence from the current repository, refs, commits, pull requests, Actions runs, jobs, statuses, and artifacts. Use for branch/ref/SHA verification, safe mutations, diff/impact review, PR mergeability, CI failures or missing checks, head-commit validation, artifact integrity, connector/API errors, rollback planning, and post-merge verification. Prefer the connected GitHub tools over generic web search for repository evidence.
---

# GitHub Engineering Troubleshooter

Use GitHub as an evidence system, not as a source of assumptions. Establish the exact repository, ref, and SHA before changing or validating anything.

## Workflow

1. Classify the task as inspection, mutation, PR/merge, CI/Actions, artifact verification, or connector failure.
2. Establish the repository baseline: repository identity, default branch, target ref, current SHA, permissions, and whether the request is read-only or authorizes mutation.
3. Inspect read-only evidence first. Prefer repository files, commit/compare data, PR metadata, workflow runs, jobs, steps, and artifacts from the connected GitHub tools.
4. Make the smallest safe mutation only after the target is proven. Use a feature branch by default; do not write to `main` unless the user explicitly authorizes it.
5. Compare base and head after every coherent change. Confirm changed-file scope and inspect relevant patches before calling the change safe.
6. Gate merge on exact evidence: mergeability, expected head SHA, required review state, relevant validation, and rollback.
7. After merge, re-fetch the target branch and validate the new head. Never treat pre-merge validation as proof of the merged head.

Read [references/tool-routing.md](references/tool-routing.md) when selecting GitHub operations or diagnosing connector behavior. Read [references/project-lessons.md](references/project-lessons.md) when working in K Knowledge Supporting or when a current problem resembles the project incidents recorded there.

## Baseline and evidence rules

- Record repository, base ref, head ref, and full SHA for any operation whose correctness depends on version identity.
- Distinguish observations from mutations. Do not create branches, commits, PRs, reruns, merges, or comments while the user is asking only for inspection.
- Prefer the connected GitHub connector for repository data. Use generic web search only when the user asks for public context not available from repository evidence.
- Treat truncated tool output as a display limitation, not a failed operation. Retrieve a narrower resource when more detail is necessary.
- Do not expose credentials, tokens, private keys, customer data, confidential Production payloads, or private endpoints in GitHub content, logs, comments, or examples.
- For a public repository, assume every committed byte is externally visible. Do not publish internal Production source/spec/log content unless the user explicitly authorizes publication and it is safe to do so.

## Safe mutation discipline

Before writing:

1. Verify the current base SHA and target branch.
2. Create or use a feature branch unless direct-main work is explicitly requested.
3. Fetch the current file/blob SHA before replacing or deleting an existing file.
4. Keep changes atomic and limited to the approved scope.
5. Avoid incidental dependency, lockfile, release, secret, or unrelated formatting changes.

After writing:

1. Re-fetch the branch head.
2. Compare base and head and enumerate changed files.
3. Confirm that no hidden or unrelated files entered the diff.
4. Run the narrowest validation that proves the changed behavior.

For merge, pass the expected PR head SHA when the tool supports it so GitHub rejects the merge if the branch moved after review.

## PR and mergeability truth

GitHub can return an initial mergeability value before background computation has settled. If a newly created PR appears non-mergeable while the branch relationship is otherwise clean, re-fetch PR metadata before concluding there is a conflict.

Do not merge while any material condition remains unknown. Report the exact blocker instead of substituting an assumption.

## CI and Actions truth model

Use these states precisely:

- no workflow run or no status: `NOT RUN` or `NO STATUS`; never `PASSED`;
- `queued`: waiting to execute;
- `in_progress`: executing;
- `completed` + `success`: passed;
- `completed` + `failure`/`cancelled`/`timed_out`: failed or incomplete;
- `skipped`: skipped, not proof that the covered behavior passed.

Trace CI at the correct level: workflow run -> job -> step. A successful setup step does not prove the validation step passed. A successful project-specific validation does not automatically prove unrelated repository-wide builds.

When a connector helper exposes only pull-request-triggered workflow runs, use an approved GitHub REST fetch through the connector for push-triggered runs rather than assuming none exist.

## Head-commit validation

For a result claimed to apply to a head commit:

1. Record the exact head SHA.
2. Confirm the validation run reports that same `head_sha`.
3. Confirm the run reaches `completed` with `success`.
4. Inspect the relevant job/steps when the run summary alone is insufficient.
5. For generated artifacts, confirm the artifact's workflow run and `head_sha` match the target commit.
6. Record the artifact digest or compute a package SHA-256 when integrity matters.
7. If the GitHub artifact is a wrapper archive, extract the intended inner file and validate that file separately.

After merging, repeat this process against the new target-branch head SHA.

## Failure handling

- For a transient connector transport error, retry the same narrow read once. Do not repeat a mutation blindly.
- If local execution lacks outbound DNS/network access, retrieve repository content through the connected GitHub tool and validate the exact retrieved bytes locally when possible.
- If CI is absent for a feature, add a narrow deterministic validation only when the user authorized a change and the validation adds meaningful evidence.
- Separate repository-wide workflow failures from the feature-specific gate. Investigate unrelated failures, but do not mislabel them as caused by the feature without evidence.
- If a validation cannot run, state the blocker and remaining unverified behavior.

## Report results

Report the minimum complete evidence set:

- repository and target ref;
- before/after SHA when mutation occurred;
- changed-file scope;
- PR/merge state when relevant;
- exact validation run state and head SHA;
- artifact identity/digest when relevant;
- unresolved risks or evidence gaps;
- rollback path for mutations.

Use `CONFIRMED`, `INFERRED`, `NOT RUN`, `SOURCE BOUNDARY`, and `HOLD` explicitly when they improve precision.
