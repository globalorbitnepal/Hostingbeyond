import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const SCRIPT = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "create-pull-bundle.sh",
);

describe("create-pull-bundle.sh export gate (static)", () => {
  it("invokes export-preflight before flock and before pg_dump", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    const preflight = text.indexOf("export-preflight.sh");
    const flock = text.indexOf("flock -n");
    const dump = text.indexOf('pg_dump -Fc');
    assert.ok(preflight >= 0, "export-preflight.sh must be referenced");
    assert.ok(flock >= 0, "flock must be present");
    assert.ok(dump >= 0, "pg_dump must be present");
    assert.ok(preflight < flock, "preflight must run before lock");
    assert.ok(preflight < dump, "preflight must run before pg_dump");
  });

  it("refuses to overwrite an existing timestamped backup path", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    assert.match(text, /backup path already exists \(refusing overwrite\)/);
    assert.match(text, /exit 13/);
  });

  it("does not pass process-env approval override to preflight", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    assert.equal(text.includes("allow-process-env-approval"), false);
  });

  it("documents and prints outer ciphertext path on success (not inner bundle dir)", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    assert.match(text, /echo "\$OUTER_AGE"/);
    assert.match(text, /\.bundle\.tar\.age/);
    assert.doesNotMatch(
      text,
      /Stdout: absolute path to bundle directory \(for SCP\/rsync\)/,
    );
  });
});
