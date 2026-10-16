import { assertIntegrationDatabaseUrl } from "@/lib/test/integration-env-loader";

/** True when DATABASE_URL targets the isolated integration database on localhost. */
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

/** Call before destructive integration setup; throws if target is not approved. */
export function assertIntegrationDatabaseTarget(): void {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("integration gate: DATABASE_URL is not set");
  }
  assertIntegrationDatabaseUrl(url);
}
