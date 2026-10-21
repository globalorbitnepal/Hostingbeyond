#!/usr/bin/env node
/**
 * Production backup export approval (fail closed).
 * Reads HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED from the deployment .env only.
 * Never logs secret values.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const APPROVAL_ENV_KEY = "HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED";

/**
 * @param {string} text
 * @returns {{ state: "approved" | "denied" | "missing" | "invalid" }}
 */
export function parseApprovalFromEnvText(text) {
  let found = 0;
  let raw = "";
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=(.*)$/);
    if (!m) continue;
    found += 1;
    if (found > 1) {
      return { state: "invalid" };
    }
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1).trim();
    }
    raw = v;
  }
  if (!found) {
    return { state: "missing" };
  }
  const norm = raw.toLowerCase();
  if (norm === "true" || norm === "1" || norm === "yes") {
    return { state: "approved" };
  }
  if (norm === "false" || norm === "0" || norm === "no" || norm === "") {
    return { state: "denied" };
  }
  return { state: "invalid" };
}

/**
 * @param {string} envFilePath
 * @returns {{ state: "approved" | "denied" | "missing" | "invalid" | "unreadable" }}
 */
export function readApprovalFromEnvFile(envFilePath) {
  let text;
  try {
    text = fs.readFileSync(envFilePath, "utf8");
  } catch {
    return { state: "unreadable" };
  }
  return parseApprovalFromEnvText(text);
}

/**
 * @param {{ envFilePath: string, allowProcessEnvOverride?: boolean }} opts
 */
export function resolveExportApproval(opts) {
  const fromFile = readApprovalFromEnvFile(opts.envFilePath);
  if (fromFile.state === "approved") {
    return { ok: true, source: "env_file" };
  }
  if (opts.allowProcessEnvOverride) {
    const v = (process.env[APPROVAL_ENV_KEY] || "").trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes") {
      return { ok: true, source: "process_env_test_override" };
    }
  }
  return { ok: false, reason: fromFile.state };
}

const isMain =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  const envFile = process.argv[2];
  if (!envFile) {
    console.error("export-approval: usage export-approval.mjs <env-file>");
    process.exit(2);
  }
  const result = resolveExportApproval({ envFilePath: envFile });
  if (!result.ok) {
    console.error(`export-approval: EXPORT_BLOCKED (${result.reason})`);
    process.exit(11);
  }
  console.log("export-approval: EXPORT_APPROVED");
  process.exit(0);
}
