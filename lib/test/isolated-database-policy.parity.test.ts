import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkIsolatedIntegrationDatabaseUrl } from "@/lib/test/isolated-database-policy";
import { checkIsolatedIntegrationDatabaseUrl as checkScriptPolicy } from "../../scripts/isolated-database-policy.mjs";

/**
 * The TypeScript policy (used by lib/test/integration-gate.ts) and the ESM
 * policy (used by the assert / probe scripts the DBA runbook tells operators to
 * run) must agree. If they drift, an operator could get a green pre-flight from
 * the scripts while the test runner silently refuses to run integration tests —
 * or worse, the reverse.
 *
 * These cases are URL parsing only: no PostgreSQL connection, no SQL.
 */
const CASES: Array<{
  label: string;
  url: string | null | undefined;
  ok: boolean;
}> = [
  { label: "unset", url: undefined, ok: false },
  { label: "empty", url: "", ok: false },
  { label: "blank", url: "   ", ok: false },
  { label: "not a URL", url: "not-a-url", ok: false },
  {
    label: "production database",
    url: "postgresql://hostingbeyond_integration_user:x@127.0.0.1:5432/hostingbeyond_db",
    ok: false,
  },
  {
    label: "production role on integration database",
    url: "postgresql://hostingbeyond_user:x@127.0.0.1:5432/hostingbeyond_integration_test",
    ok: false,
  },
  {
    label: "remote host",
    url: "postgresql://hostingbeyond_integration_user:x@db.example.com:5432/hostingbeyond_integration_test",
    ok: false,
  },
  {
    label: "unexpected local database name",
    url: "postgresql://hostingbeyond_integration_user:x@127.0.0.1:5432/other_db",
    ok: false,
  },
  {
    label: "missing role",
    url: "postgresql://127.0.0.1:5432/hostingbeyond_integration_test",
    ok: false,
  },
  {
    label: "dedicated integration role",
    url: "postgresql://hostingbeyond_integration_user:x@127.0.0.1:55432/hostingbeyond_integration_test",
    ok: true,
  },
  {
    label: "production port",
    url: "postgresql://hostingbeyond_integration_user:x@127.0.0.1:5432/hostingbeyond_integration_test",
    ok: false,
  },
  {
    label: "localhost alias",
    url: "postgresql://hostingbeyond_integration_user:x@localhost:55432/hostingbeyond_integration_test?schema=public",
    ok: true,
  },
  {
    label: "ipv6 loopback",
    url: "postgresql://hostingbeyond_integration_user:x@[::1]:55432/hostingbeyond_integration_test",
    ok: true,
  },
];

describe("isolated database policy parity", () => {
  for (const testCase of CASES) {
    it(`agrees on: ${testCase.label}`, () => {
      const ts = checkIsolatedIntegrationDatabaseUrl(testCase.url);
      const script = checkScriptPolicy(testCase.url);
      assert.equal(ts.ok, script.ok, `ok flag differs for ${testCase.label}`);
      assert.equal(
        ts.ok,
        testCase.ok,
        `expected ok=${testCase.ok} for ${testCase.label}`,
      );
      if (!ts.ok && !script.ok) {
        assert.equal(
          ts.reason,
          script.reason,
          `reason text differs for ${testCase.label}`,
        );
      }
    });
  }

  it("never echoes a password in results or reasons", () => {
    const secret = "super-secret-placeholder";
    for (const testCase of CASES) {
      if (!testCase.url) continue;
      const withSecret = (testCase.url as string).replace(":x@", `:${secret}@`);
      for (const result of [
        checkIsolatedIntegrationDatabaseUrl(withSecret),
        checkScriptPolicy(withSecret),
      ]) {
        assert.equal(JSON.stringify(result).includes(secret), false);
      }
    }
  });
});
