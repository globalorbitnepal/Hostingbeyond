#!/usr/bin/env node
/**
 * Emit sanitized env inventory: variable names + required/optional only.
 * Never prints values. Reads ENV_FILE path from argv[2] or ENV_FILE env.
 */
import fs from "node:fs";

const INVENTORY = [
  { name: "DATABASE_URL", required: true, category: "database" },
  { name: "ORBIT_UPLOAD_DIR", required: true, category: "storage" },
  { name: "NEXT_PUBLIC_SITE_URL", required: true, category: "app" },
  { name: "NEXT_PUBLIC_APP_URL", required: false, category: "app" },
  { name: "NEXT_PUBLIC_APP_NAME", required: false, category: "app" },
  { name: "ORBIT_ENROLLMENT_SECRET", required: true, category: "orbit-auth" },
  { name: "ORBIT_SESSION_SECRET", required: true, category: "orbit-auth" },
  { name: "ORBIT_RP_ID", required: true, category: "orbit-auth" },
  { name: "ORBIT_ORIGIN", required: true, category: "orbit-auth" },
  { name: "GOOGLE_CLIENT_ID", required: false, category: "oauth" },
  { name: "GOOGLE_CLIENT_SECRET", required: false, category: "oauth" },
  { name: "GITHUB_CLIENT_ID", required: false, category: "oauth" },
  { name: "GITHUB_CLIENT_SECRET", required: false, category: "oauth" },
  { name: "FACEBOOK_APP_ID", required: false, category: "oauth" },
  { name: "FACEBOOK_APP_SECRET", required: false, category: "oauth" },
  { name: "DOMAIN_API_RESELLER_ID", required: true, category: "domains" },
  { name: "DOMAIN_API_TEST_KEY", required: false, category: "domains" },
  { name: "DOMAIN_API_LIVE_KEY", required: true, category: "domains" },
  { name: "DOMAIN_API_ENV", required: true, category: "domains" },
  { name: "DOMAIN_AVAILABILITY_ENV", required: true, category: "domains" },
  { name: "DOMAIN_SEARCH_CACHE_TTL_MS", required: false, category: "domains" },
  { name: "DOMAIN_PREMIUM_MARKUP_PERCENT", required: false, category: "domains" },
  { name: "DOMAIN_LOOKUP_URL", required: false, category: "domains" },
  { name: "DOMAIN_LOOKUP_TOKEN", required: false, category: "domains" },
  { name: "STRIPE_SECRET_KEY", required: false, category: "payments" },
  { name: "STRIPE_WEBHOOK_SECRET", required: false, category: "payments" },
];

function parseEnvKeys(envText) {
  const keys = new Set();
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z][A-Z0-9_]*)=/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

const envFile = process.argv[2] || process.env.ENV_FILE;
if (!envFile) {
  console.error("usage: env-inventory.mjs <env-file>");
  process.exit(2);
}

const text = fs.readFileSync(envFile, "utf8");
const present = parseEnvKeys(text);

const variables = INVENTORY.map((row) => ({
  ...row,
  present: present.has(row.name),
  configured: present.has(row.name),
}));

const extraKeys = [...present].filter(
  (k) => !INVENTORY.some((r) => r.name === k),
).sort();

process.stdout.write(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      variables,
      additionalKeysPresent: extraKeys,
    },
    null,
    2,
  ),
);
