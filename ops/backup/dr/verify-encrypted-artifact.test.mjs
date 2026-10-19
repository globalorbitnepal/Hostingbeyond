import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { hasAge } from "./test-helpers.mjs";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const VERIFY = path.join(ROOT, "ops/backup/dr/verify-encrypted-artifact.mjs");

describe("verify-encrypted-artifact.mjs", () => {
  it("fails checksum mismatch", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-age-"));
    const f = path.join(tmp, "x.age");
    fs.writeFileSync(f, "cipher");
    const r = spawnSync("node", [VERIFY, f, "0".repeat(64)], { encoding: "utf8" });
    assert.notEqual(r.status, 0);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("passes checksum match without decrypt test", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-age-"));
    const f = path.join(tmp, "x.age");
    fs.writeFileSync(f, "cipher-data");
    const sha = crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
    const r = spawnSync("node", [VERIFY, f, sha], { encoding: "utf8" });
    assert.equal(r.status, 0);
    const j = JSON.parse(r.stdout);
    assert.equal(j.decryptTest, "skipped");
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("fails decrypt test with wrong identity", { skip: !hasAge() }, () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-age-"));
    const id1 = path.join(tmp, "id1.txt");
    const id2 = path.join(tmp, "id2.txt");
    const plain = path.join(tmp, "plain.txt");
    const cipher = path.join(tmp, "c.age");
    fs.writeFileSync(plain, "hello backup test");
    spawnSync("age-keygen", ["-o", id1], { encoding: "utf8", input: "\n" });
    spawnSync("age-keygen", ["-o", id2], { encoding: "utf8", input: "\n" });
    const pub = spawnSync("age-keygen", ["-y", id1], { encoding: "utf8" }).stdout.trim();
    spawnSync("age", ["-r", pub, "-o", cipher, plain], { encoding: "utf8" });
    const env = { ...process.env, HB_DECRYPT_TEST: "1", HB_AGE_IDENTITY_FILE: id2 };
    const r = spawnSync("node", [VERIFY, cipher], { encoding: "utf8", env });
    assert.notEqual(r.status, 0);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("decrypt test fails on non-pg_restore payload", { skip: !hasAge() }, () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-age-nopg-"));
    const id = path.join(tmp, "id.txt");
    spawnSync("age-keygen", ["-o", id], { encoding: "utf8", input: "\n" });
    const pub = spawnSync("age-keygen", ["-y", id], { encoding: "utf8" }).stdout.trim();
    const plain = path.join(tmp, "not-a-dump");
    const cipher = path.join(tmp, "c.age");
    fs.writeFileSync(plain, "not postgres custom archive");
    spawnSync("age", ["-r", pub, "-o", cipher, plain], { encoding: "utf8" });
    const env = { ...process.env, HB_DECRYPT_TEST: "1", HB_AGE_IDENTITY_FILE: id };
    const r = spawnSync("node", [VERIFY, cipher], { encoding: "utf8", env });
    assert.notEqual(r.status, 0);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
