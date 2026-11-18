const { spawnSync } = require("node:child_process");

const extensions = [
  "ms-vscode-remote.remote-ssh",
  "ms-vscode-remote.remote-containers",
  "ms-vscode-remote.remote-wsl",
];

function isTransient(result) {
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  return (
    ["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"].includes(result.error?.code) ||
    /(?:Server returned|HTTP(?: status)?)[ :]*(?:429|500|502|503|504)\b/i.test(
      output,
    )
  );
}

function installExtension(extension, options = {}) {
  const run = options.run || spawnSync;
  const sleep =
    options.sleep ||
    ((ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms));
  const write = options.write || ((text) => process.stdout.write(text));
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const result = run(
      "extest",
      [
        "install-from-marketplace",
        extension,
        "--extensions_dir",
        "./e2e/.test-extensions",
        "--storage",
        "./e2e/storage",
      ],
      { encoding: "utf8", timeout: 60000, maxBuffer: 10 * 1024 * 1024 },
    );
    write(result.stdout || "");
    write(result.stderr || "");
    if (result.status === 0 && !result.error && !result.signal) return 0;
    if (attempt === 3 || !isTransient(result)) {
      write(`Marketplace installation failed for ${extension}.\n`);
      return Number.isInteger(result.status) && result.status > 0
        ? result.status
        : 1;
    }
    write(`Transient Marketplace failure; retry ${attempt}/2 for ${extension}.\n`);
    sleep(attempt * 2000);
  }
  return 1;
}

function installAll(options = {}) {
  for (const extension of extensions) {
    const status = installExtension(extension, options);
    if (status !== 0) return status;
  }
  return 0;
}

module.exports = { installExtension, installAll, isTransient };
if (require.main === module) process.exitCode = installAll();
