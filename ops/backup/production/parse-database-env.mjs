#!/usr/bin/env node
/**
 * Parse DATABASE_URL from a .env file into libpq PG* variables.
 * Never logs credential values. Fail closed on malformed or ambiguous input.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PRISMA_ONLY_PARAMS = [
  "schema",
  "connection_limit",
  "pool_timeout",
  "socket_timeout",
  "pgbouncer",
];

const LIBPQ_QUERY_TO_ENV = {
  sslmode: "PGSSLMODE",
  sslrootcert: "PGSSLROOTCERT",
  sslcert: "PGSSLCERT",
  sslkey: "PGSSLKEY",
  sslcrl: "PGSSLCRL",
  connect_timeout: "PGCONNECT_TIMEOUT",
  application_name: "PGAPPNAME",
  options: "PGOPTIONS",
  target_session_attrs: "PGTARGETSESSIONATTRS",
  gssencmode: "PGGSSENCMODE",
};

/**
 * @param {string} text
 * @returns {string}
 */
export function extractDatabaseUrlFromEnvText(text) {
  let found = 0;
  let raw = "";
  for (const line of text.split("\n")) {
    const m = line.match(/^DATABASE_URL=(.*)$/);
    if (!m) continue;
    found += 1;
    if (found > 1) {
      throw new Error("duplicate DATABASE_URL");
    }
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    raw = v;
  }
  if (!raw) {
    throw new Error("missing DATABASE_URL");
  }
  return raw;
}

/**
 * @param {string} envFilePath
 * @returns {string}
 */
export function readDatabaseUrlFromEnvFile(envFilePath) {
  const text = fs.readFileSync(envFilePath, "utf8");
  return extractDatabaseUrlFromEnvText(text);
}

/**
 * @param {string} rawUrl
 * @returns {Record<string, string>}
 */
export function databaseUrlToPgEnv(rawUrl) {
  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new Error("invalid DATABASE_URL");
  }
  if (u.protocol !== "postgresql:" && u.protocol !== "postgres:") {
    throw new Error("unsupported DATABASE_URL scheme");
  }

  const sp = new URLSearchParams(u.search);
  for (const k of PRISMA_ONLY_PARAMS) {
    sp.delete(k);
  }

  let pghost = u.hostname || "";
  if (pghost.startsWith("[") && pghost.endsWith("]")) {
    pghost = pghost.slice(1, -1);
  }

  const env = {
    PGHOST: pghost,
    PGPORT: u.port || "5432",
    PGUSER: decodeURIComponent(u.username || ""),
    PGPASSWORD: decodeURIComponent(u.password || ""),
    PGDATABASE: decodeURIComponent(u.pathname.replace(/^\//, "") || ""),
  };

  for (const [param, envName] of Object.entries(LIBPQ_QUERY_TO_ENV)) {
    const v = sp.get(param);
    if (v != null && v !== "") {
      env[envName] = v;
      sp.delete(param);
    }
  }

  const unmapped = [...sp.keys()];
  if (unmapped.length > 0) {
    throw new Error(`unmapped DATABASE_URL query param: ${unmapped.sort().join(", ")}`);
  }

  if (!env.PGDATABASE) {
    throw new Error("missing database name in DATABASE_URL");
  }

  return env;
}

/**
 * @param {string} envFilePath
 * @returns {Record<string, string>}
 */
export function pgEnvFromEnvFile(envFilePath) {
  const raw = readDatabaseUrlFromEnvFile(envFilePath);
  return databaseUrlToPgEnv(raw);
}

/**
 * @param {string} envFilePath
 * @returns {string}
 */
export function databaseNameFromEnvFile(envFilePath) {
  return pgEnvFromEnvFile(envFilePath).PGDATABASE;
}

const isMain =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  const envFile = process.argv[2];
  if (process.argv.includes("--database-name")) {
    const idx = process.argv.indexOf("--database-name");
    const file = process.argv[idx + 1];
    if (!file) {
      console.error("parse-database-env: missing path after --database-name");
      process.exit(2);
    }
    try {
      process.stdout.write(`${databaseNameFromEnvFile(file)}\n`);
      process.exit(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "parse failed";
      console.error(`parse-database-env: ${msg}`);
      process.exit(5);
    }
  }
  console.error("parse-database-env: usage: parse-database-env.mjs --database-name <env-file>");
  process.exit(2);
}
