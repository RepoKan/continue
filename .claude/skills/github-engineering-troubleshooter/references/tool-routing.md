# GitHub tool routing

Use the narrowest connected GitHub operation that answers the question. Tool names can vary by surface, so match by capability when an exact name is unavailable.

## Repository and refs

- Repository metadata/permissions/default branch: repository metadata lookup.
- Branch discovery: branch search/list or approved branch REST fetch.
- Exact branch head: fetch the branch resource and record full SHA.
- File content: fetch file by repository path and explicit ref.
- Code discovery: repository code search first, then fetch the exact file.

## Commits and diffs

- Commit inspection: fetch commit metadata/diff.
- Branch relationship and changed-file scope: compare base and head.
- Existing file mutation: fetch current blob/file SHA before update or delete.
- Multi-file atomic mutation: prefer blob/tree/commit/ref operations when available; otherwise keep sequential writes isolated on a feature branch and re-check the final diff.

## Pull requests

Use this order for a merge-sensitive task:

1. get/create PR metadata;
2. list changed filenames;
3. fetch relevant file patch or full PR diff;
4. inspect review submissions/threads when applicable;
5. inspect validation state;
6. re-fetch mergeability;
7. merge using the expected head SHA when supported;
8. re-fetch the base branch after merge.

Do not treat the PR creation response as the final mergeability calculation when GitHub is still computing it.

## Actions and status

- Pull-request-triggered runs: use the connector's commit-workflow-run helper when it explicitly supports the event needed.
- Push runs or broader Actions queries: use an approved GitHub REST `actions/runs` fetch through the connector.
- Job diagnosis: fetch workflow run jobs.
- Step diagnosis: fetch job steps or decoded logs when necessary.
- Artifacts: list run artifacts, verify head SHA/run ID, then download the exact artifact.
- Rerun: rerun only a failed/cancelled job or run when the user authorizes the action; do not rerun successful work without a reason.

## Artifact verification

GitHub Actions artifact download commonly returns a wrapper ZIP. Inspect its members before presenting a file as the deliverable. If it contains `skill.zip`, extract `skill.zip`, test ZIP integrity, and compute SHA-256 on the inner package when the inner package is the user-facing artifact.

## Common evidence mistakes

- `statuses=[]` does not mean validation passed.
- `workflow_runs=[]` from a helper scoped to PR events does not prove there are no push runs.
- `queued` is not success.
- a successful job setup/checkout is not a successful test.
- a branch being ahead and not behind does not itself prove mergeability.
- a PR initially showing `mergeable: false` may need a re-fetch while GitHub computes mergeability.
- a successful branch run does not prove the post-merge `main` head unless a run on the merged head is also verified.
