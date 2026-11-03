import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EXPIRY_CRITICAL_DAYS,
  EXPIRY_WARNING_DAYS,
  daysUntil,
  domainHealth,
  domainStatusLabel,
  expiryCopy,
  formatDomainDate,
  formatPanelDateTime,
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
  it("gives every health state a theme-aware pill and a label", () => {
    for (const health of [
      "healthy",
      "expiring",
      "critical",
      "expired",
      "pending",
    ] as const) {
      const tone = healthTone(health);
      assert.ok(tone.pillClass.startsWith("hb-pill-"));
      assert.ok(tone.label.length > 0);
    }
  });

  it("maps severe states to danger and warning tokens", () => {
    assert.equal(healthTone("expired").pillClass, "hb-pill-danger");
    assert.equal(healthTone("critical").pillClass, "hb-pill-warn");
    assert.equal(healthTone("healthy").pillClass, "hb-pill-ok");
  });
});

describe("formatDomainDate", () => {
  it("returns an em dash for missing or invalid input", () => {
    assert.equal(formatDomainDate(null), "—");
    assert.equal(formatDomainDate(undefined), "—");
    assert.equal(formatDomainDate("nope"), "—");
  });

  it("formats in UTC so server and browser agree", () => {
    // 00:30 UTC would render as the previous day in a negative-offset zone.
    assert.equal(formatDomainDate("2027-03-01T00:30:00.000Z"), "1 Mar 2027");
    // 23:30 UTC would render as the next day in a positive-offset zone.
    assert.equal(formatDomainDate("2027-02-28T23:30:00.000Z"), "28 Feb 2027");
  });

  it("is stable regardless of the ambient timezone", () => {
    const original = process.env.TZ;
    const value = "2027-06-15T23:45:00.000Z";
    const results: string[] = [];
    for (const tz of ["UTC", "Asia/Kathmandu", "America/Los_Angeles"]) {
      process.env.TZ = tz;
      results.push(formatDomainDate(value));
    }
    process.env.TZ = original;
    assert.deepEqual(new Set(results), new Set(["15 Jun 2027"]));
  });
});

describe("formatPanelDateTime", () => {
  it("renders a deterministic UTC timestamp", () => {
    assert.equal(
      formatPanelDateTime("2027-01-02T03:04:00.000Z"),
      "2 Jan 2027, 03:04",
    );
  });

  it("handles empty input", () => {
    assert.equal(formatPanelDateTime(null), "—");
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
