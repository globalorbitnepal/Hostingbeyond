#!/usr/bin/env node
/**
 * Fail closed unless DATABASE_URL targets the CI/local integration database.
 * Never prints credentials.
 */
const requiredDb = "hostingbeyond_integration_test";
const allowedHosts = new Set(["127.0.0.1", "localhost", "::1"]);

const raw = process.env.DATABASE_URL?.trim();
if (!raw) {
  console.error("CI_DATABASE_FAIL: DATABASE_URL is not set");
  process.exit(1);
}

let url;
try {
  url = new URL(raw);
} catch {
  console.error("CI_DATABASE_FAIL: DATABASE_URL is not a valid URL");
  process.exit(1);
}

if (!allowedHosts.has(url.hostname)) {
  console.error(
    "CI_DATABASE_FAIL: DATABASE_URL host must be local (integration DB only)",
  );
  process.exit(1);
}

const db = url.pathname.replace(/^\//, "").split("?")[0];
if (db !== requiredDb) {
  console.error(
    `CI_DATABASE_FAIL: DATABASE_URL database must be ${requiredDb}`,
  );
  process.exit(1);
}

console.log(`CI_DATABASE_OK: ${url.hostname}/${db}`);
