import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { APPROVAL_ENV_KEY, resolveExportApproval } from "./export-approval.mjs";

describe("export-approval production path (no process override)", () => {
  it("ignores process.env approval when override disallowed", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb-approval-prod-"));
    const envFile = path.join(dir, ".env");
    fs.writeFileSync(envFile, "HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=false\n");
    const prev = process.env[APPROVAL_ENV_KEY];
    process.env[APPROVAL_ENV_KEY] = "true";
    try {
      const r = resolveExportApproval({ envFilePath: envFile });
      assert.equal(r.ok, false);
      assert.equal(r.reason, "denied");
    } finally {
      if (prev === undefined) delete process.env[APPROVAL_ENV_KEY];
      else process.env[APPROVAL_ENV_KEY] = prev;
    }
  });
});
