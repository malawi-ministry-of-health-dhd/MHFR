#!/usr/bin/env node

const { spawnSync } = require("child_process");

const action = process.argv[2];

if (!action) {
  console.error("Usage: node scripts/run-react-scripts.js <command>");
  process.exit(1);
}

const env = { ...process.env };
const nodeMajor = Number(process.versions.node.split(".")[0]);
const legacyProviderFlag = "--openssl-legacy-provider";
const currentNodeOptions = env.NODE_OPTIONS || "";
const nodeOptions = currentNodeOptions.split(/\s+/).filter(Boolean);

// Webpack 4-based react-scripts needs the legacy provider on newer Node releases.
if (nodeMajor >= 17 && !nodeOptions.includes(legacyProviderFlag)) {
  env.NODE_OPTIONS = [...nodeOptions, legacyProviderFlag].join(" ");
}

const reactScriptsBin = require.resolve("react-scripts/bin/react-scripts.js");
const result = spawnSync(
  process.execPath,
  [reactScriptsBin, action, ...process.argv.slice(3)],
  {
    env,
    stdio: "inherit"
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status === null ? 1 : result.status);
