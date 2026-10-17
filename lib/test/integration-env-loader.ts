import { existsSync, readFileSync } from "node:fs";

const INTEGRATION_ENV = ".env.integration.local";
export const INTEGRATION_DATABASE_NAME = "hostingbeyond_integration_test";

/** Validates integration test DATABASE_URL (host + database name only). */
export function assertIntegrationDatabaseUrl(url: string): void {
  const parsed = new URL(url);
  const host = parsed.hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
    throw new Error("integration env refused: non-local host");
  }
  const db = parsed.pathname.replace(/^\//, "").split("?")[0];
  if (db !== INTEGRATION_DATABASE_NAME) {
    throw new Error(
      `integration env refused: database must be ${INTEGRATION_DATABASE_NAME}`,
    );
  }
}

if (existsSync(INTEGRATION_ENV)) {
  const text = readFileSync(INTEGRATION_ENV, "utf8");
  const m = text.match(/^DATABASE_URL=(.*)$/m);
  if (m) {
    let url = m[1].trim();
    if (
      (url.startsWith('"') && url.endsWith('"')) ||
      (url.startsWith("'") && url.endsWith("'"))
    ) {
      url = url.slice(1, -1);
    }
    assertIntegrationDatabaseUrl(url);
    // Do not override CI/shell DATABASE_URL (e.g. GitHub Actions service).
    if (!process.env.DATABASE_URL?.trim()) {
      process.env.DATABASE_URL = url;
    }
  }
}
