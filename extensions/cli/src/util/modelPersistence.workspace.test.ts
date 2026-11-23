import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { GlobalContext } from "core/util/GlobalContext.js";
import { afterEach, beforeEach, expect, test } from "vitest";

import {
  getCliWorkspaceSelectionKey,
  getPersistedModelName,
  persistModelName,
} from "./modelPersistence.js";

const savedHome = process.env.CONTINUE_GLOBAL_DIR;
let isolatedHome: string;

beforeEach(() => {
  isolatedHome = fs.mkdtempSync(path.join(os.tmpdir(), "model-workspace-"));
  process.env.CONTINUE_GLOBAL_DIR = isolatedHome;
});

afterEach(() => {
  if (savedHome === undefined) {
    delete process.env.CONTINUE_GLOBAL_DIR;
  } else {
    process.env.CONTINUE_GLOBAL_DIR = savedHome;
  }
  fs.rmSync(isolatedHome, { recursive: true, force: true });
});

test("getPersistedModelName isolates synthetic project workspaces", () => {
  const privateWorkspace = path.join(isolatedHome, "private-project");
  const publicWorkspace = path.join(isolatedHome, "public-project");

  persistModelName("private-provider-model", privateWorkspace);
  expect(getPersistedModelName(privateWorkspace)).toBe(
    "private-provider-model",
  );
  expect(getPersistedModelName(publicWorkspace)).toBeNull();

  persistModelName("public-provider-model", publicWorkspace);
  expect(getPersistedModelName(publicWorkspace)).toBe(
    "public-provider-model",
  );
  expect(getPersistedModelName(privateWorkspace)).toBe(
    "private-provider-model",
  );

  persistModelName(null, publicWorkspace);
  expect(getPersistedModelName(publicWorkspace)).toBeNull();
  expect(getPersistedModelName(privateWorkspace)).toBe(
    "private-provider-model",
  );
});

test("legacy global selection cannot silently route a new workspace", () => {
  const workspace = path.join(isolatedHome, "new-project");
  new GlobalContext().update("cliSelectedModel", "legacy-provider-model");

  expect(() => getPersistedModelName(workspace)).toThrow(
    "Legacy global CLI model selection requires an explicit workspace model selection",
  );
});

test("workspace-scoped selection takes precedence over legacy global state", () => {
  const workspace = path.join(isolatedHome, "scoped-project");
  const globalContext = new GlobalContext();
  globalContext.update("cliSelectedModel", "legacy-provider-model");

  persistModelName("workspace-provider-model", workspace);

  expect(getPersistedModelName(workspace)).toBe("workspace-provider-model");
});

test("getCliWorkspaceSelectionKey does not persist workspace path strings", () => {
  const key = getCliWorkspaceSelectionKey("/synthetic/private/checkout");
  expect(key).toMatch(/^[a-f0-9]{64}$/);
  expect(key).not.toContain("private");
});
