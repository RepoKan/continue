import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./loadMarkdownSkills.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./loadMarkdownSkills.js")>();
  return {
    ...mod,
  };
});

vi.mock("../env.js", () => ({
  env: {
    continueHome: "/mock/home/.continue",
  },
}));

describe("loadMarkdownSkills", () => {
  let tmpDir: string;
  let originalCwd: string;
  let fs: typeof import("fs");
  let path: typeof import("path");
  let loadMarkdownSkills: typeof import("./loadMarkdownSkills.js").loadMarkdownSkills;

  beforeEach(async () => {
    fs = await import("fs");
    path = await import("path");
    const mod = await import("./loadMarkdownSkills.js");
    loadMarkdownSkills = mod.loadMarkdownSkills;

    originalCwd = process.cwd();
    const os = await import("os");
    tmpDir = path.join(os.tmpdir(), "skills-test");
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty skills when no skills directories exist", async () => {
    const result = await loadMarkdownSkills();
    expect(result.skills).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("loads a valid skill with files from .continue/skills", async () => {
    const skillDir = path.join(tmpDir, ".continue", "skills", "my-skill");
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      `---
name: Test Skill
description: A test skill
---

# Test Skill Content

This is the skill body.
`,
    );
    fs.writeFileSync(path.join(skillDir, "helper.ts"), "// helper code");
    fs.writeFileSync(path.join(skillDir, "data.json"), "{}");

    const result = await loadMarkdownSkills();
    expect(result.errors).toEqual([]);
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].name).toBe("Test Skill");
    expect(result.skills[0].description).toBe("A test skill");
    expect(result.skills[0].content).toContain("Test Skill Content");
    expect(result.skills[0].files).toHaveLength(2);
    expect(result.skills[0].files).not.toContain(
      expect.stringContaining("SKILL.md"),
    );
  });

  it("prefers project Continue skills over project Claude mirrors by name", async () => {
    const authoritative = path.join(tmpDir, ".continue", "skills", "demo");
    const mirror = path.join(tmpDir, ".claude", "skills", "demo");
    fs.mkdirSync(authoritative, { recursive: true });
    fs.mkdirSync(mirror, { recursive: true });
    const frontmatter = `---\nname: Same Skill\ndescription: Synthetic test\n---\n`;
    fs.writeFileSync(
      path.join(authoritative, "SKILL.md"),
      frontmatter + "authoritative",
    );
    fs.writeFileSync(
      path.join(mirror, "SKILL.md"),
      frontmatter + "mirror",
    );

    const result = await loadMarkdownSkills();
    expect(result.errors).toEqual([]);
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].content).toContain("authoritative");
  });

  it("deduplicates normalized names and resolves Skills lookup variants", async () => {
    const authoritative = path.join(tmpDir, ".continue", "skills", "first");
    const mirror = path.join(tmpDir, ".claude", "skills", "second");
    fs.mkdirSync(authoritative, { recursive: true });
    fs.mkdirSync(mirror, { recursive: true });
    fs.writeFileSync(
      path.join(authoritative, "SKILL.md"),
      '---\nname: Review\ndescription: Synthetic example\n---\nauthoritative skill',
    );
    fs.writeFileSync(
      path.join(mirror, "SKILL.md"),
      '---\nname: " review "\ndescription: Synthetic example\n---\nmirror skill',
    );

    const loaded = await loadMarkdownSkills();
    expect(loaded.skills).toHaveLength(1);
    expect(loaded.skills[0].content).toContain("authoritative skill");

    const { skillsTool } = await import("../tools/skills.js");
    const tool = await skillsTool();
    const result = await tool.run({ skill_name: "  rEvIeW  " });
    expect(result).toContain("<skill_name>Review</skill_name>");
    expect(result).toContain("authoritative skill");
    expect(result).not.toContain("mirror skill");
  });

  it("returns error for invalid frontmatter", async () => {
    const skillDir = path.join(tmpDir, ".continue", "skills", "bad-skill");
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      `---
name: ""
---
Missing description
`,
    );

    const result = await loadMarkdownSkills();
    expect(result.skills).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].fatal).toBe(false);
  });

  it("loads multiple skills from different directories", async () => {
    const skill1Dir = path.join(tmpDir, ".continue", "skills", "skill-1");
    const skill2Dir = path.join(tmpDir, ".continue", "skills", "skill-2");
    fs.mkdirSync(skill1Dir, { recursive: true });
    fs.mkdirSync(skill2Dir, { recursive: true });

    const skillContent = (name: string) => `---
name: ${name}
description: Description for ${name}
---
Content
`;
    fs.writeFileSync(
      path.join(skill1Dir, "SKILL.md"),
      skillContent("Skill One"),
    );
    fs.writeFileSync(
      path.join(skill2Dir, "SKILL.md"),
      skillContent("Skill Two"),
    );

    const result = await loadMarkdownSkills();
    expect(result.skills).toHaveLength(2);
    const names = result.skills.map((s) => s.name).sort();
    expect(names).toEqual(["Skill One", "Skill Two"]);
  });
});

it("normalizes skill names consistently for lookup and deduplication", async () => {
  const mod = await import("./loadMarkdownSkills.js");
  expect(mod.normalizeSkillName("  Review Skill  ")).toBe("review skill");
});
