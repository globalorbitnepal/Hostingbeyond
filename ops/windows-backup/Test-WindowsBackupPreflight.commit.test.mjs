import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const DIR = path.resolve(new URL(".", import.meta.url).pathname);
const PS1 = path.join(DIR, "Test-WindowsBackupPreflight.ps1");
const BASELINE_FILE = path.join(DIR, "trusted-backup-tooling-baseline.txt");
const REPO_ROOT = path.resolve(DIR, "../..");

function readBaselineSha() {
  const text = fs.readFileSync(BASELINE_FILE, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (/^[0-9a-f]{40}$/.test(t)) return t;
  }
  throw new Error("baseline sha not found");
}

function isAncestor(baseline, head) {
  const r = spawnSync("git", ["merge-base", "--is-ancestor", baseline, head], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return r.status === 0;
}

describe("backup tooling commit validation", () => {
  it("baseline file defines the minimum trusted tooling commit", () => {
    const baseline = readBaselineSha();
    assert.equal(baseline, "34e6c3fd560014b2a63acbe8e8563d6c9c15bfdf");
  });

  it("current HEAD is at or after baseline (fixes stale exact-SHA false failure)", () => {
    const baseline = readBaselineSha();
    const head = spawnSync("git", ["rev-parse", "HEAD"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).stdout.trim();
    assert.ok(head.length === 40);
    assert.ok(
      isAncestor(baseline, head),
      `expected ${head} to be descendant of baseline ${baseline}`,
    );
  });

  it("rejects pre-backup-tooling commit 78a30a7", () => {
    const baseline = readBaselineSha();
    const old = "78a30a79cf3ff318f548653bc56e754fd00a2ab1";
    assert.equal(isAncestor(baseline, old), false);
  });

  it("preflight script does not hardcode a single HEAD equality check", () => {
    const text = fs.readFileSync(PS1, "utf8");
    assert.doesNotMatch(text, /\$sha\s*-eq\s*"[0-9a-f]{40}"/);
    assert.match(text, /merge-base --is-ancestor/);
    assert.match(text, /git_backup_tooling_commit/);
    assert.match(text, /trusted-backup-tooling-baseline\.txt/);
  });
});
