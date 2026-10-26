import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertRetailUpdateAllowed,
  retailPriceFieldsInUpdate,
} from "@/lib/orbit/retail-price-lock";

describe("retail price lock", () => {
  it("blocks retail field updates when locked", () => {
    const res = assertRetailUpdateAllowed(
      { retailPriceLocked: true },
      { retailRegister: 9.99 },
    );
    assert.equal(res.ok, false);
  });

  it("allows non-retail updates when locked", () => {
    const res = assertRetailUpdateAllowed(
      { retailPriceLocked: true },
      { enabled: false },
    );
    assert.equal(res.ok, true);
  });

  it("allows unlock and retail in one payload when unlocking flag set", () => {
    const res = assertRetailUpdateAllowed(
      { retailPriceLocked: true },
      { retailRegister: 9.99, retailPriceLocked: false },
      { unlocking: true },
    );
    assert.equal(res.ok, true);
  });

  it("detects retail fields in update", () => {
    assert.equal(retailPriceFieldsInUpdate({ retailRenew: 1 }), true);
    assert.equal(retailPriceFieldsInUpdate({ enabled: true }), false);
  });
});
