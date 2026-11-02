import { readFile } from "node:fs/promises";
import { markdownToRule } from "@continuedev/config-yaml";
import { describe, expect, it } from "vitest";
import { RuleWithSource } from "../..";
import { shouldApplyRule } from "./getSystemMessageWithRules";

const readProjectRule = async (fileName: string): Promise<RuleWithSource> => {
  const content = await readFile(
    new URL(`../../../.continue/rules/${fileName}`, import.meta.url),
    "utf8",
  );
  const sourceFile = `/repo/.continue/rules/${fileName}`;
  return {
    ...markdownToRule(content, {
      uriType: "file",
      fileUri: `file://${sourceFile}`,
    }),
    source: "rules-block",
    sourceFile,
  };
};

describe("project governance rule activation", () => {
  it("always applies the canonical governance rule", async () => {
    const rule = await readProjectRule("engineering-governance.md");

    expect(rule.alwaysApply).toBe(true);
    expect(shouldApplyRule(rule, [])).toBe(true);
  });

  it("always applies payment governance so its domain condition is evaluated", async () => {
    const rule = await readProjectRule("payment-production-governance.md");

    expect(rule.alwaysApply).toBe(true);
    expect(shouldApplyRule(rule, [])).toBe(true);
  });

  it("matches top-level and nested Markdown docs but excludes unrelated files", async () => {
    const rule = await readProjectRule("documentation-standards.md");

    expect(shouldApplyRule(rule, ["docs/getting-started.md"])).toBe(true);
    expect(shouldApplyRule(rule, ["docs/guides/auth.mdx"])).toBe(true);
    expect(shouldApplyRule(rule, ["gui/src/App.tsx"])).toBe(false);
  });

  it("always applies Continue specificity without a malformed glob", async () => {
    const rule = await readProjectRule("continue-specificity.md");

    expect(rule.alwaysApply).toBe(true);
    expect(shouldApplyRule(rule, [])).toBe(true);
  });
});
