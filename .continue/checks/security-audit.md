---
name: Security Audit
description: Security Audit
---

Review this pull request for security findings introduced by the candidate. Follow GOV-005, GOV-008, GOV-015, and GOV-016 in `.continue/rules/engineering-governance.md`.

Start with the diff, then inspect only the callers, dependencies, configuration, permissions, and data paths needed to assess a demonstrated security boundary. In particular, consider prompt injection and local-machine exposure in the extension/CLI where relevant. Separate introduced findings from baseline findings.

This is a findings-only review: do not edit files, commit, push, create a PR, or merge. For every finding include the affected path/location, trust boundary, evidence, impact, severity, and a focused mitigation. A clean process exit or unchanged advisory count is not a security verdict. Mark missing evidence as HOLD/UNDETERMINED rather than assuming safety.
