#!/usr/bin/env node
/**
 * Replace DATABASE_URL in a .env file. Reads new URL from stdin (one line).
 * Never logs the URL or password.
 */
import { readFileSync, writeFileSync } from "node:fs";

const envPath = process.argv[2] ?? "";
if (!envPath) {
  console.error("usage: update-env-database-url.mjs <path-to-.env>");
  process.exit(2);
}

const newUrl = readFileSync(0, "utf8").trim();
if (!newUrl.startsWith("postgresql://")) {
  console.error("invalid DATABASE_URL format");
  process.exit(2);
}

const text = readFileSync(envPath, "utf8");
const lines = text.split(/\r?\n/);
let found = false;
const out = lines.map((line) => {
  if (line.startsWith("DATABASE_URL=")) {
    found = true;
    return `DATABASE_URL="${newUrl.replace(/"/g, '\\"')}"`;
  }
  return line;
});
if (!found) {
  out.push(`DATABASE_URL="${newUrl.replace(/"/g, '\\"')}"`);
}
writeFileSync(envPath, out.join("\n") + (text.endsWith("\n") ? "\n" : ""));
console.log("DATABASE_URL updated in", envPath);
