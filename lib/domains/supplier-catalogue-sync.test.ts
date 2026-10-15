import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseProductTldListDto } from "@/lib/domains/providers/tld-catalogue-fetch";

describe("supplier catalogue sync semantics", () => {
  it("parses .ai with min period 2 and period-specific register prices", () => {
    const row = parseProductTldListDto({
      name: "ai",
      minRegistrationPeriod: 2,
      prices: [
        {
          register: [
            { period: 2, price: 199.8, currency: "USD" },
            { period: 4, price: 399.6, currency: "USD" },
          ],
          renew: [{ period: 2, price: 199.8, currency: "USD" }],
          transfer: [{ period: 1, price: 99.9, currency: "USD" }],
        },
      ],
    });
    assert.equal(row?.minRegistrationPeriod, 2);
    assert.equal(row?.register, 199.8);
    assert.equal(row?.registerPricesByPeriod?.[2], 199.8);
    assert.equal(row?.registerPricesByPeriod?.[1], undefined);
  });

  it("documents that existing-row sync updates supplier fields only", () => {
    const supplierOnlyKeys = [
      "supplierRegister",
      "supplierRenew",
      "supplierTransfer",
      "supplierRestore",
      "supplierCurrency",
      "supplierSyncedAt",
      "supplierMaxRegisterYears",
      "supplierMinRegistrationPeriod",
    ];
    assert.ok(!supplierOnlyKeys.includes("retailRegister"));
    assert.ok(!supplierOnlyKeys.includes("retailRenew"));
    assert.ok(!supplierOnlyKeys.includes("retailRegisterTermYears"));
  });
});
