import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  findNewestVerifiedSet,
  mirrorVerifiedSetToFolder,
} from "./mirror-current.mjs";

function mkRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-mirror-"));
  fs.mkdirSync(path.join(root, "backups"), { recursive: true });
  fs.mkdirSync(path.join(root, "reports"), { recursive: true });
  return root;
}

function writeVerifiedSet(root, name) {
  const setDir = path.join(root, "backups", name);
  fs.mkdirSync(setDir, { recursive: true });
  fs.writeFileSync(
    path.join(setDir, "ciphertext.bundle.tar.age"),
    "cipher",
    "utf8",
  );
  fs.writeFileSync(
    path.join(setDir, "ciphertext.meta.stderr"),
    "HB_ARTIFACT_SHA256=abc\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(root, "reports", `verify-${name}.json`),
    JSON.stringify({
      status: "PASS",
      backupSetFinalized: true,
      backupSetFolder: name,
    }),
    "utf8",
  );
}

describe("mirror-current.mjs", () => {
  it("picks the newest verified backup set", () => {
    const root = mkRoot();
    writeVerifiedSet(root, "2026-01-01_10-00-00");
    writeVerifiedSet(root, "2026-01-02_10-00-00");
    assert.equal(
      findNewestVerifiedSet(path.join(root, "backups"), root),
      "2026-01-02_10-00-00",
    );
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("mirrors ciphertext into a fixed current folder", () => {
    const root = mkRoot();
    writeVerifiedSet(root, "2026-01-03_23-00-00");
    const result = mirrorVerifiedSetToFolder({
      backupRoot: root,
      mirrorFolderName: "current",
    });
    assert.equal(result.action, "mirrored");
    assert.ok(fs.existsSync(path.join(root, "current", "ciphertext.bundle.tar.age")));
    assert.ok(fs.existsSync(path.join(root, "current", "MIRROR.json")));
    const pointer = JSON.parse(
      fs.readFileSync(path.join(root, "current", "MIRROR.json"), "utf8"),
    );
    assert.equal(pointer.backupSetFolder, "2026-01-03_23-00-00");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("replaces an older current mirror on the next run", () => {
    const root = mkRoot();
    writeVerifiedSet(root, "2026-01-04_23-00-00");
    mirrorVerifiedSetToFolder({ backupRoot: root, mirrorFolderName: "current" });
    writeVerifiedSet(root, "2026-01-05_23-00-00");
    mirrorVerifiedSetToFolder({ backupRoot: root, mirrorFolderName: "current" });
    const pointer = JSON.parse(
      fs.readFileSync(path.join(root, "current", "MIRROR.json"), "utf8"),
    );
    assert.equal(pointer.backupSetFolder, "2026-01-05_23-00-00");
    fs.rmSync(root, { recursive: true, force: true });
  });
});
