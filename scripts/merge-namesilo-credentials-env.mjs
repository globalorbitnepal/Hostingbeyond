#!/usr/bin/env node
/**
 * Merge NameSilo API key into .env. JSON on stdin: { "apiKey": "..." }.
 * Never logs secret values.
 */
import { readFileSync, writeFileSync } from "node:fs";

const envPath = process.argv[2] ?? "";
if (!envPath) {
  console.error("usage: merge-namesilo-credentials-env.mjs <path-to-.env>");
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

const apiKey = String(data.apiKey ?? "").trim();
if (!apiKey) {
  console.error("missing apiKey in sync");
  process.exit(2);
}

function esc(v) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const updates = new Map([["NAMESILO_API_KEY", apiKey]]);

const text = readFileSync(envPath, "utf8");
const lines = text.split(/\r?\n/);
const seen = new Set();
const out = lines.map((line) => {
  for (const [key] of updates) {
    if (line.startsWith(`${key}=`)) {
      seen.add(key);
      return `${key}="${esc(updates.get(key))}"`;
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
console.log("NAMESILO_API_KEY updated on server (value not printed)");
