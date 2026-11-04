/**
 * Strict migration-target policy — a superset of `isolated-database-policy.ts`.
 *
 * WHY A SECOND LAYER: the existing policy answers "is this URL shaped like an
 * integration target?" and is intentionally permissive for *read-only* probes
 * (it permits extra path segments, `?options=`, fragments, and non-explicit
 * ports). Those are acceptable when the only outcome is a refused TCP probe or
 * a refused test run, but they are not acceptable before `prisma migrate deploy`,
 * where a misparse means schema changes land somewhere unintended.
 *
 * This module is the pre-migration gate. It is strict about parsing ambiguity
 * and fails closed on anything it does not positively recognise.
 *
 * It does NOT replace or weaken `isolated-database-policy.ts`; the guard script
 * runs both, and this one only ever adds rejections.
 *
 * Never log credentials. Only `host`, `port`, `database`, and `role` are ever
 * returned, and `role` is a username, never a password.
 */

import {
  ALLOWED_INTEGRATION_HOSTS,
  INTEGRATION_DATABASE_NAME,
  isForbiddenDatabaseName,
  isForbiddenProductionRole,
  parseDatabaseUrlMeta,
} from "@/lib/test/isolated-database-policy";

/** Only these query keys are tolerated, and only with these exact values. */
export const ALLOWED_QUERY_PARAMS: Readonly<Record<string, readonly string[]>> =
  {
    schema: ["public"],
  };

const ALLOWED_PROTOCOLS = new Set(["postgresql:", "postgres:"]);
const FORBIDDEN_CONTROL = /[\u0000-\u001F\u007F]/;
const EXPLICIT_IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

export type MigrationTargetMeta = {
  host: string;
  port: string;
  database: string;
  role: string;
};

export type MigrationTargetResult =
  { ok: true; meta: MigrationTargetMeta } | { ok: false; reason: string };

/** Redacted, log-safe description. Never includes password or full URL. */
export function redactMigrationTarget(meta: MigrationTargetMeta): string {
  return `${meta.role}@${meta.host}:${meta.port}/${meta.database}`;
}

/**
 * Strict pre-migration check.
 *
 * Rejects, in order:
 *  - missing / blank value (never falls back to `.env`)
 *  - embedded control characters or surrounding whitespace
 *  - unparseable URL
 *  - non-PostgreSQL protocol
 *  - credentials with percent-encoded ambiguity in the hostname
 *  - missing explicit port, or a non-numeric port
 *  - host not in the existing loopback allowlist
 *  - any path other than exactly `/<integration database>`
 *  - production database name, or any other database name
 *  - missing role, or the production application role
 *  - a fragment
 *  - any query parameter other than an allowlisted key/value
 */
export function checkMigrationTargetUrl(
  raw: string | null | undefined,
): MigrationTargetResult {
  if (raw === null || raw === undefined) {
    return { ok: false, reason: "DATABASE_URL is not set" };
  }
  // A value that differs from its trimmed form is almost always a quoting or
  // newline-injection mistake; refuse rather than guess.
  if (raw !== raw.trim()) {
    return {
      ok: false,
      reason: "DATABASE_URL has leading/trailing whitespace",
    };
  }
  const url = raw;
  if (!url) return { ok: false, reason: "DATABASE_URL is not set" };
  if (FORBIDDEN_CONTROL.test(url)) {
    return { ok: false, reason: "DATABASE_URL contains control characters" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "DATABASE_URL is not a valid URL" };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, reason: "DATABASE_URL must use the postgres protocol" };
  }
  if (!parsed.hostname) {
    return {
      ok: false,
      reason: "DATABASE_URL has no hostname (unix socket is not allowed)",
    };
  }
  // Percent-encoding in the authority is the main parser-divergence risk.
  if (/%/.test(`${parsed.username}${parsed.hostname}`)) {
    return {
      ok: false,
      reason: "DATABASE_URL has percent-encoded authority components",
    };
  }
  if (parsed.hash) {
    return { ok: false, reason: "DATABASE_URL must not contain a fragment" };
  }

  if (!parsed.port) {
    return {
      ok: false,
      reason: "DATABASE_URL must state an explicit port (e.g. :5432)",
    };
  }
  if (!/^\d{1,5}$/.test(parsed.port)) {
    return { ok: false, reason: "DATABASE_URL port is not numeric" };
  }

  // Delegate host / database / role extraction to the shared parser so both
  // layers agree on normalisation (including IPv6 bracket stripping).
  let baseMeta: ReturnType<typeof parseDatabaseUrlMeta>;
  try {
    baseMeta = parseDatabaseUrlMeta(url);
  } catch {
    return { ok: false, reason: "DATABASE_URL is not a valid URL" };
  }

  if (
    !(ALLOWED_INTEGRATION_HOSTS as readonly string[]).includes(baseMeta.host)
  ) {
    return {
      ok: false,
      reason: "host must be loopback (127.0.0.1, localhost, or ::1)",
    };
  }
  // Defence in depth: loopback names must not be decorated (e.g. 127.0.0.1.evil).
  if (EXPLICIT_IPV4.test(baseMeta.host)) {
    for (const octet of baseMeta.host.split(".")) {
      const value = Number(octet);
      if (!Number.isInteger(value) || value < 0 || value > 255) {
        return { ok: false, reason: "host is not a valid IPv4 address" };
      }
    }
  }

  // Path must be exactly one segment: the integration database name.
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return {
      ok: false,
      reason: "DATABASE_URL path must contain only the database name",
    };
  }
  const database = segments[0];
  if (database !== baseMeta.database) {
    return { ok: false, reason: "DATABASE_URL database could not be parsed" };
  }
  if (isForbiddenDatabaseName(database)) {
    return { ok: false, reason: "forbidden production database name" };
  }
  if (database !== INTEGRATION_DATABASE_NAME) {
    return {
      ok: false,
      reason: `database must be exactly ${INTEGRATION_DATABASE_NAME}`,
    };
  }

  const role = baseMeta.role;
  if (!role) return { ok: false, reason: "database role is missing" };
  if (isForbiddenProductionRole(role)) {
    return {
      ok: false,
      reason: "production application role is not allowed for integration",
    };
  }
  if (role === database) {
    return {
      ok: false,
      reason: "database role must be dedicated, not the database name",
    };
  }

  // Query parameters: unknown keys (notably `options`, which can change
  // search_path) are refused outright.
  for (const [key, value] of parsed.searchParams.entries()) {
    const allowedValues = ALLOWED_QUERY_PARAMS[key];
    if (!allowedValues) {
      return { ok: false, reason: `unexpected query parameter: ${key}` };
    }
    if (!allowedValues.includes(value)) {
      return {
        ok: false,
        reason: `unsupported value for query parameter: ${key}`,
      };
    }
  }

  if (baseMeta.port !== "55432") {
    return { ok: false, reason: "port must be 55432" };
  }

  return {
    ok: true,
    meta: {
      host: baseMeta.host,
      port: baseMeta.port,
      database,
      role,
    },
  };
}
