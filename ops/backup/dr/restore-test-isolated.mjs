#!/usr/bin/env node
/**
 * Destructive restore test into an isolated database only.
 * Target must be hostingbeyond_restore_test on 127.0.0.1:55433.
 * Ports 5432 and 55432, remote hosts, and application roles are refused.
 *
 * Tunnel note: pinning 127.0.0.1:55433 does not prove the server is physically
 * local — an SSH tunnel can forward that port elsewhere. Use OS/network policy
 * or a dedicated lab host for stronger isolation (see ISOLATED-RESTORE-SETUP.md).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const LAB_DATABASE = "hostingbeyond_restore_test";
export const LAB_HOST = "127.0.0.1";
/** Dedicated restore instance. Never 5432 (production) or 55432 (staging). */
export const LAB_PORT = 55433;
export const LAB_ROLE = "hostingbeyond_restore_test_owner";
export const REQUIRED_TABLES = ["CustomerUser", "AdminUser", "DomainOrder", "Invoice"];

const ALLOWED_PGSSLMODE = new Set(["", "disable", "prefer", "allow"]);

/** Parent env must not set these (libpq overrides / indirect routing). */
export const FORBIDDEN_CONN_ENV = [
  "DATABASE_URL",
  "PGSERVICE",
  "PGSERVICEFILE",
  "PGHOSTADDR",
  "PGOPTIONS",
  "PGSSLCERT",
  "PGSSLKEY",
  "PGSSLROOTCERT",
  "PGSSLSNIL",
];

const BLOCKED = new Set([
  "hostingbeyond_db",
  "hostingbeyond_integration_test",
  "hostingbeyond_test",
  "hostingbeyond_dev",
  "hostingbeyond_staging_db",
  "postgres",
  "template0",
  "template1",
]);

export function resolveLabPort(env = process.env) {
  const raw = String(env.PGPORT ?? "").trim();
  if (!raw) return { ok: false, reason: "missing", exitCode: 10 };
  if (!/^\d+$/.test(raw)) {
    return { ok: false, reason: "invalid", exitCode: 10 };
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, reason: "range", exitCode: 10 };
  }
  if (port === 5432 || port === 55432 || port !== LAB_PORT) {
    return { ok: false, reason: "unapproved", exitCode: 9 };
  }
  return { ok: true, port };
}

export function resolveRestoreConfig(env = process.env) {
  const host = String(env.PGHOST ?? "").trim();
  if (!host) return { ok: false, reason: "host_missing", exitCode: 8 };
  if (host !== LAB_HOST) return { ok: false, reason: "host_rejected", exitCode: 8 };

  const portResult = resolveLabPort(env);
  if (!portResult.ok) return { ok: false, reason: portResult.reason, exitCode: portResult.exitCode };

  const database = String(env.PGDATABASE ?? "").trim();
  if (!database || BLOCKED.has(database) || database !== LAB_DATABASE) {
    return { ok: false, reason: "database_rejected", exitCode: 9 };
  }

  const role = String(env.PGUSER ?? "").trim();
  if (!role || role === "hostingbeyond_user" || role !== LAB_ROLE) {
    return { ok: false, reason: "role_rejected", exitCode: 9 };
  }

  if (!String(env.PGPASSWORD ?? "").trim()) {
    return { ok: false, reason: "credentials_missing", exitCode: 9 };
  }

  return { ok: true, host, port: portResult.port, database, role };
}

export function assessServerIdentity(probe) {
  const addr = String(probe.serverAddr ?? "").replace(/\/\d+$/, "");
  if (probe.currentDatabase !== LAB_DATABASE) return { ok: false, reason: "database_identity" };
  if (addr !== LAB_HOST) return { ok: false, reason: "address_identity" };
  if (Number(probe.serverPort) !== LAB_PORT) return { ok: false, reason: "port_identity" };
  return { ok: true };
}

export function assessSchema(probe) {
  const tables = Array.isArray(probe.tables) ? probe.tables : [];
  if (!Number.isInteger(probe.migrationRows) || probe.migrationRows < 1) {
    return { ok: false, reason: "migrations" };
  }
  for (const table of REQUIRED_TABLES) {
    if (!tables.includes(table)) return { ok: false, reason: "schema" };
  }
  if (Object.prototype.hasOwnProperty.call(probe, "customerRows")) {
    return { ok: false, reason: "customer_data_forbidden" };
  }
  return { ok: true };
}

export function scrubChildEnv(parent, target) {
  const env = { ...parent };
  for (const key of FORBIDDEN_CONN_ENV) delete env[key];
  env.PGHOST = target.host;
  env.PGPORT = String(target.port);
  env.PGDATABASE = target.database;
  env.PGUSER = target.role;
  delete env.PGHOSTADDR;
  return env;
}

function refuseConflictingEnv() {
  for (const key of FORBIDDEN_CONN_ENV) {
    if (process.env[key]) {
      console.error(`restore-test-isolated: refuse ${key} in environment`);
      process.exit(9);
    }
  }
  const ssl = (process.env.PGSSLMODE || "").trim().toLowerCase();
  if (!ALLOWED_PGSSLMODE.has(ssl)) {
    console.error("restore-test-isolated: refuse PGSSLMODE for lab connection");
    process.exit(9);
  }
  const config = resolveRestoreConfig();
  if (!config.ok) {
    if (config.reason === "unapproved") {
      console.error("restore-test-isolated: unapproved PGPORT");
    } else if (config.reason === "invalid" || config.reason === "range" || config.reason === "missing") {
      console.error("restore-test-isolated: invalid PGPORT");
    } else if (config.reason === "database_rejected") {
      console.error("restore-test-isolated: PGDATABASE mismatch");
    } else if (config.reason === "role_rejected") {
      console.error("restore-test-isolated: refused database role");
    } else if (config.reason === "credentials_missing") {
      console.error("restore-test-isolated: restore credentials missing");
    } else if (config.reason === "host_missing" || config.reason === "host_rejected") {
      console.error("restore-test-isolated: refused non-local PGHOST");
    } else {
      console.error("restore-test-isolated: refused restore configuration");
    }
    process.exit(config.exitCode);
  }
}

function labConnEnv(host, port) {
  return scrubChildEnv(process.env, {
    host,
    port,
    database: LAB_DATABASE,
    role: LAB_ROLE,
  });
}

/** pg_restore argv for lab restore (exported for non-destructive tests). */
export function buildPgRestoreArgs(host, port, dumpPath) {
  return [
    "-h",
    host,
    "-p",
    String(port),
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-acl",
    "-d",
    LAB_DATABASE,
    dumpPath,
  ];
}

function runPsql(host, port, env, sql) {
  return spawnSync(
    "psql",
    [
      "-h",
      host,
      "-p",
      String(port),
      "-d",
      LAB_DATABASE,
      "-v",
      "ON_ERROR_STOP=1",
      "-t",
      "-A",
      "-c",
      sql,
    ],
    { encoding: "utf8", env },
  );
}

function assertCurrentDatabase(host, port, env, phase) {
  const actual = runPsql(
    host,
    port,
    env,
    "SELECT current_database() || '|' || COALESCE(host(inet_server_addr()), '') || '|' || inet_server_port()::text;",
  );
  if (actual.status !== 0) process.exit(actual.status || 1);
  const [currentDatabase, serverAddr, serverPort] = actual.stdout.trim().split("|");
  const identity = assessServerIdentity({ currentDatabase, serverAddr, serverPort });
  if (!identity.ok) {
    console.error(`restore-test-isolated: server identity mismatch (${phase})`);
    process.exit(4);
  }
}

function main() {
  const dump = process.argv[2];
  const expectedDb = process.argv[3];
  if (!dump || !expectedDb) {
    console.error(
      "usage: restore-test-isolated.mjs <database.dump> <expected_isolated_db_name>",
    );
    process.exit(2);
  }

  if (BLOCKED.has(expectedDb) || expectedDb !== LAB_DATABASE) {
    console.error("restore-test-isolated: refused target database name");
    process.exit(3);
  }

  refuseConflictingEnv();
  const target = resolveRestoreConfig();
  const host = target.host;
  const port = target.port;

  if (!fs.existsSync(dump)) process.exit(5);
  const dumpStat = fs.statSync(dump);
  if (!dumpStat.isFile() || dumpStat.size < 1) process.exit(5);
  for (const cmd of ["psql", "pg_restore"]) {
    const found = spawnSync("/bin/sh", ["-c", `command -v ${cmd}`], {
      encoding: "utf8",
    });
    if (found.status !== 0) {
      console.error(`restore-test-isolated: missing tool ${cmd}`);
      process.exit(7);
    }
  }

  const connEnv = labConnEnv(host, port);

  assertCurrentDatabase(host, port, connEnv, "pre-restore");

  refuseConflictingEnv();
  assertCurrentDatabase(host, port, connEnv, "immediately-before-pg_restore");

  const restore = spawnSync("pg_restore", buildPgRestoreArgs(host, port, dump), {
    encoding: "utf8",
    env: connEnv,
  });
  if (restore.status !== 0) {
    console.error("restore-test-isolated: pg_restore failed");
    process.exit(6);
  }

  const counts = runPsql(
    host,
    port,
    connEnv,
    'SELECT COUNT(*) FROM "_prisma_migrations";',
  );
  if (counts.status !== 0) process.exit(counts.status || 1);

  const migrationRows = Number(counts.stdout.trim());
  const tablesResult = runPsql(
    host,
    port,
    connEnv,
    `SELECT COALESCE(string_agg(name, ','), '') FROM (
      SELECT 'CustomerUser' AS name WHERE to_regclass('public."CustomerUser"') IS NOT NULL
      UNION ALL SELECT 'AdminUser' WHERE to_regclass('public."AdminUser"') IS NOT NULL
      UNION ALL SELECT 'DomainOrder' WHERE to_regclass('public."DomainOrder"') IS NOT NULL
      UNION ALL SELECT 'Invoice' WHERE to_regclass('public."Invoice"') IS NOT NULL
    ) found;`,
  );
  if (tablesResult.status !== 0) process.exit(tablesResult.status || 1);
  const tables = tablesResult.stdout
    .trim()
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const schema = assessSchema({ migrationRows, tables });
  const migrationPass = migrationRows > 0 ? "PASS" : "FAIL";
  const out = {
    status: migrationPass === "PASS" && schema.ok ? "PASS" : "FAIL",
    database: LAB_DATABASE,
    host: LAB_HOST,
    port: LAB_PORT,
    migrationRows,
    tables,
    trafficRedirected: false,
    verifiedAt: new Date().toISOString(),
  };
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  process.exit(out.status === "PASS" ? 0 : 1);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) main();
