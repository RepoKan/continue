import { defineConfig, type CodeRabbitConfig } from "@coderabbitai/config";

const sensitivePrefixes = [
  "activation/",
  "docs/governance/",
  ".continue/",
  ".claude/",
  "plugins/",
  ".github/",
  "scripts/",
  "packages/",
  "core/",
  "extensions/",
];

function ordinaryPath(path: string): boolean {
  if (typeof path !== "string" || path.trim() !== path || !path) return false;
  // Require canonical repository-relative paths; never hide sensitive components.
  if (
    path.startsWith("/") ||
    /[\\\x00-\x1f:]/.test(path) ||
    path.split("/").some((part) => !part || part === "." || part === "..")
  )
    return false;
  const normalized = path.toLowerCase();
  if (sensitivePrefixes.some((prefix) => normalized.startsWith(prefix)))
    return false;
  const basename = normalized.split("/").at(-1) ?? "";
  if (
    /^(agents\.md|\.nvmrc|\.node-version|package\.json|package-lock\.json)$/.test(
      basename,
    ) ||
    /^\.?coderabbit(?:[.-].*)?$/.test(basename) ||
    /(^|[.-])(gradle|tsconfig|build)([.-]|$)/.test(basename)
  )
    return false;
  // Source, dependency, CI and unknown file kinds require assertive review.
  return /\.(md|txt|rst|adoc|png|jpe?g|gif|webp)$/.test(basename);
}

export default defineConfig((ctx) => {
  const pr = ctx.pr;
  const ordinaryCli =
    ctx.invocation?.source === "cli" &&
    typeof ctx.repo?.defaultBranch === "string" &&
    ctx.repo.defaultBranch.length > 0 &&
    pr !== null &&
    typeof pr?.baseBranch === "string" &&
    /^[\w][\w/.-]*$/.test(pr.baseBranch) &&
    typeof pr.headBranch === "string" &&
    /^[\w][\w/.-]*$/.test(pr.headBranch) &&
    pr.baseBranch !== ctx.repo.defaultBranch &&
    !/^(?:refs\/heads\/)?(?:main|master|trunk|releases?(?:[\/._-].*)?)$/i.test(
      pr.baseBranch,
    ) &&
    !/(^|[\/._-])hotfix([\/._-]|$)/i.test(pr.headBranch) &&
    Array.isArray(pr.labels) &&
    !pr.labels.some(
      (label) => typeof label !== "string" || /hotfix/i.test(label),
    ) &&
    pr.changedFiles?.status === "resolved" &&
    Array.isArray(pr.changedFiles.paths) &&
    pr.changedFiles.paths.length > 0 &&
    pr.changedFiles.paths.every(ordinaryPath);

  return {
    language: "en-US",
    reviews: {
      profile: ordinaryCli ? "chill" : "assertive",
      poem: false,
      auto_approvals: { enabled: false },
      path_instructions: [
        {
          path: "**",
          instructions:
            "Use current code and tests at the exact reviewed revision. Distinguish historical evidence and NOT TESTED from current passes. Preserve local-first profiles without Hub sign-in, MCP and agent tools, config reload, and VS Code/CLI/IntelliJ contracts. Introduce no PostHog/Sentry traffic, authentication, remote sync or secrets. Apply AGENTS.md and applicable .continue/rules/.",
        },
        {
          path: "{AGENTS.md,activation/**,docs/governance/**,.continue/**,.claude/**,plugins/**}",
          instructions:
            "Apply the governance entry documents at this exact reviewed revision, including Project inheritance, value proposition and public repository data boundaries. Keep existing KKS skill mirrors aligned. Do not rewrite historical RCA evidence as a current result.",
        },
        {
          path: "extensions/intellij/**",
          instructions:
            "Preserve Java/javac 24.0.2 runtime, separate JVM17 compiler and Gradle wrapper8.14.3. Require current fresh XML test counts; cached/up-to-date tasks are not executed tests.",
        },
        {
          path: "extensions/cli/**",
          instructions:
            "Validate the intentional pinned Node24 migration against actual current CLI typecheck, syntax, focused and full tests. Preserve local profiles, MCP/tools and reload/integration contracts.",
        },
        {
          path: ".github/**",
          instructions:
            "Use trusted workflow refs, least privilege and verify the exact reviewed head SHA. Do not expose credentials to untrusted code or bypass checks, approvals or branch protections.",
        },
        {
          path: "**/package-lock.json",
          instructions:
            "Use deterministic npm ci. Keep dependency and lock changes limited to the explicitly authorized CodeRabbit SDK and Node24 migration; preserve integrity hashes and reject unrelated upgrades.",
        },
      ],
    },
  } satisfies CodeRabbitConfig;
});
