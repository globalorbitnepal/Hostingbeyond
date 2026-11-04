#!/usr/bin/env node
/**
 * Guarded Prisma migration runner — fail-closed front door for
 * `prisma migrate deploy` against the integration database.
 *
 * WHY THIS EXISTS
 * `prisma/schema.prisma` declares `url = env("DATABASE_URL")` and the Prisma CLI
 * auto-loads `.env`. In this repository `.env` targets the production database,
 * so any bare `npx prisma migrate deploy` in a shell without an explicit
 * `DATABASE_URL` would migrate production. This script makes the integration
 * path explicit and refuses every other case.
 *
 * GUARANTEES (each independently enforced below)
 *  1. `DATABASE_URL` must be present in THIS process environment. The script
 *     never reads `.env`, never sources a file, and never falls back.
 *  2. The URL must pass the strict migration-target policy (exact database
 *     name, explicit loopback host, explicit port, dedicated role, no
 *     ambiguous query/path/fragment/encoding).
 *  3. The validated URL is pinned into the child environment. Prisma's bundled
 *     dotenv call does not override an existing process env var (verified
 *     against the installed Prisma 6.19.3 / dotenv 16.5.0 bundle), so a later
 *     `.env` load cannot repoint the target.
 *  4. Database identity is confirmed immediately before migration via `psql`
 *     `SELECT current_database(), current_user`. No match => no migration.
 *  5. Prisma is spawned directly (no shell), with the validated URL pinned in
 *     the child environment.
 *
 * WHAT THIS CANNOT PROVE
 *  - That the loopback port belongs to the cluster you think it does. The
 *    identity check narrows this but does not eliminate it (a second cluster
 *    could expose an identically named database and role).
 *  - That the role lacks CONNECT on the production database. That is DBA
 *    privilege evidence, not a client-side check.
 *  - That migrations were not applied elsewhere. That is process discipline.
 *
 * USAGE (integration only)
 *   DATABASE_URL='postgres://role@127.0.0.1:5432/hostingbeyond_integration_test' \
 *     node scripts/migrate-integration-guarded.mjs            # runs migrate deploy
 *   ... --identity-only        # only confirm identity, do not migrate
 *   ... --dry-run              # print the redacted plan, do not connect
 *   ... -- psql-args           # everything after -- is passed to psql
 *
 * This script never prints the password and never prints the full URL.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkMigrationTargetUrl, redactMigrationTarget } from "./migration-target-policy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREFLIGHT_SCRIPTS = [
  "scripts/assert-isolated-database.mjs",
  "scripts/ci-assert-integration-database.mjs",
];

function fail(code, message) {
  console.error(`MIGRATION_GUARD_FAIL: ${code}: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`migration-guard: ${message}`);
}

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const separator = argv.indexOf("--");
const flags = separator === -1 ? new Set(argv) : new Set(argv.slice(0, separator));
const psqlExtraArgs = separator === -1 ? [] : argv.slice(separator + 1);

const KNOWN_FLAGS = new Set(["--identity-only", "--dry-run", "--help", "-h"]);
for (const flag of flags) {
  if (!KNOWN_FLAGS.has(flag)) {
    fail("unknown_flag", `unrecognised argument ${flag}`);
  }
}

if (flags.has("--help") || flags.has("-h")) {
  log("usage: node scripts/migrate-integration-guarded.mjs [--identity-only] [--dry-run] [-- psql-args]");
  log("requires DATABASE_URL to be exported in the current process environment");
  process.exit(0);
}

// -------------------------------------------------------- 1. static policy
const target = checkMigrationTargetUrl(process.env.DATABASE_URL);
if (!target.ok) {
  fail("target_rejected", target.reason);
}
const meta = target.meta;
log(`target accepted: ${redactMigrationTarget(meta)}`);

// ------------------------------------------- 2. existing isolation guards
// Run the repository's existing guards as well, so this path can never be more
// permissive than the rest of the tooling.
for (const script of PREFLIGHT_SCRIPTS) {
  const result = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    encoding: "utf8",
    env: process.env,
  });
  const combined = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) {
    process.stderr.write(combined);
    fail("preflight_script_failed", `${script} rejected the target`);
  }
  log(`${script}: ok`);
}

if (flags.has("--dry-run")) {
  log("dry run: no psql query and no Prisma invocation performed");
  process.exit(0);
}

// ------------------------------------------ 3. runtime identity verification
// `psql` is the only PostgreSQL client guaranteed present where migrations run.
// We intentionally do NOT use Prisma for this: Prisma's own connection would be
// the very thing we are trying to verify.
function whichPsql() {
  const probe = spawnSync("psql", ["--version"], { encoding: "utf8" });
  return probe.status === 0;
}

if (!whichPsql()) {
  fail(
    "identity_check_unavailable",
    "psql is required to confirm database identity before migrating; refusing to run blind",
  );
}

// PGSSLMODE / PGCONNECT_TIMEOUT keep the check bounded and non-SSL for loopback.
const psqlEnv = {
  ...process.env,
  PGCONNECT_TIMEOUT: process.env.PGCONNECT_TIMEOUT ?? "10",
};

const identity = spawnSync(
  "psql",
  [
    process.env.DATABASE_URL,
    "-v",
    "ON_ERROR_STOP=1",
    "-tA",
    "-F",
    "|",
    "-c",
    "SELECT current_database(), current_user;",
    ...psqlExtraArgs,
  ],
  { cwd: ROOT, encoding: "utf8", env: psqlEnv },
);

if (identity.error) {
  fail("identity_check_failed", `could not execute psql (${identity.error.code ?? "unknown"})`);
}
if (identity.status !== 0) {
  // psql error text can include the host and user but never the password.
  const detail = (identity.stderr ?? "").trim().split("\n").slice(0, 3).join(" ");
  fail("identity_check_failed", `psql exited ${identity.status}: ${detail || "no output"}`);
}

const observed = (identity.stdout ?? "").trim();
const [observedDb, observedRole] = observed.split("|");

if (!observedDb || !observedRole) {
  fail("identity_unparsed", "psql did not return database|user as expected");
}
if (observedDb !== meta.database) {
  fail(
    "identity_mismatch",
    `connected database is ${observedDb}, expected ${meta.database}`,
  );
}
if (observedRole !== meta.role) {
  fail(
    "identity_mismatch",
    `connected role is ${observedRole}, expected ${meta.role}`,
  );
}
log(`identity confirmed: ${observedRole}@${meta.database}`);

if (flags.has("--identity-only")) {
  log("identity-only: not running migrate deploy");
  process.exit(0);
}

// ------------------------------------------------------------- 4. migration
// The validated URL is pinned explicitly into the child environment. Prisma
// auto-loads `.env`, but its bundled dotenv call does NOT override variables
// already present in the process environment (verified against the installed
// dotenv 16.5.0 bundle), so the pinned value wins over `.env`.
const childEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL,
  PRISMA_HIDE_UPDATE_MESSAGE: "1",
};

log("running: prisma migrate deploy (no shell)");
const migrate = spawnSync("npx", ["--no-install", "prisma", "migrate", "deploy"], {
  cwd: ROOT,
  stdio: "inherit",
  env: childEnv,
  shell: false,
});

if (migrate.error) {
  fail("prisma_spawn_failed", migrate.error.code ?? "unknown");
}
if (migrate.status !== 0) {
  fail("migrate_deploy_failed", `prisma exited ${migrate.status}`);
}

log("prisma migrate deploy completed");
log(`target was: ${redactMigrationTarget(meta)}`);
