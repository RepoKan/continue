import { afterEach, beforeEach, expect, test, vi } from "vitest";

const constructorSpies = vi.hoisted(() => ({
  sse: vi.fn(),
  http: vi.fn(),
}));

vi.mock("@modelcontextprotocol/sdk/client/sse.js", () => ({
  SSEClientTransport: class {
    constructor(_url: URL, options: unknown) {
      constructorSpies.sse(options);
    }
  },
}));

vi.mock("@modelcontextprotocol/sdk/client/streamableHttp.js", () => ({
  StreamableHTTPClientTransport: class {
    constructor(_url: URL, options: unknown) {
      constructorSpies.http(options);
    }
  },
}));

vi.mock("@modelcontextprotocol/sdk/client/stdio.js", () => ({
  StdioClientTransport: class {
    stderr = null;

    constructor(_options: unknown) {}
  },
}));

import {
  constructHttpTransport,
  constructSseTransport,
} from "./mcpTransports.js";

interface TransportOptions {
  fetch?: typeof fetch;
  eventSourceInit?: {
    fetch?: typeof fetch;
  };
  requestInit?: RequestInit;
}

beforeEach(() => {
  constructorSpies.sse.mockReset();
  constructorSpies.http.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("SSE transport rejects redirects for stream and message requests", async () => {
  constructSseTransport(
    { url: "https://example.invalid/sse" } as Parameters<
      typeof constructSseTransport
    >[0],
    "synthetic-token",
  );

  const options = constructorSpies.sse.mock.calls[0][0] as TransportOptions;
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);

  expect(options.fetch).toBeTypeOf("function");
  expect(options.eventSourceInit?.fetch).toBeTypeOf("function");
  expect(options.requestInit?.redirect).toBe("error");

  await options.fetch?.("https://example.invalid/messages", {
    method: "POST",
  });
  await options.eventSourceInit?.fetch?.("https://example.invalid/sse");

  expect(fetchMock).toHaveBeenCalledTimes(2);
  for (const [, init] of fetchMock.mock.calls) {
    expect(init).toEqual(expect.objectContaining({ redirect: "error" }));
  }
});

test("streamable HTTP transport rejects redirects", async () => {
  constructHttpTransport(
    { url: "https://example.invalid/mcp" } as Parameters<
      typeof constructHttpTransport
    >[0],
    "synthetic-token",
  );

  const options = constructorSpies.http.mock.calls[0][0] as TransportOptions;
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);

  expect(options.fetch).toBeTypeOf("function");
  expect(options.requestInit?.redirect).toBe("error");

  await options.fetch?.("https://example.invalid/mcp", {
    method: "POST",
  });

  expect(fetchMock).toHaveBeenCalledWith(
    "https://example.invalid/mcp",
    expect.objectContaining({ redirect: "error" }),
  );
});
