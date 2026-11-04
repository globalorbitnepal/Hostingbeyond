import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  REQUIRED_AGE_SHA256,
  assessBackupEvidence,
  backupEvidenceCliFlag,
} from "./backup-evidence-verify.mjs";

function writeTemp(name, contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb-backup-evidence-"));
  const file = path.join(dir, name);
  fs.writeFileSync(file, contents);
  return file;
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

const passReport = {
  status: "PASS",
  host: "127.0.0.1",
  port: 55433,
  database: "hostingbeyond_restore_test",
  migrationRows: 25,
  restoredArtifactSha256: REQUIRED_AGE_SHA256,
};

describe("backup evidence verify (fail closed)", () => {
  it("never treats migrate or repair approval as evidence", () => {
    const r = assessBackupEvidence({
      migrateApproved: true,
      agePath: "/tmp/missing.age",
      restoreReportPath: "/tmp/missing.json",
    });
    assert.equal(r.ok, false);
    assert.equal(r.evidence, "absent");
    assert.equal(r.reason, "SECRET_IS_NOT_BACKUP_EVIDENCE");
    assert.equal(backupEvidenceCliFlag(r), "absent");
  });

  it("rejects ciphertext that is not the published production bundle hash", () => {
    const age = writeTemp("bundle.tar.age", "not-the-production-bundle");
    const report = writeTemp("restore.json", JSON.stringify(passReport));
    const r = assessBackupEvidence({
      agePath: age,
      restoreReportPath: report,
    });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "AGE_SHA256_MISMATCH");
    assert.equal(backupEvidenceCliFlag(r), "absent");
  });

  it("rejects a restore report that does not name the production bundle", () => {
    const payload = Buffer.from("matching-bytes");
    const digest = sha256(payload);
    const age = writeTemp("bundle.tar.age", payload);
    const report = writeTemp(
      "restore.json",
      JSON.stringify({
        ...passReport,
        restoredArtifactSha256: "synthetic-schema-only",
      }),
    );
    const r = assessBackupEvidence({
      agePath: age,
      restoreReportPath: report,
      expectedAgeSha256: digest,
    });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "RESTORE_ARTIFACT_NOT_PRODUCTION_BUNDLE");
  });

  it("rejects restore PASS on production port or database", () => {
    const payload = Buffer.from("matching-bytes-2");
    const digest = sha256(payload);
    const age = writeTemp("bundle.tar.age", payload);
    const report = writeTemp(
      "restore.json",
      JSON.stringify({
        ...passReport,
        port: 5432,
        database: "hostingbeyond_db",
        restoredArtifactSha256: digest,
      }),
    );
    const r = assessBackupEvidence({
      agePath: age,
      restoreReportPath: report,
      expectedAgeSha256: digest,
    });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "RESTORE_PORT_REJECTED");
  });

  it("still verifies files when a migrate secret is also set", () => {
    const payload = Buffer.from("approval-does-not-replace-files");
    const digest = sha256(payload);
    const age = writeTemp("bundle.tar.age", payload);
    const report = writeTemp(
      "restore.json",
      JSON.stringify({
        ...passReport,
        restoredArtifactSha256: digest,
      }),
    );
    const r = assessBackupEvidence({
      agePath: age,
      restoreReportPath: report,
      expectedAgeSha256: digest,
      migrateApproved: true,
    });
    assert.equal(r.ok, true);
    assert.equal(r.evidence, "verified");
  });

  it("returns verified only when ciphertext hash and isolated restore report both match", () => {
    const payload = Buffer.from("lab-ciphertext-fixture");
    const digest = sha256(payload);
    const age = writeTemp("bundle.tar.age", payload);
    const report = writeTemp(
      "restore.json",
      JSON.stringify({
        ...passReport,
        restoredArtifactSha256: digest,
      }),
    );
    const r = assessBackupEvidence({
      agePath: age,
      restoreReportPath: report,
      expectedAgeSha256: digest,
    });
    assert.equal(r.ok, true);
    assert.equal(r.evidence, "verified");
    assert.equal(backupEvidenceCliFlag(r), "verified");
  });
});
