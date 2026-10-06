#!/usr/bin/env node
/**
 * Merge OTE Domain API vars into a .env file. Reads JSON from stdin.
 * Never logs secrets.
 */
import { readFileSync, writeFileSync } from "node:fs";

const envPath = process.argv[2] ?? "";
if (!envPath) {
  console.error("usage: update-env-domain-api.mjs <path-to-.env>");
  process.exit(2);
}

const raw = readFileSync(0, "utf8").trim();
let data;
try {
  data = JSON.parse(raw);
} catch {
  console.error("invalid sync JSON");
  process.exit(2);
}

const resellerId = String(data.resellerId ?? "").trim();
const testKey = String(data.testKey ?? "").trim();
const env = String(data.env ?? "test").trim().toLowerCase();

if (!resellerId || !testKey) {
  console.error("missing resellerId or testKey in sync");
  process.exit(2);
}
if (env !== "test") {
  console.error("only DOMAIN_API_ENV=test is allowed for this repair");
  process.exit(2);
}

function esc(v) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const updates = new Map([
  ["DOMAIN_API_RESELLER_ID", resellerId],
  ["DOMAIN_API_TEST_KEY", testKey],
  ["DOMAIN_API_ENV", "test"],
]);

const text = readFileSync(envPath, "utf8");
const lines = text.split(/\r?\n/);
const seen = new Set();
const out = lines.map((line) => {
  for (const [key] of updates) {
    if (line.startsWith(`${key}=`)) {
      seen.add(key);
      return `${key}="${esc(updates.get(key)!))}"`;
    }
  }
  return line;
});
for (const [key, val] of updates) {
  if (!seen.has(key)) {
    out.push(`${key}="${esc(val)}"`);
  }
}

writeFileSync(envPath, out.join("\n") + (text.endsWith("\n") ? "\n" : ""));
console.log("DOMAIN_API OTE vars updated in", envPath);
