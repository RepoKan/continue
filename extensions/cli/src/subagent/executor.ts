import type { ChatHistoryItem } from "core";

import { services } from "../services/index.js";
import { getSubagentContext, runWithSubagentContext } from "./sessionContext.js";
import type { ModelServiceState } from "../services/types.js";
import { streamChatResponse } from "../stream/streamChatResponse.js";
import { escapeEvents } from "../util/cli.js";
import { logger } from "../util/logger.js";

/**
 * Options for executing a subagent
 */
export interface SubAgentExecutionOptions {
  agent: ModelServiceState;
  prompt: string;
  parentSessionId: string;
  abortController: AbortController;
  onOutputUpdate?: (output: string) => void;
}

/**
 * Result from executing a subagent
 */
export interface SubAgentResult {
  success: boolean;
  response: string;
  error?: string;
}

/**
 * Build system message for the agent
 */
async function buildAgentSystemMessage(
  agent: ModelServiceState,
  services: any,
): Promise<string> {
  const baseMessage = services.systemMessage
    ? await services.systemMessage.getSystemMessage(
        services.toolPermissions.getState().currentMode,
      )
    : "";

  const agentPrompt = agent.model?.chatOptions?.baseSystemMessage || "";

  // Combine base system message with agent-specific prompt
  if (agentPrompt) {
    return `${baseMessage}\n\n${agentPrompt}`;
  }

  return baseMessage;
}

/**
 * Execute a subagent in a child session
 */
// eslint-disable-next-line complexity
export async function executeSubAgent(
  options: SubAgentExecutionOptions,
): Promise<SubAgentResult> {
  const { agent: subAgent, prompt, abortController, onOutputUpdate } = options;

  try {
    logger.debug("Starting subagent execution", {
      agent: subAgent.model?.name,
    });

    const { model, llmApi } = subAgent;
    if (!model || !llmApi) {
      throw new Error("Model or LLM API not available");
    }

    // Build agent system message
    const systemMessage = await buildAgentSystemMessage(subAgent, services);

    const chatHistory = [
      {
        message: {
          role: "user",
          content: prompt,
        },
        contextItems: [],
      },
    ] as ChatHistoryItem[];

    const escapeHandler = () => {
      abortController.abort();
      chatHistory.push({
        message: {
          role: "user",
          content: "Subagent execution was cancelled by the user.",
        },
        contextItems: [],
      });
    };

    escapeEvents.on("user-escape", escapeHandler);

    try {
      let accumulatedOutput = "";

      // Keep the child in an independent asynchronous context.
      const parent = getSubagentContext();
      const permissions = parent?.permissions ?? services.toolPermissions.getState().permissions;
      const isHeadless = parent?.isHeadless ?? services.toolPermissions.isHeadless();

      await runWithSubagentContext({ systemMessage, permissions, isHeadless }, () =>
        streamChatResponse(
        chatHistory,
        model,
        llmApi,
        abortController,
        {
          onContent: (content: string) => {
            accumulatedOutput += content;
            if (onOutputUpdate) {
              onOutputUpdate(accumulatedOutput);
            }
          },
          onToolResult: (result: string) => {
            // todo: skip tool outputs - show tool names and params
            accumulatedOutput += `\n\n${result}`;
            if (onOutputUpdate) {
              onOutputUpdate(accumulatedOutput);
            }
          },
        },
        false, // Not compacting
        ),
      );

      // The last message (mostly) contains the important output to be submitted back to the main agent
      const lastMessage = chatHistory.at(-1);
      const response =
        typeof lastMessage?.message?.content === "string"
          ? lastMessage.message.content
          : "";

      logger.debug("Subagent execution completed", {
        agent: model?.name,
        responseLength: response.length,
      });

      return {
        success: true,
        response,
      };
    } finally {
      escapeEvents.removeListener("user-escape", escapeHandler);
    }
  } catch (error: any) {
    logger.error("Subagent execution failed", {
      agent: subAgent.model?.name,
      error: error.message,
    });

    return {
      success: false,
      response: "",
      error: error.message,
    };
  }
}
