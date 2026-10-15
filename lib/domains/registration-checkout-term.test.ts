import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertTermAllowed,
  supplierQuoteCoversTerm,
} from "@/lib/domains/registration-term";

describe("registration checkout term guards", () => {
  it("blocks provider registration when quoted period does not match checkout term", () => {
    assert.equal(
      supplierQuoteCoversTerm(
        {
          register: 199.8,
          renew: null,
          transfer: null,
          currency: "USD",
          registrationPeriodYears: 2,
        },
        1,
        2,
      ),
      false,
    );
  });

  it("rejects wallet path when term below supplier minimum", () => {
    const check = assertTermAllowed(1, {
      supplierMinRegistrationPeriod: 2,
      supplierMaxRegistrationPeriod: 10,
      retailRegisterTermYears: 1,
      retailRegister: 89.99,
      retailRenew: 109.99,
      retailTransfer: 179.99,
      retailRegisterByYear: null,
      promoRegister: null,
      promoActive: false,
    });
    assert.equal(check.ok, false);
  });
});
