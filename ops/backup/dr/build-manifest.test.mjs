import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const BUILD = path.join(ROOT, "ops/backup/dr/build-manifest.mjs");

describe("build-manifest.mjs", () => {
  it("refuses plaintext dump in bundle", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-m-"));
    fs.mkdirSync(path.join(tmp, "database"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "database/hostingbeyond.dump"), "x");
    fs.writeFileSync(path.join(tmp, "database/hostingbeyond.dump.age"), "y");
    const r = spawnSync(
      "node",
      [BUILD, "--bundle", tmp, "--timestamp", "t"],
      { encoding: "utf8" },
    );
    assert.equal(r.status, 11);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("does not list manifest.json inside components", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-m-"));
    const dumpAge = path.join(tmp, "database/hostingbeyond.dump.age");
    fs.mkdirSync(path.dirname(dumpAge), { recursive: true });
    fs.writeFileSync(dumpAge, "encrypted-bytes");
    fs.mkdirSync(path.join(tmp, "checksums"));
    fs.writeFileSync(path.join(tmp, "checksums/SHA256SUMS"), "\n");
    spawnSync("node", [BUILD, "--bundle", tmp, "--timestamp", "t1"], {
      encoding: "utf8",
    });
    const m = JSON.parse(fs.readFileSync(path.join(tmp, "manifest.json"), "utf8"));
    assert.ok(!m.components.some((c) => c.path === "manifest.json"));
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
