import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildStandardRegistrationQuote,
  type TldTermContext,
} from "@/lib/domains/registration-term";

describe(".ai min-term registration safety", () => {
  const aiRetailMisconfigured: TldTermContext = {
    supplierMinRegistrationPeriod: 2,
    supplierMaxRegistrationPeriod: 10,
    retailRegisterTermYears: 1,
    retailRegister: 89.99,
    retailRenew: 109.99,
    retailTransfer: 179.99,
    retailRegisterByYear: null,
    promoRegister: null,
    promoActive: false,
  };

  it("does not produce a checkout quote from 1-year retail alone", () => {
    const quote = buildStandardRegistrationQuote(aiRetailMisconfigured, 2);
    assert.equal(quote, null);
  });
});
