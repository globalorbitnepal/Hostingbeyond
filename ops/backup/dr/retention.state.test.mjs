import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  readVerifyStatus,
  resolveBackupSetDir,
  validateRetentionRoot,
} from "./retention.mjs";
import { spawnSync } from "node:child_process";

const REPO_ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const RETENTION = path.join(REPO_ROOT, "ops/backup/dr/retention.mjs");

describe("retention readVerifyStatus (M2)", () => {
  it("rejects PASS without backupSetFinalized", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-st-"));
    const name = "2026-03-01_00-00-00";
    const setDir = path.join(tmp, "backups", name);
    fs.mkdirSync(setDir, { recursive: true });
    fs.mkdirSync(path.join(tmp, "reports"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "reports", `verify-${name}.json`),
      JSON.stringify({ status: "PASS", backupSetFolder: name }),
    );
    assert.equal(readVerifyStatus(setDir, tmp), false);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("accepts finalized PASS with valid association", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-st-"));
    const name = "2026-03-01_00-00-00";
    const setDir = path.join(tmp, "backups", name);
    fs.mkdirSync(setDir, { recursive: true });
    fs.mkdirSync(path.join(tmp, "reports"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "reports", `verify-${name}.json`),
      JSON.stringify({
        status: "PASS",
        backupSetFinalized: true,
        backupSetFolder: name,
      }),
    );
    assert.equal(readVerifyStatus(setDir, tmp), true);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});

describe("retention root guards", () => {
  it("validateRetentionRoot refuses filesystem root", () => {
    assert.throws(() => validateRetentionRoot("/"), /refused filesystem root/);
  });

  it("resolveBackupSetDir blocks path traversal names", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-guard-"));
    const backupsDir = path.join(tmp, "backups");
    fs.mkdirSync(backupsDir, { recursive: true });
    assert.throws(
      () => resolveBackupSetDir(backupsDir, ".."),
      /invalid backup set name/,
    );
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("CLI exits non-zero for missing backups/", () => {
    const shallow = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-shallow-"));
    const r = spawnSync("node", [RETENTION, shallow], { encoding: "utf8" });
    assert.notEqual(r.status, 0);
    fs.rmSync(shallow, { recursive: true, force: true });
  });
});
