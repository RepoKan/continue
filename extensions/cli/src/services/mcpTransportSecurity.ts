/**
 * MCP transport security: never inherit arbitrary credentials into subprocesses
 * or connect to remote endpoints with disabled TLS verification.
 */
const INHERITED_PROCESS_ENV_KEYS = [
  "PATH",
  "HOME",
  "SHELL",
  "TMPDIR",
  "TMP",
  "TEMP",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "USERPROFILE",
  "APPDATA",
  "LOCALAPPDATA",
  "PATHEXT",
  "SYSTEMROOT",
  "SystemRoot",
  "COMSPEC",
  "ComSpec",
  "WINDIR",
] as const;

export function buildStdioMcpEnvironment(
  explicitEnv: Record<string, string> = {},
  parentEnv: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const inherited: Record<string, string> = {};
  for (const key of INHERITED_PROCESS_ENV_KEYS) {
    const value = parentEnv[key];
    if (typeof value === "string" && value.length > 0) {
      inherited[key] = value;
    }
  }
  // Server-specific credentials must be consciously supplied in its config.
  return { ...inherited, ...explicitEnv };
}

export const fetchMcpWithoutRedirects: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    redirect: "error",
  });

export function assertSafeMcpTransport(
  config: { url: string; requestOptions?: { verifySsl?: boolean } },
): void {
  if (config.requestOptions?.verifySsl === false) {
    throw new Error("MCP TLS certificate verification cannot be disabled");
  }

  const url = new URL(config.url);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) {
    throw new Error("Remote MCP connections require HTTPS");
  }
}
