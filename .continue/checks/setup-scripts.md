---
name: Setup Scripts
description: Review setup-script impact
---

Review whether the pull request changes setup or build prerequisites, such as package managers, build steps, or the local development environment. Follow GOV-004, GOV-007, GOV-008, GOV-009, and GOV-016 in `.continue/rules/engineering-governance.md`. Report the affected setup scripts and proposed changes with evidence; do not edit files, commit, push, or change the PR during review. Do not mark a change out of scope solely because its file type is documentation or source code; assess its effect on setup behavior. Implement only when the user explicitly requests and authorizes the change.

The most relevant setup scripts (all in the scripts/ folder) are:

- `install-dependencies.sh` and `install-dependencies.ps1`, both of which are intended to take a user from a fresh clone to a fully set up development environment
- `build-packages.js`, which builds everything in the `packages` folder
