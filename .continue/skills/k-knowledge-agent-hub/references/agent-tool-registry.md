# K Knowledge Supporting - Agent Tool Registry

## Scope

This registry is project-local to `K Knowledge Supporting`. It records downloaded agent/tool packages that were actually detected in the runtime and maps them to callable MCP tool definitions or Skill routing modes.

## Registered downloaded items

| Item                                            | Detected source type                                         | Project tool                                             | Runtime status                            |
| ----------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- | ----------------------------------------- |
| Android Compose APK Reviewer                    | Valid Skill package with `SKILL.md` and `agents/openai.yaml` | `android_apk_review_agent`                               | Definition registered                     |
| Banking Payment System Specialist V3 Enterprise | Agent/persona Markdown profile                               | `banking_payment_specialist`                             | Definition registered                     |
| Payment EDC Global MCP                          | MCP package                                                  | `payment_project_guideline`, `android_payment_checklist` | Definition registered                     |
| AMD Local AI Qwen Coder                         | Staged local-AI package                                      | `amd_local_ai_coder`                                     | Staged only; model/runtime not downloaded |

## Governance

- Use Production source code first.
- Then use approved Host/EMV/TLE/TMS specifications, Production logs/device evidence, and certified vendor SDK documentation.
- Downloaded agent guidance is advisory and cannot override Production evidence.
- Never emit or persist PAN, Track 2, PIN block, keys, signing secrets, private certificates, or credentials.
- Do not claim a build, payment flow, or local-AI execution succeeded without execution evidence.

## Registration boundary

This directory provides the project-local registry, MCP server, MCP config, and Skill package. ChatGPT cannot hot-load a newly created local MCP server as a callable connector inside the already-running conversation. To surface these MCP tools in a compatible client, import `mcp/k-knowledge-agent-tools.mcp.json`. To surface the orchestration behavior as a ChatGPT Skill, upload/install the packaged `skill.zip` through the supported Skills UI/workflow.
