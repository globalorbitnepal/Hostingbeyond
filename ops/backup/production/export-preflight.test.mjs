import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  isPathInsideGitCheckout,
  isUnsafeBackupDestination,
  recipientFileLooksValid,
  runExportPreflight,
} from "./export-preflight.mjs";

describe("export-preflight", () => {
  it("blocks export when approval missing", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-preflight-"));
    const envFile = path.join(root, ".env");
    fs.writeFileSync(envFile, "DATABASE_URL=postgresql://localhost/db\n");
    const r = runExportPreflight({
      envFilePath: envFile,
      appRoot: path.join(root, "app"),
      outputParent: path.join(root, "backup-export"),
      skipDatabasePing: true,
      allowProcessEnvApproval: false,
    });
    assert.equal(r.ok, false);
    assert.equal(r.stage, "approval");
    assert.equal(r.code, 11);
  });

  it("rejects destination inside app root", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-preflight-"));
    const appRoot = path.join(root, "app");
    fs.mkdirSync(appRoot, { recursive: true });
    assert.equal(
      isUnsafeBackupDestination(path.join(appRoot, "backup-export"), appRoot),
      "inside_app_root",
    );
  });

  it("detects git checkout destinations", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-preflight-"));
    fs.mkdirSync(path.join(root, ".git"), { recursive: true });
    assert.equal(isPathInsideGitCheckout(root), true);
    assert.equal(isUnsafeBackupDestination(path.join(root, "out"), "/tmp/app"), "inside_git_checkout");
  });

  it("validates age recipient file shape", () => {
    const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "hb-age-")), "r.txt");
    fs.writeFileSync(f, "not-a-key\n");
    assert.equal(recipientFileLooksValid(f), false);
    fs.writeFileSync(f, "age1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\n");
    assert.equal(recipientFileLooksValid(f), true);
  });
});
