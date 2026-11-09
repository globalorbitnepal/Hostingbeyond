import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildTransferRequirements,
  isRegistryLocked,
  parseNameSiloTransferAvailability,
  transferRequirementsReady,
} from "@/lib/domains/transfer-requirements";

describe("NameSilo transfer availability parsing", () => {
  it("reads the available domain price and renewal", () => {
    const parsed = parseNameSiloTransferAvailability(
      {
        reply: {
          code: 300,
          available: {
            domain: {
              domain: "google.com",
              price: 11.5,
              renew: 12,
              premium: 0,
            },
          },
        },
      },
      "google.com",
    );
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.supplierTransfer, 11.5);
    assert.equal(parsed.supplierRenew, 12);
    assert.equal(parsed.premium, false);
  });

  it("surfaces the registrar reason when not transferable", () => {
    const parsed = parseNameSiloTransferAvailability(
      {
        reply: {
          code: 300,
          unavailable: {
            domain: {
              domain: "nope.com",
              reason:
                "This domain cannot be transferred since it is not currently registered.",
            },
          },
        },
      },
      "nope.com",
    );
    assert.equal(parsed.ok, false);
    if (parsed.ok) return;
    assert.match(parsed.reason, /not currently registered/i);
  });
});

describe("registry lock detection", () => {
  it("treats transfer prohibited as locked", () => {
    assert.equal(
      isRegistryLocked([
        "client transfer prohibited",
        "client delete prohibited",
      ]),
      true,
    );
  });
  it("treats ok as unlocked", () => {
    assert.equal(isRegistryLocked(["ok"]), false);
  });
  it("returns null when statuses are empty", () => {
    assert.equal(isRegistryLocked([]), null);
  });
});

describe("transfer requirements", () => {
  const now = new Date("2026-11-09T00:00:00.000Z");

  it("fails the checklist for a locked, recently registered domain", () => {
    const rows = buildTransferRequirements({
      registrarAvailable: true,
      registeredOn: "2026-10-20",
      statuses: ["client transfer prohibited"],
      now,
    });
    assert.equal(transferRequirementsReady(rows), false);
    assert.equal(rows.find((r) => r.id === "unlocked")?.state, "fail");
    assert.equal(rows.find((r) => r.id === "age")?.state, "fail");
  });

  it("passes lock and age for an old unlocked domain", () => {
    const rows = buildTransferRequirements({
      registrarAvailable: true,
      registeredOn: "2019-09-09",
      statuses: ["ok"],
      now,
    });
    assert.equal(transferRequirementsReady(rows), true);
  });

  it("fails when the registrar says the domain is not registered", () => {
    const rows = buildTransferRequirements({
      registrarAvailable: false,
      registrarReason: "not currently registered",
      registeredOn: null,
      statuses: [],
      now,
    });
    assert.equal(transferRequirementsReady(rows), false);
    assert.equal(rows.find((r) => r.id === "registered")?.state, "fail");
  });
});
