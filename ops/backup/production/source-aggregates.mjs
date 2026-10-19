#!/usr/bin/env node
/**
 * Read-only aggregate row counts for manifest metadata (no PII).
 * Uses libpq env vars only — never prints connection strings.
 */
import { spawnSync } from "node:child_process";

const SQL = `
SELECT 'CustomerUser' AS rel, COUNT(*)::bigint AS n FROM "CustomerUser"
UNION ALL SELECT 'DomainOrder', COUNT(*) FROM "DomainOrder"
UNION ALL SELECT 'DomainRegistration', COUNT(*) FROM "DomainRegistration"
UNION ALL SELECT 'WalletTransaction', COUNT(*) FROM "WalletTransaction"
UNION ALL SELECT 'HostingOrder', COUNT(*) FROM "HostingOrder"
UNION ALL SELECT 'BlogPost', COUNT(*) FROM "BlogPost"
UNION ALL SELECT 'BeyondAiSubscription', COUNT(*) FROM "BeyondAiSubscription";
`;

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
