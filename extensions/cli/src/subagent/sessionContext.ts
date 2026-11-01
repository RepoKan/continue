import { AsyncLocalStorage } from "node:async_hooks";

import type { ToolPermissions } from "../permissions/types.js";

export interface SubagentSessionContext {
  systemMessage: string;
  permissions: ToolPermissions;
  isHeadless: boolean;
}

const subagentStorage = new AsyncLocalStorage<SubagentSessionContext>();

export function getSubagentContext(): SubagentSessionContext | undefined {
  return subagentStorage.getStore();
}

export function runWithSubagentContext<T>(
  context: SubagentSessionContext,
  operation: () => Promise<T>,
): Promise<T> {
  // Clone the permission state before concurrent parent/child tasks can change it.
  return subagentStorage.run(
    { ...context, permissions: structuredClone(context.permissions) },
    operation,
  );
}
