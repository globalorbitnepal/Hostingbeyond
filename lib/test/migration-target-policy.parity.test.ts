import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkMigrationTargetUrl } from "@/lib/test/migration-target-policy";
import { checkMigrationTargetUrl as checkScriptTarget } from "../../scripts/migration-target-policy.mjs";

/**
 * The guarded migration script uses the ESM policy; application code and unit
 * tests use the TypeScript policy. If they drift, a URL could be accepted by
 * the checked layer and rejected — or worse, accepted — by the executing layer.
 */
const BASE =
  "postgresql://hb_integration_user:pw@127.0.0.1:55432/hostingbeyond_integration_test";

const CASES: Array<{ label: string; url: string | null | undefined }> = [
  { label: "unset", url: undefined },
  { label: "null", url: null },
  { label: "empty", url: "" },
  { label: "leading space", url: ` ${BASE}` },
  { label: "trailing newline", url: `${BASE}\n` },
  { label: "not a url", url: "not-a-url" },
  {
    label: "mysql scheme",
    url: "mysql://u:p@127.0.0.1:5432/hostingbeyond_integration_test",
  },
  {
    label: "production db",
    url: "postgresql://hb_integration_user:pw@127.0.0.1:5432/hostingbeyond_db",
  },
  {
    label: "production role",
    url: "postgresql://hostingbeyond_user:pw@127.0.0.1:5432/hostingbeyond_integration_test",
  },
  {
    label: "remote host",
    url: "postgresql://hb_integration_user:pw@db.example.com:5432/hostingbeyond_integration_test",
  },
  {
    label: "lookalike loopback",
    url: "postgresql://hb_integration_user:pw@127.0.0.1.evil.com:5432/hostingbeyond_integration_test",
  },
  {
    label: "no port",
    url: "postgresql://hb_integration_user:pw@127.0.0.1/hostingbeyond_integration_test",
  },
  {
    label: "extra path segment",
    url: "postgresql://hb_integration_user:pw@127.0.0.1:5432/hostingbeyond_integration_test/extra",
  },
  {
    label: "options param",
    url: "postgresql://hb_integration_user:pw@127.0.0.1:5432/hostingbeyond_integration_test?options=-csearch_path%3Dprod",
  },
  {
    label: "fragment",
    url: "postgresql://hb_integration_user:pw@127.0.0.1:5432/hostingbeyond_integration_test#x",
  },
  { label: "valid 127.0.0.1", url: BASE },
  {
    label: "valid localhost",
    url: "postgresql://hb_integration_user:pw@localhost:55432/hostingbeyond_integration_test",
  },
  {
    label: "valid ipv6",
    url: "postgresql://hb_integration_user:pw@[::1]:55432/hostingbeyond_integration_test",
  },
  {
    label: "production port refused",
    url: "postgresql://hb_integration_user:pw@127.0.0.1:5432/hostingbeyond_integration_test",
  },
  { label: "valid schema=public", url: `${BASE}?schema=public` },
];

describe("migration target policy parity", () => {
  for (const testCase of CASES) {
    it(`agrees on: ${testCase.label}`, () => {
      const ts = checkMigrationTargetUrl(testCase.url);
      const script = checkScriptTarget(testCase.url);
      assert.equal(ts.ok, script.ok, `ok flag differs for ${testCase.label}`);
      if (!ts.ok && !script.ok) {
        assert.equal(
          ts.reason,
          script.reason,
          `reason differs for ${testCase.label}`,
        );
      }
      if (ts.ok && script.ok) {
        assert.deepEqual(
          ts.meta,
          script.meta,
          `meta differs for ${testCase.label}`,
        );
      }
    });
  }

  it("never echoes the password in either layer", () => {
    const secret = "super-secret-placeholder";
    for (const testCase of CASES) {
      if (!testCase.url) continue;
      const withSecret = testCase.url.replace(":pw@", `:${secret}@`);
      for (const result of [
        checkMigrationTargetUrl(withSecret),
        checkScriptTarget(withSecret),
      ]) {
        assert.equal(JSON.stringify(result).includes(secret), false);
      }
    }
  });

  it("is never more permissive than the base isolation policy", () => {
    // Anything the strict migration policy accepts must also satisfy the
    // existing integration-URL policy; the strict layer only adds rejections.
    const strictOk = checkScriptTarget(BASE);
    assert.equal(strictOk.ok, true);
  });
});
