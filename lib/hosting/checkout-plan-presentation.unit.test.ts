import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  annualSavePercent,
  applyHostingBillingPeriod,
  checkoutPlanIsPopular,
  checkoutPlanTagline,
  hostingPlanCatalogHref,
} from "@/lib/hosting/checkout-plan-presentation";
import type { HostingCartQuote } from "@/lib/hosting/cart/types";

describe("checkout plan presentation", () => {
  it("uses the premium Starter web-hosting tagline and Business popular flag", () => {
    assert.equal(
      checkoutPlanTagline("web-hosting", "starter", "Starter").includes(
        "personal websites",
      ),
      true,
    );
    assert.equal(checkoutPlanIsPopular("web-hosting", "business"), true);
    assert.equal(checkoutPlanIsPopular("web-hosting", "starter"), false);
    assert.equal(
      hostingPlanCatalogHref("wordpress-hosting"),
      "/wordpress-hosting#plans",
    );
  });

  it("rounds annual prepaid savings from billed total plus discount", () => {
    assert.equal(annualSavePercent(4.79, 43.09), 10);
    assert.equal(annualSavePercent(0, 43.09), 0);
  });

  it("switches monthly and annual using catalog list vs prepaid prices", () => {
    const base: HostingCartQuote = {
      configuration: {
        productSlug: "web-hosting",
        planKey: "business",
        billingPeriod: "annually",
        domainChoice: "later",
        domainName: null,
        domainRegisterUsd: null,
        freeEmailMonth: true,
        domainPrivacy: false,
        domainProtection: false,
        addons: [],
      },
      planName: "Business",
      productName: "Web Hosting",
      currency: "USD",
      lines: [
        { id: "hosting", label: "Hosting", amount: 143.88, kind: "hosting" },
        {
          id: "annual-discount",
          label: "Annual discount",
          amount: -14.39,
          kind: "discount",
        },
      ],
      subtotal: 129.49,
      discount: 14.39,
      tax: null,
      total: 129.49,
      freeDomainEligible: true,
      monthlyEquivalent: 10.79,
      billedAmount: 129.49,
      renewalPrice: 129.49,
      features: [],
      errors: [],
      eligibleAddonSlugs: [],
      emailTrialRenewalUsd: 2.99,
      catalogMonthly: 11.99,
      catalogYearly: 129.49,
      freeDomainAnnualOffered: true,
    };

    const monthly = applyHostingBillingPeriod(base, "monthly");
    assert.equal(monthly.configuration.billingPeriod, "monthly");
    assert.equal(monthly.billedAmount, 11.99);
    assert.equal(monthly.total, 11.99);
    assert.equal(monthly.discount, 0);
    assert.equal(
      monthly.lines.some((line) => line.kind === "discount"),
      false,
    );
    assert.equal(
      monthly.lines.find((line) => line.id === "hosting")?.amount,
      11.99,
    );

    const annual = applyHostingBillingPeriod(monthly, "annually");
    assert.equal(annual.billedAmount, 129.49);
    assert.equal(annual.total, 129.49);
    assert.equal(
      annual.lines.find((line) => line.id === "hosting")?.amount,
      143.88,
    );
    assert.equal(
      annual.lines.find((line) => line.kind === "discount")?.amount,
      -14.39,
    );
  });
});
