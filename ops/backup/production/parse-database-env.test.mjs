import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  databaseUrlToPgEnv,
  extractDatabaseUrlFromEnvText,
  pgEnvFromEnvFile,
} from "./parse-database-env.mjs";

function envFile(content) {
  const dir = mkdtempSync(join(tmpdir(), "hb-pg-parse-"));
  const p = join(dir, ".env");
  writeFileSync(p, content, { mode: 0o600 });
  return { dir, p };
}

describe("parse-database-env.mjs", () => {
  it("parses IPv6, percent-encoding, and sslmode", () => {
    const url =
      "postgresql://user%40x:p%24%60ss%20word@[::1]:5433/hostingbeyond_db?schema=public&sslmode=require";
    const env = databaseUrlToPgEnv(url);
    assert.equal(env.PGHOST, "::1");
    assert.equal(env.PGPORT, "5433");
    assert.equal(env.PGUSER, "user@x");
    assert.equal(env.PGPASSWORD, "p$`ss word");
    assert.equal(env.PGDATABASE, "hostingbeyond_db");
    assert.equal(env.PGSSLMODE, "require");
  });

  it("preserves shell metacharacters in credentials after URL decode", () => {
    const url =
      "postgresql://u%24%28whoami%29:p%22%3Brm%20-rf%20%2F@127.0.0.1:5432/hostingbeyond_db?schema=public";
    const env = databaseUrlToPgEnv(url);
    assert.equal(env.PGUSER, "u$(whoami)");
    assert.equal(env.PGPASSWORD, 'p";rm -rf /');
    assert.equal(env.PGDATABASE, "hostingbeyond_db");
  });

  it("fails on duplicate DATABASE_URL lines", () => {
    const text = `DATABASE_URL=postgresql://a@127.0.0.1/db1\nDATABASE_URL=postgresql://b@127.0.0.1/db2\n`;
    assert.throws(() => extractDatabaseUrlFromEnvText(text), /duplicate/);
  });

  it("fails on unsupported scheme and unmapped query params", () => {
    assert.throws(
      () => databaseUrlToPgEnv("mysql://u@h/db"),
      /unsupported/,
    );
    assert.throws(
      () =>
        databaseUrlToPgEnv(
          "postgresql://u@127.0.0.1:5432/hostingbeyond_db?unknown_param=1",
        ),
      /unmapped/,
    );
  });

  it("parses documented .env.example DATABASE_URL shape", () => {
    const env = databaseUrlToPgEnv(
      "postgresql://hostingbeyond_user:YOUR_DATABASE_PASSWORD@127.0.0.1:5432/hostingbeyond_db?schema=public",
    );
    assert.equal(env.PGHOST, "127.0.0.1");
    assert.equal(env.PGPORT, "5432");
    assert.equal(env.PGUSER, "hostingbeyond_user");
    assert.equal(env.PGPASSWORD, "YOUR_DATABASE_PASSWORD");
    assert.equal(env.PGDATABASE, "hostingbeyond_db");
    assert.equal(env.PGSSLMODE, undefined);
  });

  it("reads from env file without echoing secrets", () => {
    const { dir, p } = envFile(
      'DATABASE_URL="postgresql://secret_user:secr%65t@127.0.0.1:5432/hostingbeyond_db?schema=public"\n',
    );
    const env = pgEnvFromEnvFile(p);
    assert.equal(env.PGUSER, "secret_user");
    assert.equal(env.PGPASSWORD, "secret");
    assert.equal(env.PGDATABASE, "hostingbeyond_db");
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails on malformed URL", () => {
    const { dir, p } = envFile("DATABASE_URL=not-a-url\n");
    assert.throws(() => pgEnvFromEnvFile(p), /invalid/);
    rmSync(dir, { recursive: true, force: true });
  });
});
