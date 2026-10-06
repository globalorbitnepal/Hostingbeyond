#!/usr/bin/env node
/**
 * Stage LIVE availability config for VPS repair (reads local .env).
 * Never logs credential values.
 */
import { readFileSync, writeFileSync, chmodSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const outPath = process.argv[2] ?? "/tmp/hb-domain-availability.sync";

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
const liveKey = readVar(text, "DOMAIN_API_LIVE_KEY");

if (!resellerId || !liveKey) {
  console.error(
    "missing DOMAIN_API_RESELLER_ID or DOMAIN_API_LIVE_KEY for live availability",
  );
  process.exit(2);
}

const payload = JSON.stringify({
  resellerId,
  liveKey,
  availabilityEnv: "live",
});
writeFileSync(outPath, payload + "\n", { mode: 0o600 });
try {
  chmodSync(outPath, 0o644);
} catch {
  /* ignore */
}
console.log("staged:", outPath, "(live availability sync, values not printed)");
