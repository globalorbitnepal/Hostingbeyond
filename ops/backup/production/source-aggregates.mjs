#!/usr/bin/env node
/**
 * Read-only aggregate row counts for manifest metadata (no PII).
 * Uses the protected libpq environment. Never prints connection strings or row contents.
 */
import { spawnSync } from "node:child_process";
import { assertProductionIdentity, PRODUCTION_TARGET } from "./assert-production-database.mjs";

const SQL = `
SELECT 'CustomerUser' AS rel, COUNT(*)::bigint AS n FROM "CustomerUser"
UNION ALL SELECT 'DomainOrder', COUNT(*) FROM "DomainOrder"
UNION ALL SELECT 'DomainRegistration', COUNT(*) FROM "DomainRegistration"
UNION ALL SELECT 'WalletTransaction', COUNT(*) FROM "WalletTransaction"
UNION ALL SELECT 'HostingOrder', COUNT(*) FROM "HostingOrder"
UNION ALL SELECT 'BlogPost', COUNT(*) FROM "BlogPost"
UNION ALL SELECT 'BeyondAiSubscription', COUNT(*) FROM "BeyondAiSubscription";
`;

const identity = assertProductionIdentity(process.env);
if (!identity.ok) {
  console.error(`source-aggregates: refused database identity (${identity.reason})`);
  process.exit(7);
}

const probe = spawnSync(
  "psql",
  [
    "-v",
    "ON_ERROR_STOP=1",
    "-t",
    "-A",
    "-c",
    "SELECT current_database() || '|' || COALESCE(host(inet_server_addr()), '') || '|' || inet_server_port()::text || '|' || current_user;",
  ],
  { encoding: "utf8", env: process.env },
);
if (probe.status !== 0) {
  console.error("source-aggregates: identity probe failed");
  process.exit(probe.status || 1);
}
const [database, host, port, role] = probe.stdout.trim().split("|");
if (
  database !== PRODUCTION_TARGET.database ||
  host !== PRODUCTION_TARGET.host ||
  port !== PRODUCTION_TARGET.port ||
  role !== PRODUCTION_TARGET.role
) {
  console.error("source-aggregates: connected identity mismatch");
  process.exit(7);
}

const r = spawnSync(
  "psql",
  ["-v", "ON_ERROR_STOP=1", "-t", "-A", "-F", ",", "-c", SQL],
  { encoding: "utf8", env: process.env },
);

if (r.status !== 0) {
  console.error("source-aggregates: psql failed");
  process.exit(r.status || 1);
}

const counts = {};
for (const line of r.stdout.split("\n")) {
  const t = line.trim();
  if (!t) continue;
  const [rel, n] = t.split(",");
  counts[rel] = Number(n);
}

process.stdout.write(JSON.stringify({ tableCounts: counts }, null, 2));
