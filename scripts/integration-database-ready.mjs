#!/usr/bin/env node
/**
 * Returns 0 when DATABASE_URL targets the isolated integration database
 * and TCP to the host:port succeeds. Does not run Prisma, migrations, SQL,
 * or credential checks — a listening non-CI Postgres on 5432 can still pass TCP.
 */
import net from "node:net";

const REQUIRED_DB = "hostingbeyond_integration_test";
const ALLOWED_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function fail(message) {
  console.error(`INTEGRATION_DB_NOT_READY: ${message}`);
  process.exit(1);
}

const raw = process.env.DATABASE_URL?.trim();
if (!raw) {
  fail("DATABASE_URL is not set");
}

let url;
try {
  url = new URL(raw);
} catch {
  fail("DATABASE_URL is not a valid URL");
}

if (!ALLOWED_HOSTS.has(url.hostname)) {
  fail("host must be local (127.0.0.1, localhost, or ::1)");
}

const db = url.pathname.replace(/^\//, "").split("?")[0];
if (db !== REQUIRED_DB) {
  fail(`database must be ${REQUIRED_DB}`);
}

const port = Number(url.port || "5432");
const host = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;

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
