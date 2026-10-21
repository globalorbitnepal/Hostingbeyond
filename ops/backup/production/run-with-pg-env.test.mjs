import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const SCRIPT = join(fileURLToPath(new URL(".", import.meta.url)), "run-with-pg-env.mjs");

describe("run-with-pg-env.mjs", () => {
  it("passes PG* to child without printing secrets on stdout", () => {
    const dir = mkdtempSync(join(tmpdir(), "hb-run-pg-"));
    const envFile = join(dir, ".env");
    writeFileSync(
      envFile,
      'DATABASE_URL="postgresql://u%24%28x%29:p%60y%60@127.0.0.1:5432/hostingbeyond_db?schema=public"\n',
      { mode: 0o600 },
    );
    const r = spawnSync(
      "node",
      [
        SCRIPT,
        "--env-file",
        envFile,
        "--",
        "node",
        "-e",
        "process.stdout.write(JSON.stringify({host:process.env.PGHOST,user:process.env.PGUSER,db:process.env.PGDATABASE,hasPw:!!process.env.PGPASSWORD}))",
      ],
      { encoding: "utf8" },
    );
    assert.equal(r.status, 0);
    const parsed = JSON.parse(r.stdout.trim());
    assert.equal(parsed.host, "127.0.0.1");
    assert.equal(parsed.user, "u$(x)");
    assert.equal(parsed.db, "hostingbeyond_db");
    assert.equal(parsed.hasPw, true);
    assert.ok(!r.stdout.includes("p`y`"));
    assert.ok(!r.stderr.includes("p`y`"));
    rmSync(dir, { recursive: true, force: true });
  });
});
