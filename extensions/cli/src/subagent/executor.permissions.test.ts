import { expect, test, vi } from "vitest";

import { services } from "../services/index.js";
import { serviceContainer } from "../services/ServiceContainer.js";
import type { ModelServiceState } from "../services/types.js";
import { streamChatResponse } from "../stream/streamChatResponse.js";

import { executeSubAgent } from "./executor.js";
import { getSubagentContext } from "./sessionContext.js";

vi.mock("../services/index.js", () => ({
  services: {
    toolPermissions: {
      isHeadless: vi.fn(() => false),
      getState: vi.fn(() => ({
        currentMode: "normal",
        permissions: {
          policies: [{ tool: "Bash", permission: "exclude" }],
        },
      })),
    },
    systemMessage: {
      getSystemMessage: vi.fn(async () => "Synthetic parent instructions"),
    },
    chatHistory: {
      isReady: vi.fn(() => true),
    },
  },
}));
vi.mock("../services/ServiceContainer.js", () => ({
  serviceContainer: { get: vi.fn(), set: vi.fn() },
}));
vi.mock("../stream/streamChatResponse.js", () => ({
  streamChatResponse: vi.fn(async () => ""),
}));
vi.mock("../util/cli.js", () => ({
  escapeEvents: { on: vi.fn(), removeListener: vi.fn() },
}));
vi.mock("../util/logger.js", () => ({
  logger: { debug: vi.fn(), error: vi.fn() },
}));

test("executeSubAgent does not elevate or replace parent permissions", async () => {
  const originalPolicies = [
    { tool: "Bash", permission: "exclude" },
    { tool: "Write", permission: "ask" },
  ];
  vi.mocked(services.toolPermissions.getState).mockReturnValue({
    currentMode: "normal",
    permissions: { policies: originalPolicies },
  } as ReturnType<typeof services.toolPermissions.getState>);

  let observedPermission: string | undefined;
  vi.mocked(streamChatResponse).mockImplementation(async () => {
    observedPermission = getSubagentContext()?.permissions.policies[0]?.permission;
    return "";
  });

  const result = await executeSubAgent({
    agent: {
      model: { name: "synthetic-agent" },
      llmApi: {},
    } as unknown as ModelServiceState,
    prompt: "Synthetic no-secret task",
    parentSessionId: "test-session",
    abortController: new AbortController(),
  });

  expect(result.success).toBe(true);
  expect(vi.mocked(streamChatResponse)).toHaveBeenCalledOnce();
  expect(observedPermission).toBe("exclude");
  expect(getSubagentContext()).toBeUndefined();
  expect(vi.mocked(serviceContainer.set)).not.toHaveBeenCalled();
  expect(vi.mocked(serviceContainer.get)).not.toHaveBeenCalled();
  expect(services.toolPermissions.getState().permissions.policies).toEqual(
    originalPolicies,
  );
});

test("executeSubAgent keeps concurrent system instructions separate", async () => {
  const observed = new Map<string, string>();
  vi.mocked(streamChatResponse).mockImplementation(async (_history, model) => {
    await Promise.resolve();
    observed.set(model.name || "unknown", getSubagentContext()?.systemMessage ?? "");
    return "";
  });
  const baseline = services.systemMessage.getSystemMessage;
  const makeChild = (name: string) =>
    executeSubAgent({
      agent: {
        model: { name, chatOptions: { baseSystemMessage: "SYSTEM-" + name } },
        llmApi: {},
      } as unknown as ModelServiceState,
      prompt: "Synthetic child prompt",
      parentSessionId: "synthetic-parent",
      abortController: new AbortController(),
    });

  const results = await Promise.all([makeChild("A"), makeChild("B")]);
  expect(results.every((result) => result.success)).toBe(true);
  expect(observed.get("A")).toContain("SYSTEM-A");
  expect(observed.get("A")).not.toContain("SYSTEM-B");
  expect(observed.get("B")).toContain("SYSTEM-B");
  expect(observed.get("B")).not.toContain("SYSTEM-A");
  expect(services.systemMessage.getSystemMessage).toBe(baseline);
  expect(getSubagentContext()).toBeUndefined();
});
