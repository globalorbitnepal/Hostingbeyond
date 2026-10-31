import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hostingDomainQuoteLine,
  hostingDomainStepComplete,
  hostingEmailTrialQuoteLine,
  hostingIncludesFreeDomainYear,
  nextHostingBookingStep,
  parseListedUsdPrice,
} from "./booking-rules";

describe("hosting booking rules", () => {
  it("never grants a free domain year on monthly billing", () => {
    assert.equal(hostingIncludesFreeDomainYear("monthly", true), false);
    assert.equal(hostingIncludesFreeDomainYear("annually", true), true);
    assert.equal(hostingIncludesFreeDomainYear("annually", false), false);
  });

  it("quotes a paid first-year domain on monthly new registration", () => {
    const line = hostingDomainQuoteLine({
      billing: "monthly",
      freeDomainEligible: false,
      domainChoice: "search",
      domainName: "brand.com",
      domainRegisterUsd: 10.99,
    });
    assert.ok(line);
    assert.equal(line.amount, 10.99);
    assert.match(line.note ?? "", /brand.com/);
    assert.doesNotMatch(line.note ?? "", /free/i);
  });

  it("quotes a complimentary first year on annual new registration", () => {
    const line = hostingDomainQuoteLine({
      billing: "annually",
      freeDomainEligible: true,
      domainChoice: "search",
      domainName: "brand.com",
      domainRegisterUsd: 10.99,
    });
    assert.ok(line);
    assert.equal(line.amount, 0);
    assert.match(line.note ?? "", /free for 1 year/i);
  });

  it("requires a domain name before leaving the domain step", () => {
    assert.equal(
      hostingDomainStepComplete({ domainChoice: "later", domainName: null }),
      false,
    );
    assert.equal(
      hostingDomainStepComplete({
        domainChoice: "search",
        domainName: "brand.com",
      }),
      true,
    );
  });

  it("shows next-month renewal on the default 1-month free email add-on", () => {
    const line = hostingEmailTrialQuoteLine({
      billing: "monthly",
      freeEmailMonth: true,
      renewalPerMonthUsd: 4.99,
    });
    assert.ok(line);
    assert.equal(line.amount, 0);
    assert.match(line.note ?? "", /renews at \$4\.99\/mo next month/);
    assert.equal(
      hostingEmailTrialQuoteLine({
        billing: "annually",
        freeEmailMonth: true,
        renewalPerMonthUsd: 4.99,
      }),
      null,
    );
  });

  it("parses registrar first-year prices from display strings", () => {
    assert.equal(parseListedUsdPrice("$10.99"), 10.99);
    assert.equal(parseListedUsdPrice("A$ 12.00 / yr"), 12);
    assert.equal(parseListedUsdPrice("unavailable"), null);
  });

  it("walks Plan → Domain → Add-ons → Review", () => {
    assert.equal(nextHostingBookingStep("plan"), "domain");
    assert.equal(nextHostingBookingStep("domain"), "addons");
    assert.equal(nextHostingBookingStep("addons"), "review");
    assert.equal(nextHostingBookingStep("review"), null);
  });
});
