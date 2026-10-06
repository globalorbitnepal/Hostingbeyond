#!/usr/bin/env node
/**
 * Stage OTE Domain API vars for VPS repair (reads local .env, writes sync file).
 * Never logs credential values.
 */
import { readFileSync, writeFileSync, chmodSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const outPath = process.argv[2] ?? "/tmp/hb-domain-api.sync";

function readVar(text, key) {
  const re = new RegExp(`^${key}=(.*)$`, "m");
  const m = text.match(re);
  if (!m) return "";
  let v = m[1].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v.trim();
}

const text = readFileSync(envPath, "utf8");
const resellerId = readVar(text, "DOMAIN_API_RESELLER_ID");
const testKey = readVar(text, "DOMAIN_API_TEST_KEY");
const envRaw = readVar(text, "DOMAIN_API_ENV") || "test";

if (!resellerId || !testKey) {
  console.error("missing DOMAIN_API_RESELLER_ID or DOMAIN_API_TEST_KEY in .env");
  process.exit(2);
}
if (envRaw.toLowerCase() !== "test") {
  console.error("DOMAIN_API_ENV must be test for OTE staging");
  process.exit(2);
}

const payload = JSON.stringify({
  resellerId,
  testKey,
  env: "test",
});
writeFileSync(outPath, payload + "\n", { mode: 0o600 });
try {
  chmodSync(outPath, 0o644);
} catch {
  /* ignore */
}
console.log("staged:", outPath, "(DOMAIN_API OTE sync, values not printed)");
