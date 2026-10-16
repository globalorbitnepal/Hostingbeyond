#!/usr/bin/env node
/**
 * Creates hostingbeyond_integration_test on localhost only.
 * Usage: node scripts/setup-integration-db.mjs --confirm
 * Does not print DATABASE_URL or passwords.
 */
import fs from "fs";
import { execSync } from "child_process";

const TEST_DB = "hostingbeyond_integration_test";
const args = new Set(process.argv.slice(2));
if (!args.has("--confirm")) {
  console.error(
    "Refusing to create database without --confirm. This creates an isolated DB on localhost only.",
  );
  process.exit(1);
}

function loadDatabaseUrl() {
  const path = ".env";
  if (!fs.existsSync(path)) throw new Error("missing .env");
  const text = fs.readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^DATABASE_URL=(.*)$/);
    if (!m) continue;
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v;
  }
  throw new Error("DATABASE_URL not found in .env");
}

const url = new URL(loadDatabaseUrl());
if (!["127.0.0.1", "localhost", "::1"].includes(url.hostname)) {
  throw new Error("refusing: DATABASE_URL host is not local");
}

const user = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
const host = url.hostname;
const port = url.port || "5432";

process.env.PGPASSWORD = password;
const psql = (db, sql) => {
  execSync(
    `psql -h ${host} -p ${port} -U ${user} -d ${db} -v ON_ERROR_STOP=1 -c ${JSON.stringify(sql)}`,
    { stdio: "pipe" },
  );
};

const adminDb = url.pathname.replace(/^\//, "") || "postgres";
const exists = execSync(
  `psql -h ${host} -p ${port} -U ${user} -d ${adminDb} -tAc "SELECT 1 FROM pg_database WHERE datname='${TEST_DB}'"`,
  { encoding: "utf8", env: process.env },
).trim();

if (exists === "1") {
  console.log(`OK: database ${TEST_DB} already exists`);
} else {
  try {
    psql(adminDb, `CREATE DATABASE ${TEST_DB}`);
    console.log(`OK: created database ${TEST_DB}`);
  } catch {
    console.error(
      `Cannot CREATE DATABASE as ${user} (no CREATEDB / no connect on postgres).`,
    );
    console.error(
      `One-time (as OS user postgres): CREATE DATABASE ${TEST_DB} OWNER ${user};`,
    );
    process.exit(1);
  }
}

url.pathname = `/${TEST_DB}`;
const outPath = ".env.integration.local";
const line = `DATABASE_URL="${url.toString()}"\n`;
fs.writeFileSync(outPath, line, { mode: 0o600 });
console.log(`OK: wrote ${outPath} (gitignored) — use for integration tests only`);
