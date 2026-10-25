#!/usr/bin/env node
/**
 * Merge NameSilo search toggle into .env. JSON on stdin: { "provider": "namesilo" | "dna" }.
 * Never logs secret values. Does not create or modify NAMESILO_API_KEY.
 */
import { readFileSync, writeFileSync } from "node:fs";

const envPath = process.argv[2] ?? "";
if (!envPath) {
  console.error("usage: merge-namesilo-search-env.mjs <path-to-.env>");
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

const provider = String(data.provider ?? "").trim().toLowerCase();
if (provider !== "namesilo" && provider !== "dna") {
  console.error('provider must be "namesilo" or "dna"');
  process.exit(2);
}

const key = "DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER";
const text = readFileSync(envPath, "utf8");
const lines = text.split(/\r?\n/);
let seen = false;
const out = lines.map((line) => {
  if (line.startsWith(`${key}=`)) {
    seen = true;
    return `${key}="${provider}"`;
  }
  return line;
});
if (!seen) {
  out.push(`${key}="${provider}"`);
}

writeFileSync(envPath, out.join("\n") + (text.endsWith("\n") ? "\n" : ""));
console.log(`NameSilo search env updated (${key}=${provider})`);
