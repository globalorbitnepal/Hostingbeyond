#!/usr/bin/env node
/**
 * Runs unit tests always; runs integration tests only when the integration DB is ready
 * (or when INTEGRATION_TESTS=required). Fails closed on TAP fail/cancelled counts.
 */
import { spawnSync } from "node:child_process";
import { globSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  integrationModeFromEnv,
  parseTapSummary,
  resolveExitCode,
  shouldFailWhenIntegrationBlocked,
} from "./test-runner-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const NODE_TEST_BASE = [
  "node",
  "--import",
  "./scripts/register-alias.mjs",
  "--import",
  "tsx",
  "--test",
  "--test-concurrency=1",
];

const UNIT_GLOBS = [
  "lib/domains/**/*.test.ts",
  "lib/orbit/**/*.test.ts",
  "lib/payments/**/*.test.ts",
  "lib/billing/**/*.test.ts",
  "lib/blog/**/*.test.ts",
  "lib/http/**/*.test.ts",
  "lib/test/**/*.test.ts",
  "app/api/**/*.test.ts",
  "ops/backup/**/*.test.mjs",
  "ops/backup/dr/**/*.test.mjs",
  "scripts/**/*.test.mjs",
];

const INTEGRATION_GLOBS = [
  "lib/domains/**/*.integration.test.ts",
  "lib/orbit/**/*.integration.test.ts",
  "lib/payments/**/*.integration.test.ts",
  "lib/billing/**/*.integration.test.ts",
  "app/api/**/*.integration.test.ts",
];

function collectTestFiles(patterns, { integrationOnly = false } = {}) {
  const files = new Set();
  for (const pattern of patterns) {
    for (const file of globSync(pattern, { cwd: ROOT })) {
      if (integrationOnly) {
        if (file.endsWith(".integration.test.ts")) files.add(file);
      } else if (
        file.endsWith(".test.ts") ||
        file.endsWith(".test.mjs")
      ) {
        if (!file.endsWith(".integration.test.ts")) files.add(file);
      }
    }
  }
  return [...files].sort();
}

function runNodeTest(label, files) {
  if (files.length === 0) {
    console.log(`TEST_RUNNER_SUMMARY [${label}]: no test files (skipped)`);
    return { exitCode: 0, summary: { fail: 0, cancelled: 0, pass: 0, skipped: 0, tests: 0 } };
  }
  const args = [...NODE_TEST_BASE, ...files];
  const result = spawnSync(args[0], args.slice(1), {
    cwd: ROOT,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
  const combined = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  const summary = parseTapSummary(combined);
  if (result.error) {
    console.error(`TEST_RUNNER_ERROR [${label}]: ${result.error.message}`);
    return {
      exitCode: 1,
      summary: { fail: 1, cancelled: 0, pass: 0, skipped: 0, tests: 0 },
    };
  }
  const exitCode = resolveExitCode(result.status, summary, combined);
  console.log(
    `TEST_RUNNER_SUMMARY [${label}]: pass=${summary.pass} fail=${summary.fail} cancelled=${summary.cancelled} skipped=${summary.skipped} tests=${summary.tests} exit=${exitCode}`,
  );
  return { exitCode, summary };
}

function integrationDbReady() {
  const probe = spawnSync("node", ["scripts/integration-database-ready.mjs"], {
    cwd: ROOT,
    encoding: "utf8",
    env: process.env,
  });
  if (probe.stdout) process.stdout.write(probe.stdout);
  if (probe.stderr) process.stderr.write(probe.stderr);
  return probe.status === 0;
}

const flags = new Set(process.argv.slice(2));
const unitOnly = flags.has("--unit-only");
const integrationOnly = flags.has("--integration-only");

let finalExit = 0;

if (!integrationOnly) {
  const unitFiles = collectTestFiles(UNIT_GLOBS, { integrationOnly: false });
  const unit = runNodeTest("unit", unitFiles);
  if (unit.exitCode !== 0) finalExit = 1;
}

if (!unitOnly) {
  const mode = integrationModeFromEnv();
  if (mode === "skip") {
    console.log(
      "INTEGRATION_TESTS_BLOCKED: integration suite skipped (INTEGRATION_TESTS=skip)",
    );
  } else {
    const ready = integrationDbReady();
    if (!ready) {
      const message =
        mode === "required"
          ? "INTEGRATION_TESTS_REQUIRED but integration database is not ready"
          : "INTEGRATION_TESTS_BLOCKED: isolated PostgreSQL not available (set DATABASE_URL to local hostingbeyond_integration_test and ensure server is listening)";
      console.error(message);
      if (shouldFailWhenIntegrationBlocked(mode, false)) finalExit = 1;
    } else {
      const integFiles = collectTestFiles(INTEGRATION_GLOBS, {
        integrationOnly: true,
      });
      const integ = runNodeTest("integration", integFiles);
      if (integ.exitCode !== 0) finalExit = 1;
    }
  }
}

process.exit(finalExit);
