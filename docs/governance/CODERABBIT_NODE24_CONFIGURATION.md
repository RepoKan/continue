# CodeRabbit configuration and Node 24

KKS pins Node.js `24.22.2` in `.node-version` and `.nvmrc`. This is an
intentional migration from the historical Node 20 baseline; historical RCA
results remain historical. The full `@coderabbitai/config` SDK is pinned to
`1.1.5`, resolved from the official npm `next` tag. Node 24 test declarations
are pinned separately. Existing TypeScript tooling is reused.

The root `.coderabbit.config.ts` uses the official SDK factory context and
`CodeRabbitConfig` type. Hosted and unknown invocations are assertive. A known
CLI invocation may be chill only with complete, resolved, nonempty ordinary
changed paths and known branches, outside main/default/release targets and
hotfix branches or labels. Source, governance, toolchain, dependency, CI,
malformed and unknown file kinds remain assertive. The SDK supplies both old
and new paths for renames; both are checked. Automatic approvals are always
disabled, reviews use `en-US`, and poems are disabled.

The configuration performs no network or environment access and uses no remote
includes. It preserves local-first profiles, MCP/tools, configuration reload and
the VS Code, CLI and IntelliJ contracts. It adds no authentication, telemetry or
remote synchronization. IntelliJ retains runtime Java `24.0.2`, compiler JVM17
and Gradle wrapper `8.14.3`.

## Validate

From the repository root on the pinned Node version:

```bash
npm ci
npm run typecheck:coderabbit
npm run test:coderabbit
```

The dedicated read-only CI workflow checks the exact PR head. The behavior tests
exercise ordinary CLI, hosted/unknown/null contexts, unavailable/unsupported
metadata, sensitive paths, renames, release/hotfix handling, disabled approvals
and output isolation. No replacement SDK types or type suppressions are used.

## Configuration precedence

The four root YAML candidates `.coderabbit.yaml`, `.coderabbit.yml`,
`coderabbit.yaml` and `coderabbit.yml` were absent when introducing the TypeScript
configuration. Each would take precedence over it; a regression test rejects
their accidental introduction. Organization/UI settings and global overrides
can also affect hosted evaluation. Their effective values are not established
by local typechecks or a PR's existence. Hosted activation must be checked
separately after the configuration is reviewed, without bypassing review gates.

Official references:

- https://docs.coderabbit.ai/llms.txt
- https://docs.coderabbit.ai/configuration/typescript-configuration
- https://nodejs.org/dist/index.json

Publication, snapshot restoration and Project attachment are separate host
operations. Local tests and GitHub checks do not prove any of them succeeded.
