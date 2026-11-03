import { AssistantUnrolled, ModelConfig } from "@continuedev/config-yaml";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthConfig } from "../auth/workos.js";
import * as config from "../config.js";

import { ModelService } from "./ModelService.js";
import { AgentFileServiceState } from "./types.js";

// Mock the dependencies
vi.mock("../auth/workos.js", () => ({
  getModelName: vi.fn(() => null),
}));

vi.mock("../config.js", () => ({
  createLlmApi: vi.fn(() => ({ provider: "test" })),
  getLlmApi: vi.fn(() => [
    { provider: "test" },
    { provider: "test", name: "default-model" },
  ]),
}));

vi.mock("../util/logger.js", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ModelService agent file model prioritization", () => {
  let modelService: ModelService;
  let mockAssistant: AssistantUnrolled;
  let mockAuthConfig: AuthConfig;
  let mockModels: ModelConfig[];

  beforeEach(() => {
    modelService = new ModelService();

    mockModels = [
      { provider: "anthropic", name: "claude-3-sonnet" } as ModelConfig,
      { provider: "openai", name: "gpt-4" } as ModelConfig,
      { provider: "anthropic", name: "claude-3-haiku" } as ModelConfig,
    ];

    mockAssistant = {
      models: mockModels,
    } as AssistantUnrolled;

    mockAuthConfig = null;

    // Reset mocks
    vi.clearAllMocks();
  });

  it("should prioritize agent file model over default when agent file has model specified", async () => {
    const agentFileServiceState: AgentFileServiceState = {
      agentFile: {
        name: "test-agent",
        model: "gpt-4",
        prompt: "Test agent",
      },
      slug: "test/agent",
      agentFileModel: {
        name: "gpt-4",
        model: "gpt-4",
        provider: "openai",
      },
      parsedRules: null,
      parsedTools: null,
    };

    // Mock createLlmApi to return different models based on the selected model
    const createLlmApiMock = vi.mocked(config.createLlmApi);
    createLlmApiMock.mockImplementation(
      (model: ModelConfig) =>
        ({
          provider: model.provider,
          name: (model as any).name,
        }) as any,
    );

    const result = await modelService.doInitialize(
      mockAssistant,
      mockAuthConfig,
      agentFileServiceState,
    );

    expect(result.model).toEqual(
      expect.objectContaining({
        name: "gpt-4",
        provider: "openai",
      }),
    );

    // Should have called createLlmApi with the agent-file-specified model
    expect(createLlmApiMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "gpt-4" }),
      mockAuthConfig,
    );
  });

  it("keeps the last published configuration after a rejected reload", async () => {
    const { getModelName } = await import("../auth/workos.js");
    vi.mocked(getModelName).mockReturnValue(null);
    const originalAssistant = {
      models: [
        { provider: "openai", model: "first", name: "unique-one" },
        { provider: "anthropic", model: "second", name: "unique-two" },
      ],
    } as AssistantUnrolled;
    await modelService.initialize(originalAssistant, mockAuthConfig, undefined);

    const conflictingAssistant = {
      models: [
        { provider: "openai", model: "third", name: "collision" },
        { provider: "openrouter", model: "fourth", name: "collision" },
        { provider: "anthropic", model: "fifth", name: "other" },
      ],
    } as AssistantUnrolled;
    vi.mocked(getModelName).mockReturnValue("collision");

    await expect(
      modelService.reload(conflictingAssistant, mockAuthConfig, undefined),
    ).rejects.toThrow("Ambiguous model name in configuration");

    expect(modelService.getState().assistant).toBe(originalAssistant);
    expect(modelService.getAvailableChatModels()).toEqual([
      { provider: "openai", name: "unique-one", index: 0 },
      { provider: "anthropic", name: "unique-two", index: 1 },
    ]);
    expect(modelService.isModelNameUnique(0)).toBe(true);
    expect(modelService.isModelNameUnique(1)).toBe(true);
    expect(modelService.isModelNameUnique(2)).toBe(false);

    const switched = await modelService.switchModel(1);
    expect(switched.assistant).toBe(originalAssistant);
    expect(switched.model).toEqual(
      expect.objectContaining({
        name: "unique-two",
        provider: "anthropic",
      }),
    );
  });

  it("rejects duplicate model names rather than restoring the wrong provider", async () => {
    const { getModelName } = await import("../auth/workos.js");
    vi.mocked(getModelName).mockReturnValue("same-name");
    const assistantWithDuplicates = {
      models: [
        {
          provider: "openai",
          model: "first",
          name: "same-name",
          apiKey: "synthetic-key-one",
        },
        {
          provider: "openrouter",
          model: "second",
          name: "same-name",
          apiKey: "synthetic-key-two",
        },
      ],
    } as AssistantUnrolled;

    await expect(
      modelService.doInitialize(
        assistantWithDuplicates,
        mockAuthConfig,
        undefined,
      ),
    ).rejects.toThrow("Ambiguous model name in configuration");
    expect(config.createLlmApi).not.toHaveBeenCalled();
  });

  it("rejects name-only persistence for duplicate selectable models", async () => {
    const { getModelName } = await import("../auth/workos.js");
    vi.mocked(getModelName).mockReturnValue(null);
    const assistantWithDuplicates = {
      models: [
        { provider: "openai", model: "first", name: "same-name" },
        { provider: "openrouter", model: "second", name: "same-name" },
        { provider: "anthropic", model: "third", name: "unique-name" },
      ],
    } as AssistantUnrolled;

    await modelService.doInitialize(
      assistantWithDuplicates,
      mockAuthConfig,
      undefined,
    );

    expect(modelService.isModelNameUnique(0)).toBe(false);
    expect(modelService.isModelNameUnique(1)).toBe(false);
    expect(modelService.isModelNameUnique(2)).toBe(true);
  });

  it("does not persist a model without a stable nonempty name", async () => {
    const { getModelName } = await import("../auth/workos.js");
    vi.mocked(getModelName).mockReturnValue(null);
    const assistant = {
      models: [
        { provider: "openai", model: "synthetic-first" },
        { provider: "anthropic", model: "synthetic-second", name: "" },
        { provider: "openrouter", model: "synthetic-third", name: "named" },
      ],
    } as AssistantUnrolled;

    await modelService.doInitialize(assistant, mockAuthConfig, undefined);

    expect(modelService.isModelNameUnique(0)).toBe(false);
    expect(modelService.isModelNameUnique(1)).toBe(false);
    expect(modelService.isModelNameUnique(2)).toBe(true);
  });

  it("keeps models selectable when legacy persistence blocks initialization", async () => {
    const { getModelName } = await import("../auth/workos.js");
    vi.mocked(getModelName).mockImplementation(() => {
      throw new Error(
        "Legacy global CLI model selection requires an explicit workspace model selection before requests can be routed",
      );
    });

    const createLlmApiMock = vi.mocked(config.createLlmApi);
    createLlmApiMock.mockImplementation(
      (model: ModelConfig) =>
        ({
          provider: model.provider,
          name: (model as any).name,
        }) as any,
    );

    await expect(
      modelService.doInitialize(mockAssistant, mockAuthConfig, undefined),
    ).rejects.toThrow("Legacy global CLI model selection");

    expect(modelService.getAvailableChatModels()).toEqual([
      { provider: "anthropic", name: "claude-3-sonnet", index: 0 },
      { provider: "openai", name: "gpt-4", index: 1 },
      { provider: "anthropic", name: "claude-3-haiku", index: 2 },
    ]);

    await expect(modelService.switchModel(1)).resolves.toEqual(
      expect.objectContaining({
        model: expect.objectContaining({
          provider: "openai",
          name: "gpt-4",
        }),
      }),
    );
  });

  it("should fall back to persisted model when no agent file model is specified", async () => {
    const agentFileServiceState: AgentFileServiceState = {
      agentFile: {
        name: "test-agent",
        prompt: "Test agent file",
        // No model specified
      },
      slug: "test/agent",
      agentFileModel: null,
      parsedRules: null,
      parsedTools: null,
    };

    // Mock getModelName to return a persisted model
    const { getModelName } = await import("../auth/workos.js");
    vi.mocked(getModelName).mockReturnValue("claude-3-sonnet");

    const createLlmApiMock = vi.mocked(config.createLlmApi);
    createLlmApiMock.mockImplementation(
      (model: ModelConfig) =>
        ({
          provider: model.provider,
          name: (model as any).name,
        }) as any,
    );

    const result = await modelService.doInitialize(
      mockAssistant,
      mockAuthConfig,
      agentFileServiceState,
    );

    expect(result.model).toEqual(
      expect.objectContaining({
        name: "claude-3-sonnet",
        provider: "anthropic",
      }),
    );

    expect(createLlmApiMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "claude-3-sonnet" }),
      mockAuthConfig,
    );
  });

  it("should fall back to default model when agent file model is not available", async () => {
    const agentFileServiceState: AgentFileServiceState = {
      agentFile: {
        name: "test-agent",
        model: "non-existent-model", // Model not in available models
        prompt: "Test agent",
      },
      slug: "test/agent",
      agentFileModel: {
        name: "non-existent-model",
        model: "non-existent",
        provider: "nonexistent",
      },
      parsedRules: null,
      parsedTools: null,
    };

    const getLlmApiMock = vi.mocked(config.getLlmApi);
    getLlmApiMock.mockReturnValue([
      { provider: "default" } as any,
      { provider: "anthropic", name: "claude-3-sonnet" } as ModelConfig,
    ]);

    const result = await modelService.doInitialize(
      mockAssistant,
      mockAuthConfig,
      agentFileServiceState,
    );

    expect(result.model).toEqual(
      expect.objectContaining({
        name: "claude-3-sonnet",
        provider: "anthropic",
      }),
    );

    // Should have fallen back to getLlmApi
    expect(getLlmApiMock).toHaveBeenCalledWith(mockAssistant, mockAuthConfig);
  });

  it("should use default model when no agent file exists", async () => {
    const agentFileServiceState: AgentFileServiceState = {
      agentFile: null,
      slug: null,
      agentFileModel: null,
      parsedRules: null,
      parsedTools: null,
    };

    // Make sure getModelName returns null (no persisted model)
    const { getModelName } = await import("../auth/workos.js");
    vi.mocked(getModelName).mockReturnValue(null);

    const getLlmApiMock = vi.mocked(config.getLlmApi);
    getLlmApiMock.mockReturnValue([
      { provider: "default" } as any,
      { provider: "anthropic", name: "claude-3-sonnet" } as ModelConfig,
    ]);

    const result = await modelService.doInitialize(
      mockAssistant,
      mockAuthConfig,
      agentFileServiceState,
    );

    expect(result.model).toEqual(
      expect.objectContaining({
        name: "claude-3-sonnet",
        provider: "anthropic",
      }),
    );

    expect(getLlmApiMock).toHaveBeenCalledWith(mockAssistant, mockAuthConfig);
  });

  it("should prioritize agent file model over persisted model", async () => {
    const agentFileServiceState: AgentFileServiceState = {
      agentFile: {
        name: "test-agent",
        model: "gpt-4", // Agent file specifies gpt-4
        prompt: "Test agent",
      },
      slug: "test/agent",
      agentFileModel: {
        name: "gpt-4",
        model: "gpt-4",
        provider: "openai",
      },
      parsedRules: null,
      parsedTools: null,
    };

    // Mock getModelName to return a different persisted model
    const { getModelName } = await import("../auth/workos.js");
    vi.mocked(getModelName).mockReturnValue("claude-3-haiku");

    const createLlmApiMock = vi.mocked(config.createLlmApi);
    createLlmApiMock.mockImplementation(
      (model: ModelConfig) =>
        ({
          provider: model.provider,
          name: (model as any).name,
        }) as any,
    );

    const result = await modelService.doInitialize(
      mockAssistant,
      mockAuthConfig,
      agentFileServiceState,
    );

    // Should use agent file model (gpt-4), not persisted model (claude-3-haiku)
    expect(result.model).toEqual(
      expect.objectContaining({
        name: "gpt-4",
        provider: "openai",
      }),
    );

    expect(createLlmApiMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "gpt-4" }),
      mockAuthConfig,
    );
  });
});
