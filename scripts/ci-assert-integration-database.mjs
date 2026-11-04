#!/usr/bin/env node
/**
 * Fail closed unless DATABASE_URL is a local integration DB with a
 * non-production role. Never prints credentials.
 */
import { checkIsolatedIntegrationDatabaseUrl } from "./isolated-database-policy.mjs";

const result = checkIsolatedIntegrationDatabaseUrl(process.env.DATABASE_URL);
if (!result.ok) {
  console.error(`CI_DATABASE_FAIL: ${result.reason}`);
  process.exit(1);
}

console.log(`CI_DATABASE_OK: ${result.meta.host}/${result.meta.database}`);
process.exit(0);
