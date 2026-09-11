# CI failure classification

Classify the failing layer before changing application code. A red workflow is an observation; the causal layer still has to be proven.

## Formatting or generated-content gate

When a formatter or linter reports exact files and exits non-zero, treat the result as deterministic repository state unless a later run proves otherwise.

- Use the repository-declared formatter and configuration.
- Change only the files reported by the gate unless broader formatting is explicitly required.
- If the project maintains mirrored skill/plugin files, keep both copies synchronized and validate both.
- Prove the repair by running the same formatter check on the exact new head SHA.

## Workflow contract or artifact handoff

Validate all sides of the handoff: workflow path/name, trigger, producer job, artifact name, platform/architecture suffix, and consumer expectation.

- Bind producer lookup to the exact PR head SHA. Branch-only lookup can reuse a stale successful run.
- If the consumer can start before the producer completes, locate and wait for the exact producer run instead of assuming artifacts already exist.
- Verify the producer conclusion before downloading artifacts.
- Preserve externally consumed artifact names when correcting internal producer names unless a coordinated contract migration is intended.
- After merge, verify the new target-branch head and the republished artifacts separately from the pre-merge producer artifacts.

## Dependency or setup failure before tests

If checkout, tool installation, cache restore, runtime setup, or an external download fails before the intended test command starts, do not report a test regression.

For cache-miss plus archive-decode failures:

1. Inspect the action or script that constructs the download URL.
2. Inspect the upstream asset inventory used by that URL.
3. Confirm whether the requested version/asset actually exists.
4. Check whether an HTTP/error document could have been piped into `tar`, `xz`, `unzip`, or a similar decoder.
5. Apply the smallest compatible setup fix, then prove execution advances into the intended test command.

A third-party action that combines a pinned semantic version with a rolling `latest` release endpoint can become internally inconsistent when the rolling release no longer carries that old asset. If the repository does not require that exact binary version and the action supports a dynamic release selector, prefer the supported selector over blind reruns or unverified URL changes.

## Application or test failure

Only classify a failure as an application/test regression after the intended test command actually ran and returned a failure attributable to code, assertions, build logic, or runtime behavior. Inspect the first causal error, not only the final job summary.

## Verification sequence

Use this evidence chain for CI repair:

`failing run -> failing job -> first causal step -> owning workflow/action -> external contract if any -> minimal patch -> exact PR-head verification -> post-merge verification`

For artifact workflows, verify both source artifacts on the PR head and republished artifacts on the resulting target-branch head. For dependency/setup failures, verify the setup step and the downstream test command separately.

## Rerun rule

Do not use rerun as the first fix for a deterministic formatter failure, workflow-name mismatch, artifact-name mismatch, repeated missing external asset, or other proven contract mismatch. A rerun is useful evidence only when the suspected cause is genuinely transient and no deterministic mismatch has been found.
