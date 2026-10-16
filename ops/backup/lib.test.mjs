import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const LIB = `${ROOT}/ops/backup/lib.sh`;

function sourceLib() {
  return `source "${LIB}"`;
}

describe("ops/backup/lib.sh", () => {
  it("blocks production env path", () => {
    const out = execSync(
      `bash -c '${sourceLib()}; is_blocked_production_env_file /srv/apps/hostingbeyond/.env && echo blocked || echo ok'`,
      { encoding: "utf8" },
    ).trim();
    assert.equal(out, "blocked");
  });

  it("parses DATABASE_URL from env file without printing secrets", () => {
    const dir = mkdtempSync(join(tmpdir(), "hb-backup-"));
    const envFile = join(dir, ".env.test");
    writeFileSync(
      envFile,
      'DATABASE_URL="postgresql://user:secret@127.0.0.1:5432/hostingbeyond_integration_test?schema=public"\n',
      { mode: 0o600 },
    );
    const url = execSync(
      `bash -c '${sourceLib()}; database_url_from_env_file "${envFile}"'`,
      { encoding: "utf8" },
    );
    assert.ok(url.includes("hostingbeyond_integration_test"));
    assert.ok(url.includes("schema=public"));
    const pgUrl = execSync(
      `bash -c '${sourceLib()}; pg_database_url_from_env_file "${envFile}"'`,
      { encoding: "utf8" },
    );
    assert.ok(!pgUrl.includes("schema="));
    assert.ok(pgUrl.includes("hostingbeyond_integration_test"));
    const name = execSync(
      `bash -c '${sourceLib()}; database_name_from_url "${pgUrl}"'`,
      { encoding: "utf8" },
    ).trim();
    assert.equal(name, "hostingbeyond_integration_test");
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails when env file missing DATABASE_URL", () => {
    const dir = mkdtempSync(join(tmpdir(), "hb-backup-"));
    const envFile = join(dir, ".env.empty");
    writeFileSync(envFile, "# no url\n");
    assert.throws(
      () =>
        execSync(
          `bash -c '${sourceLib()}; database_url_from_env_file "${envFile}"'`,
          { stdio: "pipe" },
        ),
      (err) => err.status === 2,
    );
    rmSync(dir, { recursive: true, force: true });
  });
});
