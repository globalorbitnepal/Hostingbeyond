import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const BUILD = path.join(ROOT, "ops/backup/dr/build-manifest.mjs");
const VERIFY_ENC = path.join(ROOT, "ops/backup/dr/verify-encrypted-artifact.mjs");
const VERIFY_SET = path.join(ROOT, "ops/backup/dr/verify-backup-set.mjs");
const EXTRACT = path.join(ROOT, "ops/backup/dr/extract-outer-bundle.mjs");
const RETENTION = path.join(ROOT, "ops/backup/dr/retention.mjs");
const ENCRYPT_SH = path.join(ROOT, "ops/backup/production/encrypt-artifact.sh");

import { hasAge } from "./test-helpers.mjs";

function mkInnerBundle(tmp, ts) {
  const bundle = path.join(tmp, ts);
  fs.mkdirSync(path.join(bundle, "database"), { recursive: true });
  fs.mkdirSync(path.join(bundle, "metadata"), { recursive: true });
  fs.mkdirSync(path.join(bundle, "checksums"), { recursive: true });
  fs.writeFileSync(
    path.join(bundle, "metadata/server-facts.json"),
    JSON.stringify({ databaseName: "synthetic" }),
  );
  return bundle;
}

describe("artifact pipeline (synthetic)", () => {
  it("encrypt-artifact fails when recipient missing", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-enc-"));
    const plain = path.join(tmp, "plain.bin");
    const out = path.join(tmp, "out.age");
    fs.writeFileSync(plain, "data");
    const r = spawnSync("bash", [ENCRYPT_SH, plain, out], {
      encoding: "utf8",
      env: { ...process.env, HB_AGE_RECIPIENT_FILE: path.join(tmp, "missing.txt") },
    });
    assert.notEqual(r.status, 0);
    assert.ok(fs.existsSync(plain));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("outer checksum + inner verify after decrypt", { skip: !hasAge() }, () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-pipe-"));
    const ts = "2026-01-01_00-00-00";
    const id = path.join(tmp, "identity.txt");
    const recipient = path.join(tmp, "recipient.pub");
    spawnSync("age-keygen", ["-o", id], { encoding: "utf8", input: "\n" });
    const pub = spawnSync("age-keygen", ["-y", id], { encoding: "utf8" }).stdout.trim();
    fs.writeFileSync(recipient, pub + "\n");

    const bundle = mkInnerBundle(tmp, ts);
    const dumpPlain = path.join(bundle, "database/hostingbeyond.dump");
    fs.writeFileSync(dumpPlain, "FAKE_PG_DUMP".repeat(80));

    const dumpAge = path.join(bundle, "database/hostingbeyond.dump.age");
    spawnSync("bash", [ENCRYPT_SH, dumpPlain, dumpAge], {
      env: { ...process.env, HB_AGE_RECIPIENT_FILE: recipient },
    });
    assert.ok(!fs.existsSync(dumpPlain));

    spawnSync("node", [BUILD, "--bundle", bundle, "--timestamp", ts], {
      encoding: "utf8",
    });
    const sums = [
      ...spawnSync("find", ["database", "metadata", "-type", "f"], {
        cwd: bundle,
        encoding: "utf8",
      })
        .stdout.split("\n")
        .filter(Boolean)
        .map((rel) => {
          const h = crypto.createHash("sha256");
          h.update(fs.readFileSync(path.join(bundle, rel)));
          return `${h.digest("hex")}  ${rel}`;
        }),
      `${crypto.createHash("sha256").update(fs.readFileSync(path.join(bundle, "manifest.json"))).digest("hex")}  manifest.json`,
    ].join("\n");
    fs.writeFileSync(path.join(bundle, "checksums/SHA256SUMS"), sums + "\n");

    const outerTar = path.join(tmp, "outer.tar");
    spawnSync("tar", ["-cf", outerTar, "-C", tmp, ts], { encoding: "utf8" });
    const outerAge = path.join(tmp, "outer.tar.age");
    spawnSync("bash", [ENCRYPT_SH, outerTar, outerAge], {
      env: { ...process.env, HB_AGE_RECIPIENT_FILE: recipient },
    });

    const sha = crypto.createHash("sha256").update(fs.readFileSync(outerAge)).digest("hex");
    let r = spawnSync("node", [VERIFY_ENC, outerAge, sha], { encoding: "utf8" });
    assert.equal(r.status, 0);

    const corrupted = path.join(tmp, "bad.age");
    fs.copyFileSync(outerAge, corrupted);
    const buf = fs.readFileSync(corrupted);
    buf[buf.length - 1] ^= 0xff;
    fs.writeFileSync(corrupted, buf);
    r = spawnSync("node", [VERIFY_ENC, corrupted, sha], { encoding: "utf8" });
    assert.notEqual(r.status, 0);

    const extracted = path.join(tmp, "extracted");
    fs.mkdirSync(extracted, { recursive: true });
    r = spawnSync("node", [EXTRACT, outerAge, extracted], {
      encoding: "utf8",
      env: { ...process.env, HB_AGE_IDENTITY_FILE: id },
    });
    assert.equal(r.status, 0);
    const innerDir = path.join(extracted, ts);
    r = spawnSync("node", [VERIFY_SET, innerDir], { encoding: "utf8" });
    assert.equal(r.status, 0);
    assert.ok(!fs.existsSync(path.join(tmp, "bundle.tar")));

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("wrong key fails decrypt test and leaves no dump in tmp", { skip: !hasAge() }, () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-wk-"));
    const id1 = path.join(tmp, "a.txt");
    const id2 = path.join(tmp, "b.txt");
    spawnSync("age-keygen", ["-o", id1], { encoding: "utf8", input: "\n" });
    spawnSync("age-keygen", ["-o", id2], { encoding: "utf8", input: "\n" });
    const pub = spawnSync("age-keygen", ["-y", id1], { encoding: "utf8" }).stdout.trim();
    const plain = path.join(tmp, "p.txt");
    const cipher = path.join(tmp, "c.age");
    fs.writeFileSync(plain, "secret");
    spawnSync("age", ["-r", pub, "-o", cipher, plain], { encoding: "utf8" });
    const env = { ...process.env, HB_DECRYPT_TEST: "1", HB_AGE_IDENTITY_FILE: id2 };
    const r = spawnSync("node", [VERIFY_ENC, cipher], { encoding: "utf8", env });
    assert.notEqual(r.status, 0);
    const dumps = spawnSync("find", [os.tmpdir(), "-name", "hostingbeyond.dump"], {
      encoding: "utf8",
    });
    assert.ok(!dumps.stdout.includes(tmp));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("verify failure does not remove existing verified backup set", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ret-v-"));
    const verified = path.join(root, "backups", "2026-01-01_00-00-00");
    fs.mkdirSync(verified, { recursive: true });
    fs.writeFileSync(
      path.join(verified, "manifest.json"),
      JSON.stringify({ verification: { status: "PASS" } }),
    );
    fs.mkdirSync(path.join(root, "reports"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "reports", "verify-2026-01-01_00-00-00.json"),
      JSON.stringify({ status: "PASS" }),
    );
    const bad = path.join(root, "backups/_staging/bad-set");
    fs.mkdirSync(bad, { recursive: true });
    spawnSync("node", [VERIFY_SET, bad], { encoding: "utf8" });
    const r = spawnSync("node", [RETENTION, root, "--apply"], { encoding: "utf8" });
    assert.equal(r.status, 0);
    assert.ok(fs.existsSync(verified));
    fs.rmSync(root, { recursive: true, force: true });
  });
});
