import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  annualSavePercent,
  checkoutPlanIsPopular,
  checkoutPlanTagline,
  hostingPlanCatalogHref,
} from "@/lib/hosting/checkout-plan-presentation";

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
});
