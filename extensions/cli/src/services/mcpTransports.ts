import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  HttpMcpServer,
  SseMcpServer,
  StdioMcpServer,
} from "node_modules/@continuedev/config-yaml/dist/schemas/mcp/index.js";

import {
  assertSafeMcpTransport,
  buildStdioMcpEnvironment,
  fetchMcpWithoutRedirects,
} from "./mcpTransportSecurity.js";
import { MCPConnectionInfo } from "./types.js";

export function constructSseTransport(
  serverConfig: SseMcpServer,
  apiKey: string | undefined,
): SSEClientTransport {
  assertSafeMcpTransport(serverConfig);

  const headers = {
    ...serverConfig.requestOptions?.headers,
    ...(apiKey && {
      Authorization: `Bearer ${apiKey}`,
    }),
  };

  const fetchWithHeaders: typeof fetch = (input, init) => {
    const requestHeaders = new Headers(init?.headers);
    new Headers(headers).forEach((value, key) => {
      requestHeaders.set(key, value);
    });

    return fetchMcpWithoutRedirects(input, {
      ...init,
      headers: requestHeaders,
    });
  };

  return new SSEClientTransport(new URL(serverConfig.url), {
    eventSourceInit: {
      fetch: fetchWithHeaders,
    },
    fetch: fetchWithHeaders,
    requestInit: {
      headers,
      redirect: "error",
    },
  });
}

export function constructHttpTransport(
  serverConfig: HttpMcpServer,
  apiKey: string | undefined,
): StreamableHTTPClientTransport {
  assertSafeMcpTransport(serverConfig);

  const headers = {
    ...serverConfig.requestOptions?.headers,
    ...(apiKey && {
      Authorization: `Bearer ${apiKey}`,
    }),
  };

  return new StreamableHTTPClientTransport(new URL(serverConfig.url), {
    fetch: fetchMcpWithoutRedirects,
    requestInit: {
      headers,
      redirect: "error",
    },
  });
}

export function constructStdioTransport(
  serverConfig: StdioMcpServer,
  connection: MCPConnectionInfo,
): StdioClientTransport {
  const env = buildStdioMcpEnvironment(serverConfig.env);

  const transport = new StdioClientTransport({
    command: serverConfig.command,
    args: serverConfig.args || [],
    env,
    cwd: serverConfig.cwd,
    stderr: "pipe",
  });

  const stderrStream = transport.stderr;
  if (stderrStream) {
    stderrStream.on("data", (data: Buffer) => {
      const stderrOutput = data.toString().trim();
      if (stderrOutput) {
        connection.warnings.push(stderrOutput);
      }
    });
  }

  return transport;
}
