import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { settleHostingQuote } from "@/lib/hosting/cart/settlement";
import type { HostingCartQuote } from "@/lib/hosting/cart/types";

const quote: HostingCartQuote = {
  configuration: {
    productSlug: "web-hosting",
    planKey: "pro",
    billingPeriod: "annually",
    domainChoice: "later",
    domainName: null,
    domainRegisterUsd: null,
    freeEmailMonth: false,
    domainPrivacy: false,
    domainProtection: false,
    addons: [],
  },
  planName: "Pro",
  productName: "Web Hosting",
  currency: "USD",
  lines: [{ id: "hosting", label: "Hosting", amount: 100, kind: "hosting" }],
  subtotal: 100,
  discount: 0,
  tax: null,
  total: 100,
  freeDomainEligible: false,
  monthlyEquivalent: 8.34,
  billedAmount: 100,
  renewalPrice: null,
  features: [],
  errors: [],
  eligibleAddonSlugs: [],
  emailTrialRenewalUsd: null,
};

describe("settleHostingQuote", () => {
  it("keeps USD totals untouched", () => {
    const settled = settleHostingQuote(quote, "USD", 1);
    assert.equal(settled.currency, "USD");
    assert.equal(settled.total, 100);
    assert.equal(settled.currencyChanged, false);
    assert.equal(settled.totalMinorUnits, 10_000);
  });

  it("converts to the charge currency with the display rate", () => {
    const settled = settleHostingQuote(quote, "EUR", 0.9);
    assert.equal(settled.currency, "EUR");
    assert.equal(settled.total, 90);
    assert.equal(settled.totalMinorUnits, 9_000);
    assert.equal(settled.lines[0]!.amount, 90);
    assert.equal(settled.currencyChanged, true);
  });

  it("falls back when the provider cannot settle the display currency", () => {
    const settled = settleHostingQuote(quote, "NPR", 154);
    assert.equal(settled.currency, "USD");
    assert.equal(settled.total, 100);
    assert.equal(settled.currencyChanged, false);
  });
});
