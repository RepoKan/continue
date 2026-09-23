# Knowledge record format

Use this format only when the user asks to capture a reusable finding, decision, investigation, or handoff. Save it at the user-requested project path. If no path is provided, propose a repository-local path before creating a new knowledge area.

```markdown
# <Topic>

- Status: Confirmed | Inferred | Open
- Last verified: <YYYY-MM-DD>
- Commit: <full Git SHA>
- Scope: <modules or feature>

## Question

<What needed to be established>

## Finding

<Concise conclusion. Label inference explicitly.>

## Evidence

- `<repository path>` — <symbol, configuration, test, or observed behavior>

## Constraints and decisions

- <Requirement or decision, including owner or reason when known>

## Verification

- `<exact command>` — Passed | Failed | Blocked | Not run

## Open items

- <Unresolved question, missing evidence, or follow-up>
```

Do not place credentials, private endpoints, customer identifiers, raw production payloads, or unredacted logs in a knowledge record. Preserve exact technical values only when they are non-sensitive and necessary to reproduce the finding.
