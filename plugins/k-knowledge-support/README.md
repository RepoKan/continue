# K Knowledge Support

Evidence-backed project inspection and engineering support for the
`RepoKan/continue` fork. The package is a skills-only plugin; it does not run a
service or add a user interface.

## Included skill

- `k-knowledge-support` — inspects architecture, diagnoses defects, plans and
  implements scoped changes, selects repository checks, and captures reusable
  project knowledge when requested.

## Use in this repository

The repository marketplace is defined in `.agents/plugins/marketplace.json`,
and `.codex/config.toml` enables `k-knowledge-support@repokan-projects` for this
trusted project. Restart the ChatGPT desktop app after checking out the branch,
then open the repository and use a prompt such as:

> Use $k-knowledge-support to inspect config reload and explain the end-to-end
> flow with repository evidence.

The skill can also activate from a matching request without naming it directly.

## Add the repository marketplace

For a separate checkout or team environment, add the repository as a tracked
marketplace source:

```bash
codex plugin marketplace add RepoKan/continue --ref codex/k-knowledge-support-skill
```

Use `main` instead of the feature branch after the change is merged. Local and
repository marketplaces are supported authoring and team-distribution sources;
availability can vary by OpenAI surface.

## GitHub access

The OpenAI metadata declares the GitHub MCP dependency used when a local
checkout is unavailable. Authentication remains controlled by the user's
connected GitHub account and repository permissions. The skill limits that
fallback to `RepoKan/continue` and does not mutate GitHub unless the user asks
for a change.

## Compatibility

- `plugin.json` is the portable Agent Plugins manifest.
- `.codex-plugin/plugin.json` is the supported Codex compatibility manifest.
- `skills/k-knowledge-support/agents/openai.yaml` supplies OpenAI presentation
  metadata and the optional GitHub tool dependency.
- `.continue/skills/k-knowledge-support/` remains the Continue-native copy.

When changing the skill, keep the Continue-native and plugin copies aligned,
validate both copies, and bump the plugin version before distribution.
