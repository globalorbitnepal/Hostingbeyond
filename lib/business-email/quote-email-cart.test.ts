import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultDomainExtras } from "@/lib/domains/domain-extras";
import {
  defaultEmailCartConfiguration,
  quoteEmailCart,
} from "@/lib/business-email/quote-email-cart";
import type { CmsBusinessEmailPlan } from "@/lib/orbit/business-email-page-content";

const samplePlan: CmsBusinessEmailPlan = {
  id: "starter",
  visible: true,
  name: "Starter",
  bestFor: "Solo",
  original: "$2.99",
  price: "$1.57",
  price24: "$2.00",
  off: "88% OFF",
  renew: "$1.57",
  mailboxes: "1 mailbox",
  storage: "5 GB",
  extras: "",
  features: ["Spam protection"],
};

describe("quoteEmailCart", () => {
  it("charges nothing today on monthly with renewal note", () => {
    const configuration = defaultEmailCartConfiguration({
      plan: "starter",
      term: "monthly",
    });
    const quote = quoteEmailCart({
      plan: samplePlan,
      configuration,
      extras: defaultDomainExtras(),
      hostingOffer: null,
    });
    assert.equal(quote.total, 0);
    assert.equal(quote.firstMonthFree, true);
    assert.equal(quote.renewalPerMonth, 2.99);
    assert.match(quote.lines[0]?.note ?? "", /1 month free/i);
  });

  it("includes domain protection when enabled on a registered domain", () => {
    const configuration = {
      ...defaultEmailCartConfiguration({ plan: "starter", term: "12" }),
      domainChoice: "search" as const,
      domainName: "brand.com",
      domainRegisterUsd: 12.99,
      domainProtection: true,
    };
    const quote = quoteEmailCart({
      plan: samplePlan,
      configuration,
      extras: defaultDomainExtras(),
      hostingOffer: null,
    });
    assert.ok(quote.lines.some((l) => l.id === "domain-protection"));
    assert.ok(quote.total > 0);
  });
});
