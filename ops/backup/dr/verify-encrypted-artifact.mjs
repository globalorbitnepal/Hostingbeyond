#!/usr/bin/env node
/**
 * Verify age ciphertext + optional decrypt test (isolated).
 * HB_AGE_IDENTITY_FILE — path to age identity (never log contents).
 * HB_DECRYPT_TEST=1 — decrypt to temp and pg_restore -l on inner dump.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const artifact = path.resolve(process.argv[2] || "");
const expectedSha = (process.argv[3] || "").trim();

if (!artifact) {
  console.error("usage: verify-encrypted-artifact.mjs <file.age> [expectedSha256]");
  process.exit(2);
}

const errors = [];
if (!fs.existsSync(artifact)) {
  errors.push("missing ciphertext artifact");
}

let ciphertextSha = "";
if (fs.existsSync(artifact)) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(artifact));
  ciphertextSha = h.digest("hex");
  if (expectedSha && expectedSha !== ciphertextSha) {
    errors.push("ciphertext sha256 mismatch");
  }
}

const decryptTest = process.env.HB_DECRYPT_TEST === "1";
const identityFile = process.env.HB_AGE_IDENTITY_FILE?.trim();
let decryptStatus = "skipped";

if (decryptTest) {
  if (!identityFile || !fs.existsSync(identityFile)) {
    errors.push("decrypt test requested but HB_AGE_IDENTITY_FILE missing");
  } else {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-age-"));
    try {
      const outerTar = path.join(tmp, "bundle.tar");
      const dec = spawnSync("age", ["-d", "-i", identityFile, "-o", outerTar, artifact], {
        encoding: "utf8",
      });
      if (dec.status !== 0) {
        errors.push("age decrypt failed");
      } else {
        const extract = spawnSync("tar", ["-xf", outerTar, "-C", tmp], {
          encoding: "utf8",
        });
        if (extract.status !== 0) errors.push("tar extract failed");
        else {
          const dumpAge = path.join(tmp, "database", "hostingbeyond.dump.age");
          const dumpPlain = path.join(tmp, "database", "hostingbeyond.dump");
          if (!fs.existsSync(dumpAge)) {
            errors.push("inner database dump.age missing after extract");
          } else {
            const dec2 = spawnSync(
              "age",
              ["-d", "-i", identityFile, "-o", dumpPlain, dumpAge],
              { encoding: "utf8" },
            );
            if (dec2.status !== 0) errors.push("inner dump decrypt failed");
            else {
              const list = spawnSync("pg_restore", ["-l", dumpPlain], {
                encoding: "utf8",
              });
              if (list.status !== 0) errors.push("pg_restore --list failed");
              else decryptStatus = "PASS";
              fs.rmSync(dumpPlain, { force: true });
            }
          }
        }
      }
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
}

const result = {
  artifact: path.basename(artifact),
  ciphertextSha256: ciphertextSha,
  expectedSha256: expectedSha || null,
  decryptTest: decryptStatus,
  status: errors.length === 0 ? "PASS" : "FAIL",
  errors,
  verifiedAt: new Date().toISOString(),
};

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
process.exit(errors.length === 0 ? 0 : 1);
