import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const SCRIPT = path.join(fileURLToPath(new URL(".", import.meta.url)), "encrypt-artifact.sh");

describe("encrypt-artifact.sh", () => {
  it("refuses to overwrite an existing ciphertext", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    assert.match(text, /output already exists \(refusing overwrite\)/);
    assert.match(text, /exit 7/);
  });

  it("removes plaintext when encryption fails and does not claim shred is universal", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    assert.match(text, /trap on_exit EXIT/);
    assert.match(text, /secure_delete "\$IN"/);
    assert.match(text, /secure_delete "\$OUT"/);
    assert.match(text, /does not prove bytes are unrecoverable/);
    assert.match(text, /exit 8/);
  });
});
