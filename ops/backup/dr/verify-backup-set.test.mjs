import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const VERIFY = path.join(ROOT, "ops/backup/dr/verify-backup-set.mjs");

describe("verify-backup-set.mjs", () => {
  it("fails on missing manifest", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-v-"));
    const r = spawnSync("node", [VERIFY, tmp], { encoding: "utf8" });
    assert.notEqual(r.status, 0);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("rejects plaintext dump in bundle", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-v-plain-"));
    const dump = path.join(tmp, "database/hostingbeyond.dump");
    fs.mkdirSync(path.dirname(dump), { recursive: true });
    fs.writeFileSync(dump, "x");
    fs.writeFileSync(path.join(tmp, "database/hostingbeyond.dump.age"), "y");
    fs.writeFileSync(
      path.join(tmp, "manifest.json"),
      JSON.stringify({ backupSetId: "t", components: [] }),
    );
    const r = spawnSync("node", [VERIFY, tmp], { encoding: "utf8" });
    assert.notEqual(r.status, 0);
    const j = JSON.parse(r.stdout);
    assert.ok(j.errors.some((e) => e.includes("plaintext")));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("passes encrypted-only minimal set", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-v-"));
    const dumpAge = path.join(tmp, "database/hostingbeyond.dump.age");
    fs.mkdirSync(path.dirname(dumpAge), { recursive: true });
    fs.writeFileSync(dumpAge, "x".repeat(300));
    const sha = crypto.createHash("sha256");
    sha.update(fs.readFileSync(dumpAge));
    const hash = sha.digest("hex");
    fs.writeFileSync(
      path.join(tmp, "manifest.json"),
      JSON.stringify({
        backupSetId: "test",
        components: [
          {
            path: "database/hostingbeyond.dump.age",
            bytes: fs.statSync(dumpAge).size,
            sha256: hash,
          },
        ],
      }),
    );
    const r = spawnSync("node", [VERIFY, tmp], { encoding: "utf8" });
    assert.equal(r.status, 0);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
