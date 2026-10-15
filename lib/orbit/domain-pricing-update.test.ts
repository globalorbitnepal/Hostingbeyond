import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  pickBulkRetailUpdateData,
  pickRetailUpdateData,
  validateBulkRetailItem,
  validateRetailMoney,
  validateRetailPricePayload,
} from "@/lib/orbit/domain-pricing-update";

describe("domain-pricing-update validation", () => {
  it("rejects negative and non-finite retail prices", () => {
    assert.ok(validateRetailMoney("retailRegister", -1));
    assert.ok(validateRetailMoney("retailRegister", NaN));
    assert.ok(validateRetailMoney("retailRegister", "abc"));
    assert.equal(validateRetailMoney("retailRegister", 9.99), null);
  });

  it("allows null promo and restore when permitted", () => {
    assert.equal(
      validateRetailMoney("promoRegister", null, { allowNull: true }),
      null,
    );
    assert.ok(validateRetailMoney("retailRegister", null));
  });

  it("validates full PUT payload", () => {
    const errors = validateRetailPricePayload({
      retailRegister: 9.99,
      retailRenew: 17.99,
      retailTransfer: 12.99,
    });
    assert.equal(errors.length, 0);
    assert.ok(
      validateRetailPricePayload({ retailRegister: -2 }).some(
        (e) => e.field === "retailRegister",
      ),
    );
  });

  it("pickRetailUpdateData only includes explicit keys", () => {
    const data = pickRetailUpdateData({ retailRenew: 19.99 });
    assert.deepEqual(data, { retailRenew: 19.99 });
    assert.equal("retailRegister" in data, false);
  });

  it("validates bulk line items", () => {
    assert.equal(
      validateBulkRetailItem({
        tld: ".com",
        retailRegister: 9.99,
      }).length,
      0,
    );
    assert.ok(
      validateBulkRetailItem({ tld: "", retailRegister: 1 }).some(
        (e) => e.field === "tld",
      ),
    );
  });

  it("pickBulkRetailUpdateData is partial", () => {
    const data = pickBulkRetailUpdateData({
      tld: ".com",
      retailRegister: 10,
    });
    assert.deepEqual(data, { retailRegister: 10 });
  });
});
