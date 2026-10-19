#!/usr/bin/env node
/**
 * Refuse non-production database names for VPS export (fail closed).
 * Exit 0 if allowed; 7 if blocked. Never prints credentials.
 */
const name = (process.env.PGDATABASE || process.argv[2] || "").trim();
if (!name) {
  console.error("assert-production-database: missing database name");
  process.exit(2);
}

const ALLOWED = new Set(["hostingbeyond_db"]);

const BLOCKED = new Set([
  "hostingbeyond_integration_test",
  "hostingbeyond_test",
  "hostingbeyond_dev",
  "hostingbeyond_staging_db",
  "postgres",
  "template0",
  "template1",
]);

const BLOCKED_SUBSTR = ["integration_test", "_restore_test"];

if (!ALLOWED.has(name)) {
  console.error("assert-production-database: unexpected production database name");
  process.exit(7);
}

if (BLOCKED.has(name)) {
  console.error("assert-production-database: blocked database name");
  process.exit(7);
}
for (const s of BLOCKED_SUBSTR) {
  if (name.includes(s)) {
    console.error("assert-production-database: blocked database name pattern");
    process.exit(7);
  }
}

process.exit(0);
