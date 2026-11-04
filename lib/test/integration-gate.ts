import { assertIntegrationDatabaseUrl } from "@/lib/test/integration-env-loader";
import { checkIsolatedIntegrationDatabaseUrl } from "@/lib/test/isolated-database-policy";

/**
 * Host + database name only. Not credential isolation — the production
 * application role can still satisfy this check.
 */
export function isIntegrationDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  try {
    assertIntegrationDatabaseUrl(url);
    return true;
  } catch {
    return false;
  }
}

/** True only when host, database name, and role are all integration-safe. */
export function isIntegrationCredentialIsolated(): boolean {
  return checkIsolatedIntegrationDatabaseUrl(process.env.DATABASE_URL).ok;
}

/** Skip/run guard for suites that write to PostgreSQL. */
export function shouldRunDatabaseIntegrationTests(): boolean {
  return isIntegrationCredentialIsolated();
}

/** Call before destructive integration setup; throws if target is not approved. */
export function assertIntegrationDatabaseTarget(): void {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("integration gate: DATABASE_URL is not set");
  }
  assertIntegrationDatabaseUrl(url);
  const isolated = checkIsolatedIntegrationDatabaseUrl(url);
  if (!isolated.ok) {
    throw new Error(`integration gate: ${isolated.reason}`);
  }
}
