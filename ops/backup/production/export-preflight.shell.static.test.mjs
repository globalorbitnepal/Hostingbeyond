import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const SCRIPT = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "export-preflight.sh",
);

describe("export-preflight.sh production entry (static)", () => {
  it("does not enable test-only process env approval flag", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    assert.equal(text.includes("allow-process-env-approval"), false);
    assert.equal(text.includes("allowProcessEnv"), false);
  });

  it("execs node preflight with env-file and output-parent only", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    assert.ok(text.includes("export-preflight.mjs"));
    assert.ok(text.includes("--env-file"));
    assert.ok(text.includes("--output-parent"));
  });
});
