/**
 * Strict migration-target policy (ESM mirror of
 * `lib/test/migration-target-policy.ts`).
 *
 * Keep the two files in sync — `lib/test/migration-target-policy.parity.test.ts`
 * asserts that both layers return identical accept/reject reasons.
 *
 * A superset of `isolated-database-policy.mjs`: it only ever adds rejections.
 * Never log credentials.
 */

import {
  ALLOWED_INTEGRATION_HOSTS,
  FORBIDDEN_DATABASE_NAMES,
  FORBIDDEN_ROLE_NAMES,
  INTEGRATION_DATABASE_NAME,
  parseDatabaseUrlMeta,
} from "./isolated-database-policy.mjs";

/** Only these query keys are tolerated, and only with these exact values. */
export const ALLOWED_QUERY_PARAMS = { schema: ["public"] };

const ALLOWED_PROTOCOLS = new Set(["postgresql:", "postgres:"]);
const FORBIDDEN_CONTROL = /[\u0000-\u001F\u007F]/;
const EXPLICIT_IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

/** Redacted, log-safe description. Never includes password or full URL. */
export function redactMigrationTarget(meta) {
  return `${meta.role}@${meta.host}:${meta.port}/${meta.database}`;
}

export function checkMigrationTargetUrl(raw) {
  if (raw === null || raw === undefined) {
    return { ok: false, reason: "DATABASE_URL is not set" };
  }
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

  let parsed;
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

  let baseMeta;
  try {
    baseMeta = parseDatabaseUrlMeta(url);
  } catch {
    return { ok: false, reason: "DATABASE_URL is not a valid URL" };
  }

  if (!ALLOWED_INTEGRATION_HOSTS.has(baseMeta.host)) {
    return {
      ok: false,
      reason: "host must be loopback (127.0.0.1, localhost, or ::1)",
    };
  }
  if (EXPLICIT_IPV4.test(baseMeta.host)) {
    for (const octet of baseMeta.host.split(".")) {
      const value = Number(octet);
      if (!Number.isInteger(value) || value < 0 || value > 255) {
        return { ok: false, reason: "host is not a valid IPv4 address" };
      }
    }
  }

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
  if (FORBIDDEN_DATABASE_NAMES.has(database)) {
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
  if (FORBIDDEN_ROLE_NAMES.has(role)) {
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
