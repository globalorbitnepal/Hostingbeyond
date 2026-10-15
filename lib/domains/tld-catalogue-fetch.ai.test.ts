import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseProductTldListDto } from "@/lib/domains/providers/tld-catalogue-fetch";

/** Shape from LIVE DNA .ai catalogue (2026-10-15 audit). */
const LIVE_AI_CATALOGUE_ROW = {
  name: "ai",
  minRegistrationPeriod: 2,
  maxRegistrationPeriod: 10,
  registrationPeriods: [2, 4, 6, 8, 10],
  renewalPeriods: [2, 4, 6, 8, 10],
  prices: [
    {
      priceGroup: "Reseller",
      register: [
        { period: 2, price: 199.8, currency: "USD" },
        { period: 4, price: 399.6, currency: "USD" },
      ],
      renew: [{ period: 2, price: 199.8, currency: "USD" }],
      transfer: [{ period: 1, price: 99.9, currency: "USD" }],
    },
  ],
};

describe("parseProductTldListDto .ai term semantics", () => {
  it("stores minimum-period catalogue price when period 1 is absent", () => {
    const row = parseProductTldListDto(LIVE_AI_CATALOGUE_ROW);
    assert.ok(row);
    assert.equal(row!.register, 199.8);
    assert.equal(row!.renew, 199.8);
    assert.equal(row!.transfer, 99.9);
    assert.equal(row!.maxRegisterYears, 10);
  });
});
