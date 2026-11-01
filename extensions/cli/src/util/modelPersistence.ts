import { createHash } from "node:crypto";
import path from "node:path";

import { GlobalContext } from "core/util/GlobalContext.js";

/**
 * A local workspace receives its own selected model. Hashing the path avoids
 * copying workspace directory names into the persisted selection lookup.
 */
export function getCliWorkspaceSelectionKey(
  workspacePath: string = process.cwd(),
): string {
  return createHash("sha256")
    .update(path.resolve(workspacePath))
    .digest("hex");
}

/** Restore only a selection made within the current workspace. */
export function getPersistedModelName(
  workspacePath: string = process.cwd(),
): string | null {
  const selections = new GlobalContext().get("cliSelectedModelsByWorkspace");
  return selections?.[getCliWorkspaceSelectionKey(workspacePath)] ?? null;
}

/** Do not overwrite the legacy global model choice or leak it to a new project. */
export function persistModelName(
  modelName: string | null,
  workspacePath: string = process.cwd(),
): void {
  const globalContext = new GlobalContext();
  const selections = globalContext.get("cliSelectedModelsByWorkspace") ?? {};
  globalContext.update("cliSelectedModelsByWorkspace", {
    ...selections,
    [getCliWorkspaceSelectionKey(workspacePath)]: modelName,
  });
}
