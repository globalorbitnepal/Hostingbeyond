import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  attachControlledCatalogUsd,
  catalogUsdAfterCmsMerge,
  catalogUsdFromExplicit,
  resolveCmsHostingCatalogUsd,
  schemaOrgOfferPriceUsd,
} from "@/lib/hosting/hosting-plan-catalog";
import type { CmsHostingPlan } from "@/lib/orbit/defaults";

function plan(partial: Partial<CmsHostingPlan> = {}): CmsHostingPlan {
  return {
    id: "essential",
    visible: true,
    order: 0,
    name: "Beyond Essential",
    tagline: "",
    discountBadge: "",
    popular: false,
    popularLabel: "",
    accent: "blue",
    priceAnnually: "$2.40",
    originalAnnually: "$7.99",
    billedAnnually: "Billed $28.80 annually",
    saveAnnually: "",
    priceMonthly: "$7.99",
    originalMonthly: "",
    billedMonthly: "Billed monthly",
    saveMonthly: "",
    domainPerk: "",
    annualCredit: "",
    features: [],
    ctaLabel: "Get Started",
    ctaHref: "/get-started",
    ...partial,
  };
}

describe("hosting plan catalog USD", () => {
  it("attaches numeric USD from controlled default strings", () => {
    const out = attachControlledCatalogUsd(plan());
    assert.equal(out.monthlyUsd, 7.99);
    assert.equal(out.yearlyUsd, 28.8);
  });

  it("does not resolve catalog USD from CMS strings alone", () => {
    assert.equal(resolveCmsHostingCatalogUsd(plan()), null);
  });

  it("keeps fallback numbers when Orbit copy still matches defaults", () => {
    const fallback = attachControlledCatalogUsd(plan());
    const merged = catalogUsdAfterCmsMerge(
      { priceMonthly: "$7.99", billedAnnually: "Billed $28.80 annually" },
      fallback,
    );
    assert.deepEqual(merged, { monthlyUsd: 7.99, yearlyUsd: 28.8 });
  });

  it("drops fallback numbers when CMS price copy changed", () => {
    const fallback = attachControlledCatalogUsd(plan());
    const merged = catalogUsdAfterCmsMerge(
      { priceMonthly: "$9.99", billedAnnually: "Billed $28.80 annually" },
      fallback,
    );
    assert.deepEqual(merged, {});
  });

  it("prefers explicit stored numeric amounts", () => {
    const fallback = attachControlledCatalogUsd(plan());
    const merged = catalogUsdAfterCmsMerge(
      { monthlyUsd: 10, yearlyUsd: 100, priceMonthly: "Contact us" },
      fallback,
    );
    assert.deepEqual(merged, { monthlyUsd: 10, yearlyUsd: 100 });
  });

  it("does not inherit catalog amounts onto custom extra plans", () => {
    assert.deepEqual(catalogUsdFromExplicit({ id: "custom" }), {});
  });

  it("omits Schema.org prices instead of inventing a fallback", () => {
    assert.equal(schemaOrgOfferPriceUsd(plan()), undefined);
    const priced = attachControlledCatalogUsd(plan());
    assert.equal(schemaOrgOfferPriceUsd(priced, "annually"), "2.40");
    assert.equal(schemaOrgOfferPriceUsd(priced, "monthly"), "7.99");
  });
});
