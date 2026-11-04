#!/usr/bin/env node
/**
 * Refuse any production export target that is not the live database.
 * Host, port, database, and role must all match. Never prints credentials.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PRODUCTION_TARGET = {
  host: "127.0.0.1",
  port: "5432",
  database: "hostingbeyond_db",
  role: "hostingbeyond_user",
};

export function assertProductionIdentity(env = process.env) {
  const host = String(env.PGHOST ?? "").trim();
  const port = String(env.PGPORT ?? "").trim();
  const database = String(env.PGDATABASE ?? "").trim();
  const role = String(env.PGUSER ?? "").trim();
  const password = String(env.PGPASSWORD ?? "");
  if (!host || host !== PRODUCTION_TARGET.host) return { ok: false, reason: "host" };
  if (!port || port !== PRODUCTION_TARGET.port) return { ok: false, reason: "port" };
  if (!database || database !== PRODUCTION_TARGET.database) return { ok: false, reason: "database" };
  if (!role || role !== PRODUCTION_TARGET.role) return { ok: false, reason: "role" };
  if (!password.trim()) return { ok: false, reason: "credentials" };
  return { ok: true };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const result = assertProductionIdentity();
  if (!result.ok) {
    console.error(`assert-production-database: refused target (${result.reason})`);
    process.exit(7);
  }
  process.exit(0);
}
