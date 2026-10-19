import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const PS1 = path.resolve(
  new URL(".", import.meta.url).pathname,
  "Test-WindowsBackupPreflight.ps1",
);

describe("Test-WindowsBackupPreflight.ps1 encoding", () => {
  it("uses ASCII-only source (Windows PowerShell 5.1 default encoding safe)", () => {
    const text = fs.readFileSync(PS1, "utf8");
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      assert.ok(
        code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126),
        `non-ASCII at index ${i}: U+${code.toString(16)}`,
      );
    }
  });

  it("does not contain UTF-8 em dash (common PS 5.1 parser break)", () => {
    const text = fs.readFileSync(PS1, "utf8");
    assert.equal(text.includes("\u2014"), false, "em dash found");
    assert.equal(text.includes("\u2013"), false, "en dash found");
  });

  it("avoids ambiguous nested-quote patterns on config_json detail line", () => {
    const text = fs.readFileSync(PS1, "utf8");
    assert.match(
      text,
      /detail = if \(\$configPresent\) \{ "present \(contents not logged\)" \} else \{ "missing; copy from config\.example\.json" \}/,
    );
  });

  it("baseline sidecar is ASCII-only", () => {
    const baselinePath = path.join(
      path.dirname(PS1),
      "trusted-backup-tooling-baseline.txt",
    );
    const text = fs.readFileSync(baselinePath, "utf8");
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      assert.ok(
        code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126),
        `non-ASCII in baseline at ${i}`,
      );
    }
  });
});
