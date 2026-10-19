import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";

const SCRIPT = path.resolve(
  new URL(".", import.meta.url).pathname,
  "assert-production-database.mjs",
);

function assertBlocked(name) {
  const r = spawnSync("node", [SCRIPT, name], { encoding: "utf8" });
  assert.equal(r.status, 7, `expected block for ${name}`);
}

describe("assert-production-database.mjs", () => {
  it("allows hostingbeyond_db", () => {
    const r = spawnSync("node", [SCRIPT, "hostingbeyond_db"], {
      encoding: "utf8",
    });
    assert.equal(r.status, 0);
  });

  it("blocks integration database", () => {
    assertBlocked("hostingbeyond_integration_test");
  });

  it("blocks other tenant-like database names", () => {
    assertBlocked("globalorbitnepal_db");
    assertBlocked("ambition_holidays");
    assertBlocked("hostingbeyond_restore_test");
    assertBlocked("hostingbeyond_test");
    assertBlocked("postgres");
  });
});
