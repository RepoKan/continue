# K Knowledge Supporting repository instructions

These instructions apply to the whole repository. A more specific `AGENTS.md`
inside a subdirectory takes precedence for files in that subtree.

## Start every task

1. Record the repository, branch, and full commit SHA.
2. Read [the project instructions](activation/PROJECT_INSTRUCTIONS.md).
3. Read the files under `.continue/rules/` that apply to the files being
   inspected or changed.
4. Preserve unrelated work and use the smallest coherent change.

## Protect the project boundary

Treat every committed byte as public. Apply
[the public repository boundary](docs/governance/PUBLIC_REPOSITORY_DATA_BOUNDARY_R1.md)
before preparing a commit, patch, pull request, issue, comment, artifact, or
log excerpt.

Use current code and tests as the primary technical evidence. Do not present
historical notes, expected behavior, or an absent check as a current test pass.
For material analysis and root-cause work, apply
[the value proposition gate](docs/governance/K_KNOWLEDGE_SUPPORTING_VALUE_PROPOSITION_GATE_R1.md).

## Make and validate changes

- Work on a feature branch unless the user explicitly authorizes direct work
  on `main`.
- Do not commit, push, merge, publish, delete a branch, rerun CI, or change
  repository permissions without authorization for that action.
- Keep the Node.js baseline at `24.22.2` unless an intentional, tested
  migration changes it.
- Preserve local profiles and configuration, MCP and agent tools, config
  reload, and the VS Code, CLI, and IntelliJ integration contracts.
- Do not add authentication, telemetry, remote synchronization, dependency
  upgrades, lockfile changes, packaging, or release changes incidentally.
- Run the narrowest meaningful test first, then the owning module's type check
  or build when the change affects types or shared contracts.

Payment-sensitive work must also follow
`.continue/rules/payment-production-governance.md`. Missing exact source,
specification, runtime evidence, or rollback evidence is a reason to hold a
Production-impacting change rather than guess.
