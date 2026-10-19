import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DIR = path.resolve(new URL(".", import.meta.url).pathname);
const PS1 = path.join(DIR, "Invoke-HostingBeyondBackup.ps1");
const LOCK_PS1 = path.join(DIR, "HostingBeyondBackup-Lock.ps1");

function indexOfLine(text, pattern) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) return i;
  }
  return -1;
}

describe("Invoke-HostingBeyondBackup.ps1 ordering", () => {
  it("writes verify report only after staging is moved to completed", () => {
    const text = fs.readFileSync(PS1, "utf8");
    const finalizeIdx = indexOfLine(
      text,
      /Move-Item -LiteralPath \$staging -Destination \$completed/,
    );
    const verifyWriteIdx = indexOfLine(
      text,
      /Write-BackupVerifyReport -ReportPath \$verifyReportPath/,
    );
    const retentionIdx = indexOfLine(text, /retention\.mjs.*--apply/);
    const lastRunIdx = indexOfLine(text, /\$report = @\{/);

    assert.ok(finalizeIdx >= 0, "finalize Move-Item missing");
    assert.ok(verifyWriteIdx >= 0, "Write-BackupVerifyReport missing");
    assert.ok(
      verifyWriteIdx > finalizeIdx,
      "verify report must be written after finalization",
    );
    assert.ok(
      retentionIdx > verifyWriteIdx,
      "retention must run after verify report",
    );
    assert.ok(
      lastRunIdx > retentionIdx,
      "last-run SUCCESS must follow retention (M1)",
    );
  });

  it("does not write verify report before ciphertext SHA verification", () => {
    const text = fs.readFileSync(PS1, "utf8");
    const shaIdx = indexOfLine(text, /Ciphertext verification failed/);
    const earlyWriteIdx = text.indexOf(
      "Set-Content -LiteralPath $verifyReportPath",
    );
    assert.ok(shaIdx >= 0);
    assert.equal(
      earlyWriteIdx,
      -1,
      "must not Set-Content verify report before finalization helper",
    );
  });

  it("uses PID-scoped lock release (does not steal foreign locks)", () => {
    const text = fs.readFileSync(PS1, "utf8");
    const lockText = fs.readFileSync(LOCK_PS1, "utf8");
    assert.match(text, /HostingBeyondBackup-Lock\.ps1/);
    assert.match(lockText, /function Release-BackupLock/);
    assert.match(lockText, /\$owner -eq \[string\]\$PID/);
    assert.match(lockText, /function Acquire-BackupLock/);
    assert.match(lockText, /Test-BackupLockProcessAlive/);
    assert.match(lockText, /System\.Threading\.Mutex/);
    assert.match(text, /Acquire-BackupLock -BackupRoot \$backupRoot/);
  });

  it("writes last-run FAIL via Write-LastRunFail when backupRoot is known", () => {
    const text = fs.readFileSync(PS1, "utf8");
    assert.match(text, /function Write-LastRunFail/);
    assert.match(text, /Write-LastRunFail -BackupRoot \$backupRoot/);
    const tryIdx = text.indexOf("try {");
    const configIdx = text.indexOf("Read-JsonFile $ConfigPath");
    assert.ok(configIdx > tryIdx, "config read must be inside try");
  });

  it("main catch records FAIL via Write-LastRunFail (no stale SUCCESS)", () => {
    const text = fs.readFileSync(PS1, "utf8");
    const marker = "catch {\n  if ($backupRoot)";
    const idx = text.indexOf(marker);
    assert.ok(idx >= 0, "main catch block missing");
    const catchBlock = text.slice(idx);
    assert.match(catchBlock, /Write-LastRunFail -BackupRoot \$backupRoot/);
    assert.ok(
      !catchBlock.includes('status = "SUCCESS"'),
      "main catch must not write SUCCESS",
    );
  });

  it("fails closed when retention apply fails before last-run SUCCESS", () => {
    const text = fs.readFileSync(PS1, "utf8");
    assert.match(text, /Retention apply failed/);
    const retentionIdx = indexOfLine(text, /Retention apply failed/);
    const lastRunIdx = indexOfLine(
      text,
      /Set-Content -LiteralPath \(Join-Path \$backupRoot "reports\\last-run\.json"\)/,
    );
    assert.ok(retentionIdx < lastRunIdx);
  });
});
