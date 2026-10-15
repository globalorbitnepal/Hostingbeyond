import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseProductTldListDto } from "@/lib/domains/providers/tld-catalogue-fetch";
import {
  assertTermAllowed,
  buildPremiumRegistrationQuote,
  buildStandardRegistrationQuote,
  resolveCheckoutTermYears,
  retailRegisterTotalForTerm,
  supplierQuoteCoversTerm,
  type TldTermContext,
} from "@/lib/domains/registration-term";

const AI_CATALOGUE = {
  name: "ai",
  minRegistrationPeriod: 2,
  maxRegistrationPeriod: 10,
  prices: [
    {
      register: [{ period: 2, price: 199.8, currency: "USD" }],
      renew: [{ period: 2, price: 199.8, currency: "USD" }],
      transfer: [{ period: 1, price: 99.9, currency: "USD" }],
    },
  ],
};

function ctx(partial: Partial<TldTermContext>): TldTermContext {
  return {
    supplierMinRegistrationPeriod: 1,
    supplierMaxRegistrationPeriod: 10,
    retailRegisterTermYears: 1,
    retailRegister: 9.99,
    retailRenew: 17.99,
    retailTransfer: 12.99,
    retailRegisterByYear: null,
    promoRegister: null,
    promoActive: false,
    ...partial,
  };
}

describe("registration-term", () => {
  it("parses .ai catalogue at min period without collapsing to 1 year", () => {
    const row = parseProductTldListDto(AI_CATALOGUE);
    assert.equal(row?.minRegistrationPeriod, 2);
    assert.equal(row?.register, 199.8);
    assert.equal(row?.registerPricesByPeriod?.[2], 199.8);
    assert.equal(row?.registerPricesByPeriod?.[1], undefined);
  });

  it("rejects 1-year checkout when supplier minimum is 2 years", () => {
    const aiCtx = ctx({
      supplierMinRegistrationPeriod: 2,
      retailRegisterTermYears: 1,
      retailRegister: 89.99,
    });
    assert.equal(assertTermAllowed(1, aiCtx).ok, false);
    assert.equal(resolveCheckoutTermYears(aiCtx, null), 2);
  });

  it("does not expose 1-year retail when 2-year term is required", () => {
    const aiCtx = ctx({
      supplierMinRegistrationPeriod: 2,
      retailRegisterTermYears: 1,
      retailRegister: 89.99,
    });
    assert.equal(retailRegisterTotalForTerm(aiCtx, 2), null);
    assert.equal(buildStandardRegistrationQuote(aiCtx, 2), null);
  });

  it("quotes 2-year retail when configured in retailRegisterByYear", () => {
    const aiCtx = ctx({
      supplierMinRegistrationPeriod: 2,
      retailRegisterByYear: { "2": 179.98 },
    });
    const quote = buildStandardRegistrationQuote(aiCtx, 2);
    assert.ok(quote);
    assert.equal(quote!.termYears, 2);
    assert.equal(quote!.registerTotal, 179.98);
  });

  it("supports ordinary 1-year TLDs", () => {
    const comCtx = ctx({ supplierMinRegistrationPeriod: 1 });
    const quote = buildStandardRegistrationQuote(comCtx, 1);
    assert.equal(quote?.registerTotal, 9.99);
    assert.equal(quote?.termYears, 1);
  });

  it("requires verified supplier quote for premium", () => {
    const quote = buildPremiumRegistrationQuote(
      ctx({ supplierMinRegistrationPeriod: 1 }),
      { register: 1200, renew: null, transfer: null, currency: "USD" },
      10,
      (s, _catalog, m) => s + (m ?? 0),
    );
    assert.ok(quote);
    assert.equal(quote!.registerTotal, 1210);
  });

  it("rejects premium when supplier register missing", () => {
    const quote = buildPremiumRegistrationQuote(
      ctx({}),
      { register: null, renew: null, transfer: null, currency: "USD" },
      10,
      (s, c) => s,
    );
    assert.equal(quote, null);
  });

  it("supplierQuoteCoversTerm uses min period when bulk omits period", () => {
    assert.equal(
      supplierQuoteCoversTerm(
        { register: 199.8, renew: null, transfer: null, currency: "USD" },
        2,
        2,
      ),
      true,
    );
    assert.equal(
      supplierQuoteCoversTerm(
        { register: 199.8, renew: null, transfer: null, currency: "USD" },
        1,
        2,
      ),
      false,
    );
  });
});
