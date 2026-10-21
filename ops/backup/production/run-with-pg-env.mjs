#!/usr/bin/env node
/**
 * Run a command with libpq env vars from ENV_FILE / --env-file. Never prints secrets.
 */
import { spawnSync } from "node:child_process";

import { pgEnvFromEnvFile } from "./parse-database-env.mjs";

function parseArgs(argv) {
  let envFile = process.env.ENV_FILE || "";
  const cmd = [];
  let i = 2;
  for (; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--env-file") {
      envFile = argv[++i] || "";
    } else if (a === "--") {
      i++;
      break;
    } else {
      console.error("run-with-pg-env: unknown argument (use -- before command)");
      process.exit(2);
    }
  }
  for (; i < argv.length; i++) cmd.push(argv[i]);
  return { envFile, cmd };
}

const { envFile, cmd } = parseArgs(process.argv);
if (!envFile) {
  console.error("run-with-pg-env: missing --env-file or ENV_FILE");
  process.exit(2);
}
if (cmd.length === 0) {
  console.error("run-with-pg-env: missing command after --");
  process.exit(2);
}

let pgEnv;
try {
  pgEnv = pgEnvFromEnvFile(envFile);
} catch (e) {
  const msg = e instanceof Error ? e.message : "parse failed";
  console.error(`run-with-pg-env: ${msg}`);
  process.exit(5);
}

const childEnv = { ...process.env, ...pgEnv };
delete childEnv.DATABASE_URL;

const result = spawnSync(cmd[0], cmd.slice(1), {
  env: childEnv,
  stdio: "inherit",
});

if (result.error) {
  console.error(`run-with-pg-env: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status == null ? 1 : result.status);
