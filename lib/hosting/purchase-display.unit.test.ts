import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { convertUsdToLocal, formatUsdAsLocal } from "@/config/pricing";
import { hostingPurchaseDisplay } from "@/lib/hosting/purchase-display";

describe("hostingPurchaseDisplay", () => {
  it("keeps monthly ledger amounts in USD", () => {
    const out = hostingPurchaseDisplay({
      monthlyPrice: 7.99,
      yearlyPrice: 95.88,
      billing: "monthly",
      currency: "USD",
    });
    assert.equal(out.isUsdLedger, true);
    assert.equal(out.displayAmount, 7.99);
    assert.equal(out.billedAmount, 7.99);
    assert.equal(out.billedPeriod, "month");
    assert.match(out.priceLabel, /7\.99/);
    assert.match(out.billedLabel, /7\.99/);
  });

  it("uses yearly/12 for the advertised monthly equivalent", () => {
    const out = hostingPurchaseDisplay({
      monthlyPrice: 7.99,
      yearlyPrice: 120,
      billing: "annually",
      currency: "USD",
    });
    assert.equal(out.displayAmount, 10);
    assert.equal(out.billedAmount, 120);
    assert.equal(out.billedPeriod, "year");
    assert.match(out.billedLabel, /120\.00/);
  });

  it("does not apply INR/NPR display FX to ledger labels", () => {
    const out = hostingPurchaseDisplay({
      monthlyPrice: 10,
      yearlyPrice: 120,
      billing: "monthly",
      currency: "USD",
    });
    const inrDisplay = formatUsdAsLocal(10, "INR", "en-IN");
    assert.equal(convertUsdToLocal(10, "INR"), 950);
    assert.notEqual(out.priceLabel, inrDisplay);
    assert.ok(!out.priceLabel.includes("₹"));
  });

  it("does not treat non-USD plan currency as a USD catalog amount", () => {
    const out = hostingPurchaseDisplay({
      monthlyPrice: 10,
      yearlyPrice: 120,
      billing: "monthly",
      currency: "EUR",
    });
    assert.equal(out.isUsdLedger, false);
    assert.equal(out.displayAmount, 10);
  });

  it("does not invent amounts from non-finite plan prices", () => {
    const out = hostingPurchaseDisplay({
      monthlyPrice: Number.NaN,
      yearlyPrice: Number.POSITIVE_INFINITY,
      billing: "monthly",
      currency: "USD",
    });
    assert.equal(out.displayAmount, 0);
    assert.equal(out.billedAmount, 0);
  });
});
