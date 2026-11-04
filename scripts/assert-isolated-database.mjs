#!/usr/bin/env node
/**
 * Fail closed for isolated build/integration. Does not print credentials.
 */
import { checkIsolatedIntegrationDatabaseUrl } from "./isolated-database-policy.mjs";

const result = checkIsolatedIntegrationDatabaseUrl(process.env.DATABASE_URL);
if (!result.ok) {
  console.error(`ISOLATED_DB_FAIL: ${result.reason}`);
  process.exit(1);
}

console.log(
  `ISOLATED_DB_OK: ${result.meta.host}:${result.meta.port}/${result.meta.database} role_ok`,
);
process.exit(0);
