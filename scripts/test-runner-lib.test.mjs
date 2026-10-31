import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  integrationModeFromEnv,
  mergeTapSummaries,
  parseTapSummary,
  resolveExitCode,
  shouldFailWhenIntegrationBlocked,
} from "./test-runner-lib.mjs";

describe("test-runner-lib", () => {
  it("parseTapSummary reads final TAP totals when output contains multiple runs", () => {
    const output = [
      "# tests 10",
      "# pass 8",
      "# fail 2",
      "# cancelled 0",
      "# tests 3",
      "# pass 2",
      "# fail 0",
      "# cancelled 1",
    ].join("\n");
    const summary = parseTapSummary(output);
    assert.equal(summary.tests, 3);
    assert.equal(summary.fail, 0);
    assert.equal(summary.cancelled, 1);
  });

  it("mergeTapSummaries sums TAP counters across batches", () => {
    const merged = mergeTapSummaries(
      { pass: 10, fail: 0, cancelled: 0, skipped: 1, tests: 11 },
      { pass: 5, fail: 1, cancelled: 0, skipped: 0, tests: 6 },
    );
    assert.equal(merged.pass, 15);
    assert.equal(merged.fail, 1);
    assert.equal(merged.tests, 17);
    assert.equal(merged.skipped, 1);
  });

  it("resolveExitCode forces 1 when cancelled > 0 even if child status is 0", () => {
    assert.equal(
      resolveExitCode(0, {
        fail: 0,
        cancelled: 1,
        pass: 0,
        skipped: 0,
        tests: 1,
      }),
      1,
    );
  });

  it("resolveExitCode forces 1 when TAP contains not ok but summary fail is 0", () => {
    assert.equal(
      resolveExitCode(0, {
        fail: 0,
        cancelled: 0,
        pass: 0,
        skipped: 0,
        tests: 0,
      }, "ok 1 - suite\nnot ok 2 - case\n"),
      1,
    );
  });

  it("resolveExitCode forces 1 when fail > 0 even if child status is 0", () => {
    assert.equal(
      resolveExitCode(0, {
        fail: 2,
        cancelled: 0,
        pass: 0,
        skipped: 0,
        tests: 2,
      }),
      1,
    );
  });

  it("integrationModeFromEnv recognizes required and skip", () => {
    assert.equal(integrationModeFromEnv({ INTEGRATION_TESTS: "required" }), "required");
    assert.equal(integrationModeFromEnv({ INTEGRATION_TESTS: "skip" }), "skip");
    assert.equal(integrationModeFromEnv({}), "auto");
  });

  it("shouldFailWhenIntegrationBlocked is true only for required mode when DB not ready", () => {
    assert.equal(shouldFailWhenIntegrationBlocked("required", false), true);
    assert.equal(shouldFailWhenIntegrationBlocked("auto", false), false);
    assert.equal(shouldFailWhenIntegrationBlocked("required", true), false);
  });
});
