---
title: K Knowledge Supporting Project Inheritance R1
description: Defines instruction precedence, evidence authority, repository scope, and change controls for K Knowledge Supporting work.
---

# K Knowledge Supporting Project Inheritance R1

## Purpose

This policy keeps work in `RepoKan/continue` consistent across coding agents,
IDE integrations, local skills, and connected tooling.

## Instruction precedence

Apply instructions in this order:

1. The user's current, explicit request.
2. Repository `AGENTS.md` files, with the nearest file controlling its subtree.
3. Applicable files under `.continue/rules/`.
4. Project-owned skills under `.continue/skills/` and their synchronized
   runtime mirrors.
5. Maintained repository documentation.

Higher-priority platform and safety requirements still apply. A lower-level
instruction cannot grant permission for an external write or critical Git
action.

## Source authority

Use current executable code and tests first, then checked-in configuration,
applicable repository instructions, and maintained documentation. Label derived
conclusions as inference. Record the branch and full commit SHA for conclusions
that depend on repository state.

Repository notes and skill references can lag the current implementation. Recheck
the owning code and tests before using them to change behavior.

## Project boundary

The default project boundary is the current `RepoKan/continue` checkout and the
materials the user explicitly supplies for this task. Access to another account,
repository, connector, or service does not add it to the evidence boundary.

Keep Project-owned K Knowledge skill content byte-aligned across these locations
when the corresponding mirror exists:

- `.continue/skills/k-knowledge-support/`
- `.claude/skills/k-knowledge-support/`
- `plugins/k-knowledge-support/skills/k-knowledge-support/`

## Change controls

Use a feature branch for repository mutations unless direct work on `main` is
explicitly authorized. Inspect the complete base-to-head diff and validate the
exact head SHA. Treat commits, pushes, merges, branch deletion, releases, CI
reruns, published comments or reviews, and permission or protection changes as
separate authorized actions.

Apply the public repository data boundary before any repository or GitHub write.
