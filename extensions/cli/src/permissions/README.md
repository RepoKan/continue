# Tool Permissions System

The tool permissions system allows you to control which tools the AI can use and how it can use them. There are three permission levels:

- **allow**: The tool will be executed automatically without asking for permission
- **ask**: The tool will prompt the user for permission before execution
- **exclude**: The tool will be filtered out entirely and won't be available to the AI

## Default Policies

The system comes with sensible default policies:

- Local read-only tools such as `Read`, `List`, `Search`, `Diff`, and `Status` are **allowed** by the default policy.
- `Write`, `Edit`, `MultiEdit`, `Bash`, `Fetch`, and `UploadArtifact` require **confirmation** (`ask`) in both normal and headless defaults. `Fetch` is an outbound operation and is not treated as local read-only access.
- Unknown tools, including unclassified MCP tools, default to **ask**. In headless execution without an approval UI, an `ask` decision must fail closed; verify that execution path before relying on it in a sensitive environment.
- **Plan mode** excludes write tools, `Bash`, `Fetch`, `UploadArtifact`, and unknown MCP tools. **Auto mode** intentionally overrides policies with `* = allow` and must not be used for KKS-private data without an additional verified private-workspace safeguard.
- Explicit `--agent` tool declarations can produce `allow` entries, including for tools that default to `ask`; inspect the effective agent policy rather than assuming default headless rules still apply.

## How It Works

### 1. Tool Filtering (Exclude Policy)

Tools with "exclude" permission are filtered out before being sent to the AI model. This means the AI won't even know these tools exist.

### 2. Permission Checking (Ask Policy)

When the AI tries to use a tool with "ask" permission in an interactive UI, the system requests approval before execution. In an environment without an approval UI, the executor must reject the call rather than silently converting it to `allow`; this integration behavior requires a runtime test.

### 3. Automatic Execution (Allow Policy)

Tools with "allow" permission are executed immediately without user intervention.

## Architecture

### Core Components

- **`types.ts`**: Defines the permission policy types and interfaces
- **`defaultPolicies.ts`**: Contains the hardcoded default permission policies
- **`permissionChecker.ts`**: Implements the permission checking logic
- **`permissionManager.ts`**: Manages permission requests and user responses
- **UI Components**: Handle displaying permission requests and collecting user input

### Data Flow

1. **Tool Loading**: `getAllowedTools()` in `streamChatResponse.ts` filters out excluded tools
2. **Tool Execution**: Before executing each tool call, permissions are checked
3. **User Interaction**: For "ask" policies, UI displays permission request
4. **Execution**: Tool is executed or denied based on permission result

## UI Integration

The permission system integrates with the existing chat UI:

- Permission requests appear as special message types
- Users can approve/deny with y/n keys
- The decision is shown in the chat history
- The system handles the async nature of permission requests

## Future Enhancements

The system is designed to be extensible for future features like:

- Custom permission policies loaded from configuration
- "Remember this decision" functionality
- Argument-based permission matching (partially implemented)
- Per-session or per-project permission overrides

## Example Usage

```typescript
// Check permission for a tool call
const result = checkToolPermission(
  { name: "Write", arguments: { path: "/synthetic/example.txt", content: "demo" } },
  { policies: getDefaultToolPolicies() },
);

if (result.permission === "ask") {
  // Request user permission
}
```
