import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

function cleanupOnExit(state) {
  if (state.bundleOk !== 1 && state.bundleDir && fs.existsSync(state.bundleDir)) {
    fs.rmSync(state.bundleDir, { recursive: true, force: true });
  }
  if (state.outerPublished !== 1) {
    for (const p of [state.outerTar, state.outerAge, state.meta]) {
      if (p && fs.existsSync(p)) fs.rmSync(p, { force: true });
    }
  }
}

const SCRIPT = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "create-pull-bundle.cleanup.test.sh",
);

function resolveBashExecutable() {
  const probe = spawnSync("bash", ["--version"], { encoding: "utf8" });
  if (probe.status === 0) return "bash";
  if (process.platform === "win32") {
    const candidates = [
      "C:\\Program Files\\Git\\bin\\bash.exe",
      "C:\\Program Files\\Git\\usr\\bin\\bash.exe",
    ];
    for (const candidate of candidates) {
      if (!fs.existsSync(candidate)) continue;
      const winProbe = spawnSync(candidate, ["--version"], { encoding: "utf8" });
      if (winProbe.status === 0) return candidate;
    }
  }
  return null;
}

const bashExecutable = resolveBashExecutable();

describe("create-pull-bundle outer export cleanup", () => {
  it("removes unpublished outer tar, ciphertext, and meta (node)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-cleanup-"));
    const outerTar = path.join(root, "x.bundle.tar");
    const outerAge = path.join(root, "x.bundle.tar.age");
    const meta = path.join(root, "x.bundle.meta.json");
    fs.writeFileSync(outerTar, "plain");
    fs.writeFileSync(outerAge, "cipher");
    fs.writeFileSync(meta, "{}");
    cleanupOnExit({
      bundleOk: 0,
      bundleDir: null,
      outerPublished: 0,
      outerTar,
      outerAge,
      meta,
    });
    assert.ok(!fs.existsSync(outerTar));
    assert.ok(!fs.existsSync(outerAge));
    assert.ok(!fs.existsSync(meta));
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("keeps published ciphertext and meta when outer plaintext path cleared (node)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-cleanup-"));
    const outerTar = path.join(root, "x.bundle.tar");
    const outerAge = path.join(root, "x.bundle.tar.age");
    const meta = path.join(root, "x.bundle.meta.json");
    fs.writeFileSync(outerTar, "should-not-delete-after-publish");
    fs.writeFileSync(outerAge, "cipher");
    fs.writeFileSync(meta, "{}");
    cleanupOnExit({
      bundleOk: 1,
      bundleDir: null,
      outerPublished: 1,
      outerTar: "",
      outerAge,
      meta,
    });
    assert.ok(fs.existsSync(outerTar));
    assert.ok(fs.existsSync(outerAge));
    assert.ok(fs.existsSync(meta));
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("matches trap cleanup semantics (bash)", { skip: !bashExecutable }, () => {
    const r = spawnSync(bashExecutable, [SCRIPT], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.match(r.stdout, /PASS/);
  });
});
