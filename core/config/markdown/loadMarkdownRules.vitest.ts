import { describe, expect, it, vi } from "vitest";
import { IDE } from "../..";
import { loadMarkdownRules } from "./loadMarkdownRules";

vi.mock("../loadLocalAssistants", () => ({
  getAllDotContinueDefinitionFiles: vi.fn().mockResolvedValue([]),
}));

const createIde = (files: Record<string, string>) =>
  ({
    getWorkspaceDirs: vi.fn().mockResolvedValue(["file:///workspace"]),
    fileExists: vi.fn(async (uri: string) =>
      Object.prototype.hasOwnProperty.call(files, uri),
    ),
    readFile: vi.fn(async (uri: string) => files[uri] ?? ""),
  }) as unknown as IDE;

describe("loadMarkdownRules agent file fallback", () => {
  it("continues to AGENT.md when AGENTS.md is absent", async () => {
    const ide = createIde({
      "file:///workspace/AGENT.md":
        "---\nname: Fallback Agent\ndescription: Fallback test\n---\nUse the fallback file.",
    });

    const { rules } = await loadMarkdownRules(ide);
    const agentFileRule = rules.find((rule) => rule.source === "agentFile");

    expect(ide.fileExists).toHaveBeenNthCalledWith(
      1,
      "file:///workspace/AGENTS.md",
    );
    expect(ide.fileExists).toHaveBeenNthCalledWith(
      2,
      "file:///workspace/AGENT.md",
    );
    expect(agentFileRule?.name).toBe("Fallback Agent");
    expect(agentFileRule?.rule).toContain("Use the fallback file.");
  });

  it("uses the first existing supported agent file", async () => {
    const ide = createIde({
      "file:///workspace/AGENTS.md":
        "---\nname: Primary Agent\ndescription: Primary test\n---\nUse the primary file.",
      "file:///workspace/AGENT.md":
        "---\nname: Fallback Agent\ndescription: Fallback test\n---\nUse the fallback file.",
    });

    const { rules } = await loadMarkdownRules(ide);
    const agentFileRules = rules.filter((rule) => rule.source === "agentFile");

    expect(agentFileRules).toHaveLength(1);
    expect(agentFileRules[0].name).toBe("Primary Agent");
    expect(ide.readFile).toHaveBeenCalledTimes(1);
  });
});
