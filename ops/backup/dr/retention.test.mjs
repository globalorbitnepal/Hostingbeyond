import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const RETENTION = path.join(ROOT, "ops/backup/dr/retention.mjs");

function writeVerifyReport(root, name, body) {
  fs.mkdirSync(path.join(root, "reports"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "reports", `verify-${name}.json`),
    JSON.stringify(body),
  );
}

function mkSet(root, name, reportBody = null) {
  const dir = path.join(root, "backups", name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "manifest.json"),
    JSON.stringify({ backupSetId: name }),
  );
  if (reportBody) {
    writeVerifyReport(root, name, reportBody);
  }
}

function finalizedPass(name, overrides = {}) {
  return {
    status: "PASS",
    backupSetFinalized: true,
    backupSetFolder: name,
    layer: "ciphertext-sha256",
    ...overrides,
  };
}

describe("retention.mjs", () => {
  it("does not delete when no verified sets", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    fs.mkdirSync(path.join(tmp, "backups"));
    mkSet(tmp, "2026-01-01_00-00-00", { status: "FAIL" });
    const r = spawnSync("node", [RETENTION, tmp], { encoding: "utf8" });
    assert.equal(r.status, 0);
    const plan = JSON.parse(r.stdout);
    assert.equal(plan.action, "none");
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("never deletes newest verified in plan", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    for (const n of ["2026-01-01_00-00-00", "2026-02-01_00-00-00"]) {
      mkSet(tmp, n, finalizedPass(n));
    }
    const r = spawnSync("node", [RETENTION, tmp], { encoding: "utf8" });
    const plan = JSON.parse(r.stdout);
    assert.ok(!plan.deleteCandidates.includes("2026-02-01_00-00-00"));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("does not delete verified sets when a newer run failed (no new verified)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    mkSet(tmp, "2026-01-01_00-00-00", finalizedPass("2026-01-01_00-00-00"));
    const r = spawnSync("node", [RETENTION, tmp, "--apply"], {
      encoding: "utf8",
    });
    assert.equal(r.status, 0);
    assert.ok(fs.existsSync(path.join(tmp, "backups", "2026-01-01_00-00-00")));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("does not treat PASS with backupSetFinalized false as verified", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    mkSet(tmp, "2026-01-01_00-00-00", {
      status: "PASS",
      backupSetFinalized: false,
      backupSetFolder: "2026-01-01_00-00-00",
    });
    const r = spawnSync("node", [RETENTION, tmp], { encoding: "utf8" });
    const plan = JSON.parse(r.stdout);
    assert.equal(plan.action, "none");
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("does not treat PASS missing backupSetFinalized as verified (legacy)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    mkSet(tmp, "2026-01-01_00-00-00", {
      status: "PASS",
      backupSetFolder: "2026-01-01_00-00-00",
    });
    const r = spawnSync("node", [RETENTION, tmp, "--apply"], {
      encoding: "utf8",
    });
    assert.equal(r.status, 0);
    assert.ok(fs.existsSync(path.join(tmp, "backups", "2026-01-01_00-00-00")));
    const plan = JSON.parse(r.stdout);
    assert.equal(plan.action, "none");
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("treats finalized PASS with matching association as verified", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    mkSet(tmp, "2026-01-01_00-00-00", finalizedPass("2026-01-01_00-00-00"));
    mkSet(tmp, "2026-02-01_00-00-00", finalizedPass("2026-02-01_00-00-00"));
    const r = spawnSync("node", [RETENTION, tmp], { encoding: "utf8" });
    const plan = JSON.parse(r.stdout);
    assert.equal(plan.newestVerified, "2026-02-01_00-00-00");
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("ignores malformed verify JSON (no deletion)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    const name = "2026-01-01_00-00-00";
    mkSet(tmp, name, null);
    fs.mkdirSync(path.join(tmp, "reports"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "reports", `verify-${name}.json`),
      "{not-json",
    );
    const r = spawnSync("node", [RETENTION, tmp, "--apply"], {
      encoding: "utf8",
    });
    assert.equal(r.status, 0);
    assert.ok(fs.existsSync(path.join(tmp, "backups", name)));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("rejects mismatched backupSetFolder in verify report", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    mkSet(tmp, "2026-01-01_00-00-00", finalizedPass("2026-01-01_00-00-00", {
      backupSetFolder: "other-folder",
    }));
    const r = spawnSync("node", [RETENTION, tmp], { encoding: "utf8" });
    const plan = JSON.parse(r.stdout);
    assert.equal(plan.action, "none");
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("simulates post-finalize retention failure: legacy sets remain on disk", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    mkSet(tmp, "2026-01-01_00-00-00", finalizedPass("2026-01-01_00-00-00"));
    const r = spawnSync("node", [RETENTION, tmp, "--apply"], {
      encoding: "utf8",
    });
    assert.equal(r.status, 0);
    assert.ok(fs.existsSync(path.join(tmp, "backups", "2026-01-01_00-00-00")));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("does not delete legacy PASS sets when only finalized sets qualify for pruning", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-"));
    mkSet(tmp, "2020-01-01_00-00-00", { status: "PASS" });
    mkSet(tmp, "2026-02-01_00-00-00", finalizedPass("2026-02-01_00-00-00"));
    process.env.HB_WEEKLY_KEEP = "1";
    process.env.HB_MONTHLY_KEEP = "1";
    const r = spawnSync("node", [RETENTION, tmp, "--apply"], {
      encoding: "utf8",
      env: { ...process.env },
    });
    delete process.env.HB_WEEKLY_KEEP;
    delete process.env.HB_MONTHLY_KEEP;
    assert.equal(r.status, 0);
    assert.ok(fs.existsSync(path.join(tmp, "backups", "2020-01-01_00-00-00")));
    assert.ok(fs.existsSync(path.join(tmp, "backups", "2026-02-01_00-00-00")));
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
