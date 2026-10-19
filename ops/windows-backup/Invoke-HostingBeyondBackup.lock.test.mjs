import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const DIR = path.resolve(new URL(".", import.meta.url).pathname);
const PS1 = path.join(DIR, "Invoke-HostingBeyondBackup.ps1");
const LOCK_PS1 = path.join(DIR, "HostingBeyondBackup-Lock.ps1");
const HARNESS_MD = path.join(DIR, "BACKUP-LOCK-TEST-HARNESS.md");

function extractFunction(text, name) {
  const start = text.indexOf(`function ${name}`);
  assert.ok(start >= 0, `${name} missing`);
  const nextFn = text.indexOf("\nfunction ", start + 1);
  return text.slice(start, nextFn > start ? nextFn : undefined);
}

describe("HostingBeyondBackup-Lock.ps1 lock safety (static)", () => {
  const main = fs.readFileSync(PS1, "utf8");
  const text = fs.readFileSync(LOCK_PS1, "utf8");
  const acquire = extractFunction(text, "Acquire-BackupLock");
  const release = extractFunction(text, "Release-BackupLock");
  const stale = extractFunction(text, "Remove-StaleLockFileIfSafe");
  const writeLock = extractFunction(text, "Write-LockFileExclusive");

  it("production script dot-sources shared lock module (no duplicate lock bodies)", () => {
    assert.match(main, /HostingBeyondBackup-Lock\.ps1/);
    assert.doesNotMatch(main, /function Acquire-BackupLock/);
  });

  it("documents Windows concurrent harness (Linux static tests are insufficient)", () => {
    assert.ok(fs.existsSync(HARNESS_MD));
    const doc = fs.readFileSync(HARNESS_MD, "utf8");
    assert.match(doc, /Test-BackupLockHarness\.ps1/);
    assert.match(doc, /cannot validate|cannot prove|do not prove/i);
    assert.ok(fs.existsSync(path.join(DIR, "Test-BackupLockHarness.ps1")));
  });

  it("uses named mutex for atomic acquisition (not Test-Path then Set-Content)", () => {
    assert.match(acquire, /System\.Threading\.Mutex/);
    assert.match(acquire, /\.WaitOne\(0\)/);
    assert.doesNotMatch(acquire, /Set-Content -LiteralPath \$LockPath/);
    assert.match(text, /Write-LockFileExclusive/);
  });

  it("creates lock file with exclusive FileMode.CreateNew", () => {
    assert.match(writeLock, /\[System\.IO\.FileMode\]::CreateNew/);
    assert.match(writeLock, /\[System\.IO\.FileShare\]::None/);
  });

  it("never removes stale lock by age when owner process is live", () => {
    assert.match(stale, /Test-BackupLockProcessAlive/);
    assert.match(stale, /live process/);
    const liveIdx = stale.indexOf("Test-BackupLockProcessAlive");
    const removeIdx = stale.indexOf("Remove-Item");
    assert.ok(liveIdx >= 0 && removeIdx > liveIdx);
  });

  it("throws when lock owner process is still alive (mutex failure path)", () => {
    assert.match(acquire, /if \(\$null -ne \$ownerPid -and \(Test-BackupLockProcessAlive/);
    assert.match(acquire, /lock held by process/);
  });

  it("Release-BackupLock removes file only for matching PID and releases mutex", () => {
    assert.match(release, /\$owner -eq \[string\]\$PID/);
    assert.match(release, /ReleaseMutex/);
    assert.match(release, /\$script:BackupMutex/);
  });

  it("finally releases lock only when lockOwned", () => {
    assert.match(main, /\$lockOwned/);
    assert.match(main, /if \(\$lockOwned -and \$lockFile\)/);
    assert.match(main, /Release-BackupLock -LockPath \$lockFile/);
  });

  it("catch does not remove completed backups or verify reports", () => {
    const marker = "catch {\n  if ($backupRoot)";
    const catchBlock = main.slice(main.indexOf(marker));
    assert.doesNotMatch(catchBlock, /Remove-Item[\s\S]*backups\\/);
    assert.doesNotMatch(catchBlock, /verify-/);
  });
});
