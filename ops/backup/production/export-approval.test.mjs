import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  APPROVAL_ENV_KEY,
  parseApprovalFromEnvText,
  resolveExportApproval,
} from "./export-approval.mjs";

describe("export-approval", () => {
  it("missing approval fails closed", () => {
    assert.equal(parseApprovalFromEnvText("DATABASE_URL=postgresql://x\n").state, "missing");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb-approval-"));
    const envFile = path.join(dir, ".env");
    fs.writeFileSync(envFile, "FOO=bar\n");
    const r = resolveExportApproval({ envFilePath: envFile });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "missing");
  });

  it("explicit false blocks export", () => {
    assert.equal(
      parseApprovalFromEnvText("HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=false\n").state,
      "denied",
    );
  });

  it("explicit true in env file approves", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb-approval-"));
    const envFile = path.join(dir, ".env");
    fs.writeFileSync(
      envFile,
      "HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=true\nDATABASE_URL=postgresql://u:p@127.0.0.1/db\n",
    );
    const r = resolveExportApproval({ envFilePath: envFile });
    assert.equal(r.ok, true);
    assert.equal(r.source, "env_file");
  });

  it("process env override only when allowed (tests)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb-approval-"));
    const envFile = path.join(dir, ".env");
    fs.writeFileSync(envFile, "HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=false\n");
    const prev = process.env[APPROVAL_ENV_KEY];
    process.env[APPROVAL_ENV_KEY] = "true";
    try {
      assert.equal(resolveExportApproval({ envFilePath: envFile }).ok, false);
      assert.equal(
        resolveExportApproval({
          envFilePath: envFile,
          allowProcessEnvOverride: true,
        }).ok,
        true,
      );
    } finally {
      if (prev === undefined) delete process.env[APPROVAL_ENV_KEY];
      else process.env[APPROVAL_ENV_KEY] = prev;
    }
  });

  it("does not treat empty default as approval", () => {
    assert.equal(parseApprovalFromEnvText("HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=\n").state, "denied");
  });
});
