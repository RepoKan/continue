# K Knowledge Support

Evidence-backed project inspection and engineering support for the
`RepoKan/continue` fork. The package is a skills-only plugin; it does not run a
service or add a user interface.

## Included skills

- `k-knowledge-support` — inspects architecture, diagnoses defects, plans and
  implements scoped changes, selects repository checks, captures reusable
  project knowledge when requested, and applies Production-sensitive payment
  evidence/impact controls for KTC Payment, EDC, SUNMI P3, EMV/CTLS, ISO8583,
  TLE, host, reversal, settlement, and Production debugging.
- `github-engineering-troubleshooter` — diagnoses GitHub repository, branch,
  ref/SHA, pull request, Actions/CI, mergeability, head-validation, artifact,
  connector, and rollback problems using exact repository evidence and safe
  mutation gates.

## Payment governance

The repository-native `.continue/agents`, `.continue/checks`, and
`.continue/rules` include dedicated payment review controls. The
`k-knowledge-support` skill loads `references/payment-production.md` only when
payment scope is active, so normal Continue engineering requests do not pay the
context cost of the full payment verification workflow.

Payment-critical work requires an exact Production baseline, applicable
specification, end-to-end protocol/state impact trace, sensitive-data review,
focused validation, and rollback evidence. Unresolved BLOCKER/HIGH findings or
unproven payment impact produce `HOLD CHANGE` rather than an assumed safe merge.

## GitHub troubleshooting knowledge

The `github-engineering-troubleshooter` skill captures the reusable workflow
learned while developing and validating this plugin: read-first inspection,
branch isolation, exact SHA binding, full-branch diff review, PR mergeability
re-checks, CI truth-state interpretation, Actions job/step tracing, artifact
integrity, expected-head merge protection, and post-merge head validation.

Project-specific lessons are versioned in
`skills/github-engineering-troubleshooter/references/project-lessons.md`. Treat
historical SHAs in that file as evidence examples, not current state; always
re-fetch current refs before acting.

## Use in this repository

The repository marketplace is defined in `.agents/plugins/marketplace.json`,
and `.codex/config.toml` enables `k-knowledge-support@repokan-projects` for this
trusted project. Restart the ChatGPT desktop app after checking out the branch,
then open the repository and use a prompt such as:

> Use $k-knowledge-support to inspect config reload and explain the end-to-end
> flow with repository evidence.

For payment review:

> Use $k-knowledge-support to review this KTC Payment change for Production,
> EMV/ISO8583/TLE impact, recovery behavior, security, validation, and rollback.

For GitHub troubleshooting:

> Use $github-engineering-troubleshooter to diagnose this PR or GitHub Actions
> failure from the exact repo, refs, head SHA, jobs, steps, and artifacts.

The skills can also activate from matching requests without naming them
directly.

## Add the repository marketplace

For a separate checkout or team environment, add the repository as a tracked
marketplace source:

```bash
codex plugin marketplace add RepoKan/continue --ref main
```

Local and repository marketplaces are supported authoring and team-distribution
sources; availability can vary by OpenAI surface.

## GitHub access

The OpenAI metadata declares the GitHub MCP dependency used when a local
checkout is unavailable. Authentication remains controlled by the user's
connected GitHub account and repository permissions. The skills do not mutate
GitHub unless the user authorizes a change.

## Compatibility

- `plugin.json` is the portable Agent Plugins manifest.
- `.codex-plugin/plugin.json` is the supported Codex compatibility manifest.
- Each packaged skill has `agents/openai.yaml` for OpenAI presentation metadata
  and the optional GitHub tool dependency when required.
- `.continue/skills/` keeps the Continue-native copies.

When changing a bundled skill, keep its Continue-native and plugin copies
aligned, validate both copies, and bump the plugin version before distribution.
