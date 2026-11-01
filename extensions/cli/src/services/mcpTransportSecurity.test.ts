import { expect, test } from "vitest";

import {
  assertSafeMcpTransport,
  buildStdioMcpEnvironment,
} from "./mcpTransportSecurity.js";

test("buildStdioMcpEnvironment excludes ambient credentials", () => {
  const inherited = {
    PATH: "/usr/bin",
    HOME: "/home/example",
    PROVIDER_SECRET: "synthetic-canary",
    GITHUB_TOKEN: "synthetic-canary",
  };
  const result = buildStdioMcpEnvironment(
    { MCP_TEST_KEY: "synthetic-explicit" },
    inherited,
  );
  expect(result).toEqual({
    PATH: "/usr/bin",
    HOME: "/home/example",
    MCP_TEST_KEY: "synthetic-explicit",
  });
  expect(result).not.toHaveProperty("GITHUB_TOKEN");
  expect(result).not.toHaveProperty("PROVIDER_SECRET");
});

test("assertSafeMcpTransport rejects disabled TLS and remote HTTP", () => {
  expect(() =>
    assertSafeMcpTransport({
      url: "https://example.invalid/mcp",
      requestOptions: { verifySsl: false },
    }),
  ).toThrow("MCP TLS certificate verification cannot be disabled");
  expect(() =>
    assertSafeMcpTransport({ url: "http://example.invalid/mcp" }),
  ).toThrow("Remote MCP connections require HTTPS");
  expect(() =>
    assertSafeMcpTransport({ url: "file:///tmp/mcp" }),
  ).toThrow("Remote MCP connections require HTTPS");
});

test("assertSafeMcpTransport allows HTTPS and loopback HTTP", () => {
  expect(() =>
    assertSafeMcpTransport({ url: "https://example.invalid/mcp" }),
  ).not.toThrow();
  expect(() =>
    assertSafeMcpTransport({ url: "http://localhost:8765/mcp" }),
  ).not.toThrow();
  expect(() =>
    assertSafeMcpTransport({ url: "http://127.0.0.1:8765/mcp" }),
  ).not.toThrow();
  expect(() =>
    assertSafeMcpTransport({ url: "http://localhost.evil.invalid/mcp" }),
  ).toThrow("Remote MCP connections require HTTPS");
});
