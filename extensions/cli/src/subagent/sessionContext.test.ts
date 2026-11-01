import { expect, test } from "vitest";

import { getSubagentContext, runWithSubagentContext } from "./sessionContext.js";

test("runWithSubagentContext isolates concurrent children", async () => {
  const observed = await Promise.all(
    ["child A", "child B"].map((systemMessage) =>
      runWithSubagentContext(
        { systemMessage, permissions: { policies: [] }, isHeadless: false },
        async () => {
          await Promise.resolve();
          return getSubagentContext()?.systemMessage;
        },
      ),
    ),
  );
  expect(observed).toEqual(["child A", "child B"]);
  expect(getSubagentContext()).toBeUndefined();
});

test("runWithSubagentContext freezes permission snapshot and restores scope after error", async () => {
  const parent = {
    systemMessage: "synthetic child",
    isHeadless: true,
    permissions: { policies: [{ tool: "Bash", permission: "exclude" as const }] },
  };
  await expect(
    runWithSubagentContext(parent, async () => {
      parent.permissions.policies[0].permission = "allow" as "exclude";
      expect(getSubagentContext()?.permissions.policies[0].permission).toBe(
        "exclude",
      );
      throw new Error("synthetic interruption");
    }),
  ).rejects.toThrow("synthetic interruption");
  expect(getSubagentContext()).toBeUndefined();
});
