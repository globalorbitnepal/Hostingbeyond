import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { publishExportArtifacts } from "./publish-export.mjs";

function canSymlink() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb-symlink-probe-"));
  try {
    const target = path.join(dir, "t.txt");
    const link = path.join(dir, "l.txt");
    fs.writeFileSync(target, "x");
    fs.symlinkSync(target, link);
    return true;
  } catch {
    return false;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe("publish-export.mjs", () => {
  it("publishes meta and LATEST symlinks together", { skip: !canSymlink() }, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-pub-"));
    const ts = "2026-02-01_12-00-00";
    const cipher = path.join(root, `${ts}.bundle.tar.age`);
    fs.writeFileSync(cipher, "ciphertext-bytes");
    const prevCipher = path.join(root, "prev.bundle.tar.age");
    fs.writeFileSync(prevCipher, "old");
    const prevMeta = path.join(root, "prev.bundle.meta.json");
    fs.writeFileSync(prevMeta, "{}");
    fs.symlinkSync(prevCipher, path.join(root, "LATEST.bundle.tar.age"));
    fs.symlinkSync(prevMeta, path.join(root, "LATEST.bundle.meta.json"));

    const r = publishExportArtifacts({
      exportRoot: root,
      backupSetId: ts,
      ciphertextPath: cipher,
      ciphertextSha256: "abc123",
    });

    const meta = JSON.parse(fs.readFileSync(r.metaPath, "utf8"));
    assert.equal(meta.backupSetId, ts);
    assert.equal(meta.ciphertextSha256, "abc123");
    assert.equal(fs.readlinkSync(path.join(root, "LATEST.bundle.tar.age")), cipher);
    assert.equal(
      fs.readlinkSync(path.join(root, "LATEST.bundle.meta.json")),
      r.metaPath,
    );
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("rolls back LATEST symlinks when second symlink update fails", { skip: !canSymlink() }, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-pub-rollback-"));
    const ts = "2026-02-02_12-00-00";
    const cipher = path.join(root, `${ts}.bundle.tar.age`);
    fs.writeFileSync(cipher, "ciphertext");
    const prevCipher = path.join(root, "prev.bundle.tar.age");
    fs.writeFileSync(prevCipher, "old");
    fs.symlinkSync(prevCipher, path.join(root, "LATEST.bundle.tar.age"));

    const orig = fs.symlinkSync;
    fs.symlinkSync = (target, file) => {
      if (String(file).includes("LATEST.bundle.meta.json")) {
        throw new Error("simulated meta symlink failure");
      }
      return orig(target, file);
    };
    try {
      assert.throws(
        () =>
          publishExportArtifacts({
            exportRoot: root,
            backupSetId: ts,
            ciphertextPath: cipher,
            ciphertextSha256: "deadbeef",
          }),
        /simulated/,
      );
    } finally {
      fs.symlinkSync = orig;
    }
    assert.equal(
      fs.readlinkSync(path.join(root, "LATEST.bundle.tar.age")),
      prevCipher,
    );
    assert.ok(
      !fs.existsSync(path.join(root, `${ts}.bundle.meta.json`)),
      "meta file must not remain after failed publication",
    );
    fs.rmSync(root, { recursive: true, force: true });
  });
});
