---
name: Dependency Security Review
description: Review dependency changes for security implications and breaking changes
---

# Dependency Security Review

Review this pull request for dependency changes. Follow GOV-006, GOV-010, GOV-015, and GOV-016 in `.continue/rules/engineering-governance.md`. A significant portion of PRs in this repo are automated dependency bumps (Dependabot, Snyk); assess the candidate and its target-base security delta.

## What to Check

### For Any `package.json` Changes

1. **New dependencies** - For each newly added dependency:

   - Is it well-maintained (not abandoned)?
   - Does it have known vulnerabilities?
   - Is it the right choice, or does an existing dependency already cover this use case?
   - Is the version pinned appropriately (exact vs range)?

2. **Major version bumps** - For major version upgrades:

   - Are there breaking changes that affect our usage?
   - Have the callers been updated to match the new API?

3. **Removed dependencies** - For each removed dependency:
   - Are all imports/requires of this dependency also removed?
   - Is there a replacement, or was the functionality dropped?

### For `package-lock.json` Changes

1. **Large lockfile diffs** (>500 lines changed) - Flag for human review, as they may indicate a transitive dependency shift that warrants attention.

2. **New transitive dependencies** - Check if the total dependency count increased significantly.

### Security-Specific Concerns

1. **Packages with filesystem/network access** - New dependencies that read/write files or make network requests deserve extra scrutiny since this tool runs locally on user machines.

2. **Native/binary dependencies** - New native modules (`node-gyp`, `.node` binaries) increase the attack surface and build complexity.

3. **Post-install scripts** - Dependencies with `postinstall` scripts can execute arbitrary code during `npm install`.

## Review Output

- Findings-only: do not edit manifests/lockfiles, comment on the PR, commit, push, or merge.
- For each concern, identify the package/version, affected path, evidence, baseline/new status, impact, and focused mitigation.
- If dependency files were not changed and no relevant dependency behavior is implicated, report `NOT APPLICABLE` for this check.
