# Project map

This baseline was inspected at commit `5522c6f44ca0ac3528b37244818fbfa39b5af470` on 2026-09-10. Verify the current `HEAD` and inspect changed areas before relying on it.

- Repository: `RepoKan/continue`
- Canonical URL: `https://github.com/RepoKan/continue`
- Default branch: `main`

## Source-of-truth order

1. Current code and tests
2. Package and build configuration
3. `.continue/rules/` and applicable `AGENTS.md`
4. Maintained documentation
5. `TESTING.md`, which records a completed historical regression checklist and is not a substitute for rerunning tests

## Major areas

| Area                                    | Responsibility                                                                            | Useful starting points                                                               |
| --------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `core/`                                 | Shared agent, configuration, model, context, indexing, protocol, and tool logic           | `core/core.ts`, `core/config/`, `core/protocol/`, `core/tools/`, `core/llm/`         |
| `gui/`                                  | React/Vite user interface shared by IDE integrations                                      | `gui/src/`, `gui/src/redux/`, `gui/src/pages/`, `gui/src/components/`                |
| `extensions/vscode/`                    | VS Code extension host, commands, webview bridge, packaging, and E2E tests                | `extensions/vscode/src/`, `extensions/vscode/package.json`                           |
| `extensions/cli/`                       | `cn` command, TUI/headless modes, tools, hooks, permissions, sessions, and slash commands | `extensions/cli/src/index.ts`, `src/commands/`, `src/tools/`, `src/slashCommands.ts` |
| `extensions/intellij/`                  | JetBrains integration in Kotlin, backed by the packaged core binary                       | `extensions/intellij/src/`, `extensions/intellij/build.gradle.kts`                   |
| `packages/config-types/`                | Shared configuration types                                                                | `packages/config-types/src/`                                                         |
| `packages/config-yaml/`                 | YAML/Markdown parsing, schemas, and config validation                                     | `packages/config-yaml/src/`                                                          |
| `packages/openai-adapters/`             | Provider adapters, including AI SDK and DeepSeek integration                              | `packages/openai-adapters/src/index.ts`, `src/apis/`, `src/types.ts`                 |
| `packages/terminal-security/`           | Terminal command security evaluation                                                      | `packages/terminal-security/src/`                                                    |
| `packages/fetch/`, `packages/llm-info/` | Shared network and model metadata packages                                                | Each package's `src/` and `package.json`                                             |
| `binary/`                               | Bundles core TypeScript and native assets for IDE/platform use                            | `binary/build.js`, `binary/README.md`                                                |
| `sync/`                                 | Rust/Neon codebase-sync native module                                                     | `sync/Cargo.toml`, `sync/src/`                                                       |
| `docs/`, `docs-site/`                   | Product documentation and its site                                                        | `docs/docs.json`, `docs/`, `docs-site/`                                              |

## Skill behavior in this repository

- CLI discovery order includes project `.continue/skills`, project `.claude/skills`, and global `~/.continue/skills`.
- IDE/core discovery also reads project and global Continue skill definitions plus `.claude/skills`.
- Each immediate child directory must contain `SKILL.md`.
- Frontmatter requires non-empty `name` and `description` strings.
- Files beside `SKILL.md` are listed as supporting skill files and can be read on demand.
- The CLI normalizes this skill to the slash command `/skill-k-knowledge-support`.

### Knowledge mirror governance

- Treat `.continue/skills/<skill-name>/` as the authoritative Project-owned skill source.
- Treat `.claude/skills/<skill-name>/` as the Claude runtime mirror for every Project-owned skill with a corresponding `.continue/skills/<skill-name>/` source.
- **Remark:** if `.continue/skills/k-knowledge-support/**` changes, the same candidate change must update `.claude/skills/k-knowledge-support/**`. `Claude Skill Mirror Validation` is expected to fail on a missing mirror, file-set drift, or byte drift. This failure is intentional and prevents knowledge drift between ChatGPT/Continue and Claude.
- Keep the packaged `plugins/k-knowledge-support/skills/k-knowledge-support/` copy synchronized when the skill is distributed through the plugin.
- Claude-native skills that have no Project-owned `.continue/skills/<skill-name>/` source, such as `docs-style`, are not reverse-mirrored into `.continue/skills`.
- Do not bypass or weaken the mirror gate to make CI green; update the authoritative source and mirrors together, then validate the exact head SHA.

Relevant implementation:

- `extensions/cli/src/util/loadMarkdownSkills.ts`
- `core/config/markdown/loadMarkdownSkills.ts`
- `extensions/cli/src/tools/skills.ts`
- `extensions/cli/src/slashCommands.ts`
- `.github/workflows/claude-skill-mirror-validation.yml`

## Fork invariants

`README.md` identifies the original Continue repository as read-only. At the inspected baseline, the RepoKan fork's `main` commit matches upstream `main`.

`TESTING.md` documents the local-first behavior that prior work intentionally preserved:

- no Hub sign-in during fresh onboarding;
- local profiles and config loading;
- `.env`-based API key resolution;
- config reload without restart;
- no PostHog or Sentry network calls;
- working agent tools and MCP servers;
- working VS Code and IntelliJ startup paths.

Treat those points as regression-sensitive, but confirm them against current code and tests for any new change.

## Dependency observation

The root `package.json` and lockfile declare `@ai-sdk/deepseek`, while the provider implementation and its own dependency also live in `packages/openai-adapters/`. Do not assume the root declaration is the only or canonical source.

## Sensitive configuration

`BUILD_DEPENDENCIES.md` lists environment-variable and secret names for publishing, providers, CI, signing, and integration tests. It does not contain usable secret values. Never print values sourced from those variables in logs or output.
