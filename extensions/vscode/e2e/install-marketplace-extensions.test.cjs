const assert = require("node:assert/strict");
const test = require("node:test");
const { installExtension, installAll } = require("./install-marketplace-extensions.cjs");

function fixture(results) {
  const calls = [];
  const delays = [];
  return {
    calls,
    delays,
    run: (...args) => {
      calls.push(args);
      return results[Math.min(calls.length - 1, results.length - 1)];
    },
    sleep: (ms) => delays.push(ms),
    write: () => {},
  };
}

test("installExtension succeeds without retry and preserves arguments", () => {
  const f = fixture([{ status: 0 }]);
  assert.equal(installExtension("example.extension", f), 0);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0][0], "extest");
  assert.deepEqual(f.calls[0][1], [
    "install-from-marketplace", "example.extension", "--extensions_dir",
    "./e2e/.test-extensions", "--storage", "./e2e/storage",
  ]);
  assert.equal(f.calls[0][2].timeout, 60000);
});

test("installExtension retries a transient 503 before success", () => {
  const f = fixture([{ status: 1, stderr: "Server returned 503" }, { status: 0 }]);
  assert.equal(installExtension("example.extension", f), 0);
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.delays, [2000]);
});

test("installExtension fails after three transient attempts", () => {
  const f = fixture([{ status: 1, stderr: "HTTP 503" }]);
  assert.equal(installExtension("example.extension", f), 1);
  assert.equal(f.calls.length, 3);
  assert.deepEqual(f.delays, [2000, 4000]);
});

test("installExtension does not retry permanent or authentication errors", () => {
  for (const stderr of ["Extension not found", "Server returned 401", "HTTP 403"]) {
    const f = fixture([{ status: 2, stderr }]);
    assert.equal(installExtension("example.extension", f), 2);
    assert.equal(f.calls.length, 1);
  }
});

test("installExtension handles bounded process timeout", () => {
  const f = fixture([{ status: null, error: { code: "ETIMEDOUT" } }]);
  assert.equal(installExtension("example.extension", f), 1);
  assert.equal(f.calls.length, 3);
});

test("installExtension fails immediately if the executable is missing", () => {
  const f = fixture([{ status: null, error: { code: "ENOENT" } }]);
  assert.equal(installExtension("example.extension", f), 1);
  assert.equal(f.calls.length, 1);
});

test("installAll stops after a permanent failure and keeps tests unrun", () => {
  const f = fixture([{ status: 0 }, { status: 1, stderr: "HTTP 403" }]);
  assert.equal(installAll(f), 1);
  assert.equal(f.calls.length, 2);
});

test("installAll installs the same three extensions in order", () => {
  const f = fixture([{ status: 0 }]);
  assert.equal(installAll(f), 0);
  assert.deepEqual(f.calls.map((call) => call[1][1]), [
    "ms-vscode-remote.remote-ssh",
    "ms-vscode-remote.remote-containers",
    "ms-vscode-remote.remote-wsl",
  ]);
});
