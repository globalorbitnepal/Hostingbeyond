import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emailPricePerMonthForTerm,
  availableEmailTermsForPlan,
} from "@/lib/hosting/business-email-term-pricing";
import type { CmsBusinessEmailPlan } from "@/lib/orbit/business-email-page-content";

const samplePlan: CmsBusinessEmailPlan = {
  id: "starter",
  visible: true,
  name: "Starter",
  bestFor: "solo",
  original: "$4.99",
  price: "$0.37",
  price24: "$1.20",
  off: "88% off",
  renew: "$2.99",
  mailboxes: "1 mailbox",
  storage: "10 GB",
  extras: "",
  features: [],
};

describe("business-email-term-pricing", () => {
  it("reads CMS prices per term without inventing rates", () => {
    assert.equal(emailPricePerMonthForTerm(samplePlan, "monthly"), 4.99);
    assert.equal(emailPricePerMonthForTerm(samplePlan, "48"), 0.37);
    assert.equal(emailPricePerMonthForTerm(samplePlan, "12"), 2.99);
  });

  it("lists only terms with positive prices", () => {
    const terms = availableEmailTermsForPlan(samplePlan);
    assert.ok(terms.includes("monthly"));
    assert.ok(terms.includes("48"));
  });
});
