import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import config from "../.coderabbit.config.ts";

type Context = Parameters<typeof config>[0];
function context(): Context {
  return {
    invocation: { source: "cli" },
    platform: "cli",
    org: null,
    repo: {
      owner: "RepoKan",
      name: "continue",
      fullName: "RepoKan/continue",
      language: "TypeScript",
      isPrivate: false,
      isSelfHosted: false,
      defaultBranch: "main",
      topics: { status: "unsupported", names: [] },
      customProperties: { status: "unsupported", values: {} },
    },
    pr: {
      number: 1,
      title: "Docs",
      baseBranch: "develop",
      headBranch: "docs/guide",
      author: "contributor",
      authorAssociation: null,
      labels: [],
      isDraft: false,
      authorGroups: { status: "unsupported", groups: [] },
      changedFiles: { status: "resolved", paths: ["docs/guide.md"] },
    },
  };
}
test("complete ordinary CLI metadata permits chill without approvals", async () => {
  const result = await config(context());
  assert.equal(result.reviews?.profile, "chill");
  assert.equal(result.reviews?.auto_approvals?.enabled, false);
  assert.equal(result.reviews?.poem, false);
  assert.equal(result.language, "en-US");
});
test("hosted and unknown invocations remain assertive", async () => {
  for (const source of ["review", "unknown", undefined]) {
    const ctx = context();
    const fixture: unknown = {
      ...ctx,
      invocation: source ? { source } : undefined,
    };
    assert.equal(
      (await config(fixture as Context)).reviews?.profile,
      "assertive",
    );
  }
});
test("null PR and unavailable, unsupported, absent or empty paths fail closed", async () => {
  assert.equal(
    (await config({ ...context(), pr: null })).reviews?.profile,
    "assertive",
  );
  for (const changedFiles of [
    undefined,
    { status: "unavailable", paths: ["docs/guide.md"] },
    { status: "unsupported", paths: [] },
    { status: "resolved", paths: [] },
  ]) {
    const ctx = context();
    const fixture: unknown = { ...ctx, pr: { ...ctx.pr, changedFiles } };
    assert.equal(
      (await config(fixture as Context)).reviews?.profile,
      "assertive",
    );
  }
});
const sensitive = [
  "activation/guide.md",
  "docs/governance/policy.md",
  ".continue/rule.md",
  ".claude/rule.md",
  "plugins/help.md",
  ".github/help.md",
  "scripts/help.md",
  "packages/help.md",
  "core/help.md",
  "extensions/help.md",
  "AGENTS.md",
  "docs/AGENTS.md",
  ".nvmrc",
  ".node-version",
  "package.json",
  "package-lock.json",
  ".coderabbit.yaml",
  ".coderabbit.yml",
  "coderabbit.yaml",
  "coderabbit.yml",
  ".coderabbit.config.ts",
  "docs/tsconfig.json",
  "docs/build.md",
  "build.gradle.kts",
  "gui/source.ts",
  "gui/source.js",
  "docs/component.mdx",
  "ci/config.yml",
  "unknown.bin",
];
for (const path of sensitive) {
  test(`sensitive/source/toolchain/dependency path stays assertive: ${path}`, async () => {
    const ctx = context();
    assert.ok(ctx.pr);
    const result = await config({
      ...ctx,
      pr: { ...ctx.pr, changedFiles: { status: "resolved", paths: [path] } },
    });
    assert.equal(result.reviews?.profile, "assertive");
    assert.equal(result.reviews?.auto_approvals?.enabled, false);
  });
}
test("renames inspect both previous and current paths", async () => {
  for (const paths of [
    ["core/old.md", "docs/new.md"],
    ["docs/old.md", "activation/new.md"],
    ["docs/old.md", "docs/new.md"],
  ]) {
    const ctx = context();
    assert.ok(ctx.pr);
    assert.equal(
      (
        await config({
          ...ctx,
          pr: { ...ctx.pr, changedFiles: { status: "resolved", paths } },
        })
      ).reviews?.profile,
      paths.every((path) => path.startsWith("docs/")) ? "chill" : "assertive",
    );
  }
});
test("release/main targets, hotfixes and incomplete branch or label metadata stay assertive", async () => {
  const ctx = context();
  assert.ok(ctx.pr);
  for (const patch of [
    { baseBranch: "main" },
    { baseBranch: "release" },
    { baseBranch: "release/1" },
    { baseBranch: "refs/heads/main" },
    { baseBranch: "" },
    { baseBranch: " main " },
    { headBranch: "" },
    { headBranch: "fix/hotfix-urgent" },
    { labels: ["HOTFIX"] },
    { labels: undefined },
  ]) {
    const fixture: unknown = { ...ctx, pr: { ...ctx.pr, ...patch } };
    assert.equal(
      (await config(fixture as Context)).reviews?.profile,
      "assertive",
    );
  }
});
test("noncanonical or malformed paths stay assertive", async () => {
  for (const path of [
    "",
    " ",
    "/docs/a.md",
    "docs/../AGENTS.md",
    "./docs/a.md",
    "docs//a.md",
    "docs\\a.md",
    "docs/a.md\n",
    "C:/docs/a.md",
  ]) {
    const ctx = context();
    assert.ok(ctx.pr);
    assert.equal(
      (
        await config({
          ...ctx,
          pr: {
            ...ctx.pr,
            changedFiles: { status: "resolved", paths: [path] },
          },
        })
      ).reviews?.profile,
      "assertive",
    );
  }
});
test("each evaluation isolates output mutations and never enables approvals", async () => {
  const first = await config(context());
  assert.ok(first.reviews?.path_instructions);
  first.reviews.path_instructions.length = 0;
  if (first.reviews.auto_approvals) first.reviews.auto_approvals.enabled = true;
  const second = await config(context());
  assert.equal(second.reviews?.path_instructions?.length, 6);
  assert.equal(second.reviews?.auto_approvals?.enabled, false);
});
test("TS configuration is unshadowed and has no remote/network/secret imports", () => {
  for (const name of [
    ".coderabbit.yaml",
    ".coderabbit.yml",
    "coderabbit.yaml",
    "coderabbit.yml",
  ])
    assert.equal(
      existsSync(new URL(`../${name}`, import.meta.url)),
      false,
      name,
    );
  const source = readFileSync(
    new URL("../.coderabbit.config.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /includeRemote|fetch\(|process\.env|node:|https?:\/\//,
  );
});

test("unknown default branch and any known default target remain assertive", async () => {
  const ctx = context();
  for (const defaultBranch of ["", "develop"]) {
    assert.equal(
      (await config({ ...ctx, repo: { ...ctx.repo, defaultBranch } })).reviews
        ?.profile,
      "assertive",
    );
  }
});
