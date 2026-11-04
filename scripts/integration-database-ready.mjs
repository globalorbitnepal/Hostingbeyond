#!/usr/bin/env node
/**
 * Returns 0 when DATABASE_URL is an isolated integration target (local host,
 * expected database name, non-production role) and TCP to the host:port succeeds.
 * Does not run Prisma, migrations, or SQL.
 */
import net from "node:net";

import { checkIsolatedIntegrationDatabaseUrl } from "./isolated-database-policy.mjs";

function fail(message) {
  console.error(`INTEGRATION_DB_NOT_READY: ${message}`);
  process.exit(1);
}

const result = checkIsolatedIntegrationDatabaseUrl(process.env.DATABASE_URL);
if (!result.ok) {
  fail(result.reason);
}

const { host: rawHost, port: portText, database: db } = result.meta;
const port = Number(portText || "5432");
const host = rawHost === "localhost" ? "127.0.0.1" : rawHost;

await new Promise((resolve, reject) => {
  const socket = net.connect({ host, port, timeout: 2000 }, () => {
    socket.end();
    resolve();
  });
  socket.on("error", (err) => reject(err));
  socket.on("timeout", () => {
    socket.destroy();
    reject(new Error("connection timeout"));
  });
}).catch((err) => {
  fail(`cannot reach ${host}:${port} (${err.message})`);
});

console.log(`INTEGRATION_DB_READY: ${host}:${port}/${db}`);
process.exit(0);
