/**
 * Fail-closed rules for integration/build tasks.
 * Host/name checks are necessary but not sufficient: the production app role
 * must not be used even when the database name is hostingbeyond_integration_test.
 * Never log passwords.
 */

export const INTEGRATION_DATABASE_NAME = "hostingbeyond_integration_test";
export const FORBIDDEN_DATABASE_NAMES = ["hostingbeyond_db"] as const;
export const FORBIDDEN_ROLE_NAMES = ["hostingbeyond_user"] as const;
export const ALLOWED_INTEGRATION_HOSTS = [
  "127.0.0.1",
  "localhost",
  "::1",
] as const;

export type IsolatedDatabaseMeta = {
  host: string;
  port: string;
  database: string;
  role: string;
};

export function parseDatabaseUrlMeta(raw: string): IsolatedDatabaseMeta {
  const parsed = new URL(raw);
  // WHATWG URL keeps IPv6 literals bracketed ("[::1]"); strip them so the
  // loopback allowlist below matches the documented `::1` form.
  const hostname = parsed.hostname;
  const host =
    hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;
  return {
    host,
    port: parsed.port || "5432",
    database: parsed.pathname.replace(/^\//, "").split("?")[0],
    role: decodeURIComponent(parsed.username || ""),
  };
}

export function isForbiddenDatabaseName(database: string): boolean {
  return (FORBIDDEN_DATABASE_NAMES as readonly string[]).includes(database);
}

export function isForbiddenProductionRole(role: string): boolean {
  return (FORBIDDEN_ROLE_NAMES as readonly string[]).includes(role);
}

export type IsolationCheckResult =
  { ok: true; meta: IsolatedDatabaseMeta } | { ok: false; reason: string };

export function checkIsolatedIntegrationDatabaseUrl(
  raw: string | null | undefined,
): IsolationCheckResult {
  const url = raw?.trim() ?? "";
  if (!url) return { ok: false, reason: "DATABASE_URL is not set" };
  let meta: IsolatedDatabaseMeta;
  try {
    meta = parseDatabaseUrlMeta(url);
  } catch {
    return { ok: false, reason: "DATABASE_URL is not a valid URL" };
  }
  if (!(ALLOWED_INTEGRATION_HOSTS as readonly string[]).includes(meta.host)) {
    return { ok: false, reason: "host must be local" };
  }
  if (isForbiddenDatabaseName(meta.database)) {
    return { ok: false, reason: "forbidden production database name" };
  }
  if (meta.database !== INTEGRATION_DATABASE_NAME) {
    return {
      ok: false,
      reason: "database must be hostingbeyond_integration_test",
    };
  }
  if (!meta.role) {
    return { ok: false, reason: "database role is missing" };
  }
  if (isForbiddenProductionRole(meta.role)) {
    return {
      ok: false,
      reason: "production application role is not allowed for integration",
    };
  }
  return { ok: true, meta };
}
