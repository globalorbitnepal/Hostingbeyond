import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EXPIRY_CRITICAL_DAYS,
  EXPIRY_WARNING_DAYS,
  daysUntil,
  domainHealth,
  domainStatusLabel,
  expiryCopy,
  healthTone,
  summarizeDomains,
} from "./domain-status";

function inDays(days: number): Date {
  return new Date(Date.now() + days * 86_400_000);
}

describe("daysUntil", () => {
  it("returns null for empty or invalid input", () => {
    assert.equal(daysUntil(null), null);
    assert.equal(daysUntil(undefined), null);
    assert.equal(daysUntil("not-a-date"), null);
  });

  it("counts calendar days forward", () => {
    assert.equal(daysUntil(inDays(10)), 10);
    assert.equal(daysUntil(inDays(0)), 0);
    assert.equal(daysUntil(inDays(-5)), -5);
  });
});

describe("domainHealth", () => {
  it("treats an expired registration as expired regardless of date", () => {
    assert.equal(domainHealth("EXPIRED", inDays(200)), "expired");
  });

  it("treats non-active registrations as pending", () => {
    assert.equal(domainHealth("PENDING_REGISTRATION", inDays(200)), "pending");
    assert.equal(domainHealth("SUSPENDED", inDays(200)), "pending");
    assert.equal(domainHealth("FAILED", null), "pending");
  });

  it("flags the warning window and the critical window", () => {
    assert.equal(
      domainHealth("ACTIVE", inDays(EXPIRY_WARNING_DAYS + 1)),
      "healthy",
    );
    assert.equal(
      domainHealth("ACTIVE", inDays(EXPIRY_WARNING_DAYS)),
      "expiring",
    );
    assert.equal(
      domainHealth("ACTIVE", inDays(EXPIRY_CRITICAL_DAYS)),
      "critical",
    );
    assert.equal(domainHealth("ACTIVE", inDays(1)), "critical");
  });

  it("does not call an already-passed date healthy", () => {
    assert.equal(domainHealth("ACTIVE", inDays(0)), "expired");
    assert.equal(domainHealth("ACTIVE", inDays(-2)), "expired");
  });

  it("assumes healthy when an active domain has no expiry date", () => {
    assert.equal(domainHealth("ACTIVE", null), "healthy");
  });
});

describe("expiryCopy", () => {
  it("describes the meaningful boundaries", () => {
    assert.equal(expiryCopy(null), "No expiry on file");
    assert.equal(expiryCopy(inDays(30)), "Renews in 30 days");
    assert.equal(expiryCopy(inDays(1)), "Renews tomorrow");
    assert.equal(expiryCopy(inDays(0)), "Expires today");
    assert.equal(expiryCopy(inDays(-1)), "Expired yesterday");
    assert.equal(expiryCopy(inDays(-9)), "Expired 9 days ago");
  });
});

describe("domainStatusLabel", () => {
  it("never leaks a raw enum to the customer", () => {
    for (const status of [
      "ACTIVE",
      "PENDING_REGISTRATION",
      "EXPIRED",
      "SUSPENDED",
      "FAILED",
    ]) {
      const label = domainStatusLabel(status);
      assert.ok(label);
      assert.doesNotMatch(label, /_/, `${status} shows a raw enum`);
      assert.notEqual(label, status === "ACTIVE" ? "active" : "unmapped");
    }
  });
});

describe("healthTone", () => {
  it("gives every health state a pill and a label", () => {
    for (const health of [
      "healthy",
      "expiring",
      "critical",
      "expired",
      "pending",
    ] as const) {
      const tone = healthTone(health);
      assert.ok(tone.pill.includes("bg-"));
      assert.ok(tone.label.length > 0);
    }
  });
});

describe("summarizeDomains", () => {
  it("separates actionable states from pending ones", () => {
    const summary = summarizeDomains([
      { status: "ACTIVE", expiresAt: inDays(300) },
      { status: "ACTIVE", expiresAt: inDays(20) },
      { status: "ACTIVE", expiresAt: inDays(5) },
      { status: "EXPIRED", expiresAt: inDays(-10) },
      { status: "PENDING_REGISTRATION", expiresAt: null },
    ]);

    assert.equal(summary.total, 5);
    assert.equal(summary.active, 1);
    assert.equal(summary.expiring, 2);
    assert.equal(summary.expired, 1);
    assert.equal(summary.pending, 1);
  });

  it("handles an empty account", () => {
    assert.deepEqual(summarizeDomains([]), {
      total: 0,
      active: 0,
      expiring: 0,
      expired: 0,
      pending: 0,
    });
  });
});
