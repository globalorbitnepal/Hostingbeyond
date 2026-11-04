import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { assertProductionIdentity } from "./assert-production-database.mjs";

const SCRIPT = path.join(fileURLToPath(new URL(".", import.meta.url)), "source-aggregates.mjs");

const productionEnv = {
  PGHOST: "127.0.0.1",
  PGPORT: "5432",
  PGDATABASE: "hostingbeyond_db",
  PGUSER: "hostingbeyond_user",
  PGPASSWORD: "unused-test-value",
};

describe("source-aggregates identity", () => {
  it("accepts only the production target before any query", () => {
    assert.equal(assertProductionIdentity(productionEnv).ok, true);
    assert.equal(assertProductionIdentity({ ...productionEnv, PGPORT: "55432" }).ok, false);
    assert.equal(assertProductionIdentity({ ...productionEnv, PGPORT: "55433" }).ok, false);
    assert.equal(assertProductionIdentity({ ...productionEnv, PGHOST: "10.1.1.1" }).ok, false);
    assert.equal(
      assertProductionIdentity({ ...productionEnv, PGDATABASE: "hostingbeyond_restore_test" }).ok,
      false,
    );
  });

  it("probes server identity and does not replace a database failure with an empty object", () => {
    const text = fs.readFileSync(SCRIPT, "utf8");
    assert.match(text, /assertProductionIdentity/);
    assert.match(text, /current_database\(\)/);
    assert.match(text, /inet_server_addr\(\)/);
    assert.match(text, /inet_server_port\(\)/);
    assert.match(text, /connected identity mismatch/);
    assert.equal(text.includes("JSON.stringify({ tableCounts: {} })"), false);
    assert.match(text, /COUNT\(\*\)/);
    assert.doesNotMatch(text, /SELECT \*/);
  });
});
