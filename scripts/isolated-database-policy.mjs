/**
 * Shared fail-closed DATABASE_URL checks. Never prints passwords.
 * Keep reasons aligned with lib/test/isolated-database-policy.ts.
 */
export const INTEGRATION_DATABASE_NAME = "hostingbeyond_integration_test";
export const FORBIDDEN_DATABASE_NAMES = new Set(["hostingbeyond_db"]);
export const FORBIDDEN_ROLE_NAMES = new Set(["hostingbeyond_user"]);
export const ALLOWED_INTEGRATION_HOSTS = new Set([
  "127.0.0.1",
  "localhost",
  "::1",
]);

export function parseDatabaseUrlMeta(raw) {
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

export function checkIsolatedIntegrationDatabaseUrl(raw) {
  const url = raw?.trim() ?? "";
  if (!url) return { ok: false, reason: "DATABASE_URL is not set" };
  let meta;
  try {
    meta = parseDatabaseUrlMeta(url);
  } catch {
    return { ok: false, reason: "DATABASE_URL is not a valid URL" };
  }
  if (!ALLOWED_INTEGRATION_HOSTS.has(meta.host)) {
    return { ok: false, reason: "host must be local" };
  }
  if (FORBIDDEN_DATABASE_NAMES.has(meta.database)) {
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
  if (FORBIDDEN_ROLE_NAMES.has(meta.role)) {
    return {
      ok: false,
      reason: "production application role is not allowed for integration",
    };
  }
  if (meta.port !== "55432") {
    return { ok: false, reason: "port must be 55432" };
  }
  return { ok: true, meta };
}
