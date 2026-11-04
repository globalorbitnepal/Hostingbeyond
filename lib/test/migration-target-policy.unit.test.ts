import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  checkMigrationTargetUrl,
  redactMigrationTarget,
} from "@/lib/test/migration-target-policy";

const VALID =
  "postgresql://hb_integration_user:pw@127.0.0.1:55432/hostingbeyond_integration_test";

function reasonOf(raw: string | null | undefined): string {
  const result = checkMigrationTargetUrl(raw);
  assert.equal(result.ok, false, `expected rejection for: ${String(raw)}`);
  return result.ok ? "" : result.reason;
}

describe("checkMigrationTargetUrl — accepted shapes", () => {
  it("accepts a dedicated role on the integration database over loopback", () => {
    const result = checkMigrationTargetUrl(VALID);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.meta, {
      host: "127.0.0.1",
      port: "55432",
      database: "hostingbeyond_integration_test",
      role: "hb_integration_user",
    });
  });

  it("accepts localhost and IPv6 loopback", () => {
    for (const host of ["localhost", "[::1]"]) {
      const url = `postgresql://hb_integration_user:pw@${host}:55432/hostingbeyond_integration_test`;
      assert.equal(checkMigrationTargetUrl(url).ok, true, host);
    }
  });

  it("accepts the postgres:// scheme", () => {
    const url =
      "postgres://hb_integration_user:pw@127.0.0.1:55432/hostingbeyond_integration_test";
    assert.equal(checkMigrationTargetUrl(url).ok, true);
  });

  it("rejects production port 5432", () => {
    const url =
      "postgresql://hb_integration_user:pw@127.0.0.1:5432/hostingbeyond_integration_test";
    assert.equal(checkMigrationTargetUrl(url).ok, false);
    assert.match(reasonOf(url), /55432/);
  });

  it("accepts the allowlisted schema=public query parameter", () => {
    const url = `${VALID}?schema=public`;
    assert.equal(checkMigrationTargetUrl(url).ok, true);
  });
});

describe("checkMigrationTargetUrl — missing or malformed input", () => {
  it("rejects unset, empty, and blank values so .env can never be used", () => {
    for (const raw of [undefined, null, ""]) {
      assert.equal(reasonOf(raw), "DATABASE_URL is not set");
    }
  });

  it("rejects surrounding whitespace instead of trimming it silently", () => {
    assert.match(reasonOf(` ${VALID}`), /whitespace/);
    assert.match(reasonOf(`${VALID}\n`), /whitespace|control characters/);
  });

  it("rejects embedded control characters", () => {
    assert.match(reasonOf(`${VALID}\u0000`), /whitespace|control characters/);
  });

  it("rejects unparseable URLs", () => {
    for (const raw of ["not-a-url", "://missing-scheme", "postgresql://"]) {
      assert.match(reasonOf(raw), /not a valid URL|no hostname/);
    }
  });

  it("rejects non-postgres protocols", () => {
    assert.match(
      reasonOf("mysql://u:p@127.0.0.1:5432/hostingbeyond_integration_test"),
      /postgres protocol/,
    );
    assert.match(
      reasonOf("https://u:p@127.0.0.1:5432/hostingbeyond_integration_test"),
      /postgres protocol/,
    );
    assert.match(
      reasonOf("file:///hostingbeyond_integration_test"),
      /postgres protocol/,
    );
  });

  it("rejects percent-encoded authority components", () => {
    assert.match(
      reasonOf(
        "postgresql://hb_integration_user%40x:pw@127.0.0.1:5432/hostingbeyond_integration_test",
      ),
      /percent-encoded/,
    );
  });
});

describe("checkMigrationTargetUrl — production database and role", () => {
  it("rejects the production database name", () => {
    assert.equal(
      reasonOf(
        "postgresql://hb_integration_user:pw@127.0.0.1:5432/hostingbeyond_db",
      ),
      "forbidden production database name",
    );
  });

  it("rejects any database name that is not exactly the integration database", () => {
    for (const name of [
      "hostingbeyond_integration_test2",
      "HOSTINGBEYOND_INTEGRATION_TEST",
      "other_db",
    ]) {
      assert.match(
        reasonOf(`postgresql://hb_integration_user:pw@127.0.0.1:5432/${name}`),
        /database must be exactly|forbidden production/,
      );
    }
  });

  it("rejects the production application role on the integration database", () => {
    assert.equal(
      reasonOf(
        "postgresql://hostingbeyond_user:pw@127.0.0.1:5432/hostingbeyond_integration_test",
      ),
      "production application role is not allowed for integration",
    );
  });

  it("rejects a database URL with no username", () => {
    assert.equal(
      reasonOf("postgresql://127.0.0.1:5432/hostingbeyond_integration_test"),
      "database role is missing",
    );
  });
});

describe("checkMigrationTargetUrl — host and port strictness", () => {
  it("rejects non-loopback hosts", () => {
    for (const host of [
      "10.0.0.5",
      "192.168.1.10",
      "db.internal",
      "0.0.0.0",
      "127.0.0.1.evil.com",
    ]) {
      assert.match(
        reasonOf(
          `postgresql://hb_integration_user:pw@${host}:5432/hostingbeyond_integration_test`,
        ),
        /host must be loopback/,
      );
    }
  });

  it("rejects a missing port so the default cannot be silently assumed", () => {
    assert.match(
      reasonOf(
        "postgresql://hb_integration_user:pw@127.0.0.1/hostingbeyond_integration_test",
      ),
      /explicit port/,
    );
  });

  it("rejects out-of-range IPv4 octets", () => {
    assert.match(
      reasonOf(
        "postgresql://hb_integration_user:pw@127.0.0.999:5432/hostingbeyond_integration_test",
      ),
      /host must be loopback|valid IPv4/,
    );
  });
});

describe("checkMigrationTargetUrl — path and query ambiguity", () => {
  it("rejects extra path segments", () => {
    assert.match(reasonOf(`${VALID}/extra`), /only the database name/);
  });

  it("rejects fragments", () => {
    assert.match(reasonOf(`${VALID}#frag`), /fragment/);
  });

  it("rejects the options parameter that can change search_path", () => {
    assert.match(
      reasonOf(`${VALID}?options=-csearch_path%3Dprod`),
      /unexpected query parameter: options/,
    );
  });

  it("rejects any non-allowlisted query parameter", () => {
    for (const query of [
      "sslmode=require",
      "connection_limit=5",
      "host=evil",
      "schema=private",
    ]) {
      const result = checkMigrationTargetUrl(`${VALID}?${query}`);
      assert.equal(result.ok, false, query);
    }
  });
});

describe("redactMigrationTarget", () => {
  it("never includes the password or the full URL", () => {
    const result = checkMigrationTargetUrl(VALID);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const redacted = redactMigrationTarget(result.meta);
    assert.equal(
      redacted,
      "hb_integration_user@127.0.0.1:55432/hostingbeyond_integration_test",
    );
    assert.equal(redacted.includes("pw"), false);
    assert.equal(redacted.includes("postgres://"), false);
  });
});
