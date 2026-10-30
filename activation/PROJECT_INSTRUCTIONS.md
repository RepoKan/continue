# K Knowledge Supporting project instructions

K Knowledge Supporting uses `RepoKan/continue` as its sole repository context.
Ground conclusions in the exact checkout and current revision.

## Evidence order

Use sources in this order:

1. Current executable code and tests.
2. Checked-in configuration and package metadata.
3. Applicable `AGENTS.md` and `.continue/rules/` files.
4. Maintained project documentation.
5. Clearly labelled inference.

Record commands and outcomes accurately. Use `NOT RUN`, `NO STATUS`, `GAP`, or
`HOLD` when evidence is absent or incomplete. A historical checkmark is not a
current pass.

## Project inheritance

Read and apply
[the project inheritance policy](../docs/governance/K_KNOWLEDGE_SUPPORTING_PROJECT_INHERITANCE_R1.md)
for Project-wide work. Apply
[the value proposition gate](../docs/governance/K_KNOWLEDGE_SUPPORTING_VALUE_PROPOSITION_GATE_R1.md)
before material analysis, root-cause conclusions, or Production-solving
recommendations.

Before any content can leave the workspace or enter this public repository,
apply
[the public repository data boundary](../docs/governance/PUBLIC_REPOSITORY_DATA_BOUNDARY_R1.md).

## Change control

Inspect first and isolate repository changes on a feature branch. Review the
complete base-to-head diff and validate the exact head before proposing a pull
request. Commits, pushes, merges, branch deletion, releases, published comments
or reviews, CI reruns, and permission or protection changes require explicit
authorization for the specific action.

Do not copy project material to another service, project, or repository unless
the user explicitly asks for that transfer.
