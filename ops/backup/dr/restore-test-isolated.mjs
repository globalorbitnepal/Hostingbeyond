#!/usr/bin/env node
/**
 * Destructive restore test into an isolated database only.
 * Target must be hostingbeyond_restore_test on localhost:5432 (lab profile).
 *
 * Tunnel note: pinning 127.0.0.1:5432 does not prove the server is physically
 * local — an SSH tunnel can forward that port elsewhere. Use OS/network policy
 * or a dedicated lab host for stronger isolation (see ISOLATED-RESTORE-SETUP.md).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const LAB_DATABASE = "hostingbeyond_restore_test";
/** Documented lab port (ISOLATED-RESTORE-SETUP.md). */
export const LAB_PORT = 5432;

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
  const raw = String(env.PGPORT ?? LAB_PORT).trim();
  if (!/^\d+$/.test(raw)) {
    return { ok: false, reason: "invalid", exitCode: 10 };
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, reason: "range", exitCode: 10 };
  }
  if (port !== LAB_PORT) {
    return { ok: false, reason: "unapproved", exitCode: 9 };
  }
  return { ok: true, port };
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
  const pgdb = (process.env.PGDATABASE || "").trim();
  if (pgdb && pgdb !== LAB_DATABASE) {
    console.error("restore-test-isolated: PGDATABASE mismatch");
    process.exit(9);
  }
  const portResult = resolveLabPort();
  if (!portResult.ok) {
    if (portResult.reason === "unapproved") {
      console.error("restore-test-isolated: unapproved PGPORT");
    } else {
      console.error("restore-test-isolated: invalid PGPORT");
    }
    process.exit(portResult.exitCode);
  }
}

function resolveLocalHost() {
  const raw = (process.env.PGHOST || "127.0.0.1").trim();
  const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);
  if (!localHosts.has(raw)) {
    console.error("restore-test-isolated: refused non-local PGHOST");
    process.exit(8);
  }
  if (raw === "localhost") return "127.0.0.1";
  return raw;
}

function labConnEnv(host, port) {
  const env = { ...process.env };
  for (const key of FORBIDDEN_CONN_ENV) {
    delete env[key];
  }
  env.PGHOST = host;
  env.PGPORT = String(port);
  env.PGDATABASE = LAB_DATABASE;
  return env;
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
  const actual = runPsql(host, port, env, "SELECT current_database();");
  if (actual.status !== 0) process.exit(actual.status || 1);
  const current = actual.stdout.trim();
  if (current !== LAB_DATABASE) {
    console.error(
      `restore-test-isolated: current_database mismatch (${phase})`,
    );
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

  const host = resolveLocalHost();
  refuseConflictingEnv();
  const { port } = resolveLabPort();

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
  const out = {
    status: migrationRows > 0 ? "PASS" : "FAIL",
    migrationRows,
    verifiedAt: new Date().toISOString(),
  };
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  process.exit(out.status === "PASS" ? 0 : 1);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) main();
