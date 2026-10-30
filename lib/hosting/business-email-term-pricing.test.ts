import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emailPricePerMonthForTerm,
  emailPrepaidMonths,
  emailDueTodayForTerm,
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

  it("charges the full prepaid term, not one month, when 12–48 months is selected", () => {
    assert.equal(emailPrepaidMonths("monthly"), 1);
    assert.equal(emailPrepaidMonths("12"), 12);
    assert.equal(emailPrepaidMonths("24"), 24);
    assert.equal(emailDueTodayForTerm(samplePlan, "monthly"), 4.99);
    assert.equal(emailDueTodayForTerm(samplePlan, "12"), 35.88);
    assert.equal(emailDueTodayForTerm(samplePlan, "24"), 28.8);
    assert.equal(emailDueTodayForTerm(samplePlan, "48"), 17.76);
  });
});
