#!/usr/bin/env node
/**
 * Decrypt outer .bundle.tar.age and extract to target dir (isolated restore prep).
 * Requires HB_AGE_IDENTITY_FILE. Never logs secrets.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const artifact = path.resolve(process.argv[2] || "");
const outDir = path.resolve(process.argv[3] || "");
const identity = process.env.HB_AGE_IDENTITY_FILE?.trim();

if (!artifact || !outDir) {
  console.error(
    "usage: extract-outer-bundle.mjs <bundle.tar.age> <extract-dir>",
  );
  process.exit(2);
}
if (!identity || !fs.existsSync(identity)) {
  console.error("extract-outer-bundle: HB_AGE_IDENTITY_FILE required");
  process.exit(3);
}

fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hb-ext-"));
const tarPath = path.join(tmp, "bundle.tar");

let exitCode = 0;
try {
  const dec = spawnSync("age", ["-d", "-i", identity, "-o", tarPath, artifact], {
    encoding: "utf8",
  });
  if (dec.status !== 0) exitCode = 4;
  else {
    const ex = spawnSync("tar", ["-xf", tarPath, "-C", outDir], { encoding: "utf8" });
    exitCode = ex.status === 0 ? 0 : 5;
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
process.exit(exitCode);
