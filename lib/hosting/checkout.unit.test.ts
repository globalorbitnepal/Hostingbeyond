import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hostingCheckoutHref,
  inferHostingBookingTarget,
  planBookingHref,
  resolveHostingPlanKey,
  rewriteDeadBookingCta,
} from "./checkout";

describe("plan booking href", () => {
  it("opens the four-step hosting checkout with step=plan", () => {
    assert.equal(
      hostingCheckoutHref("web-hosting", "professional", "annually"),
      "/checkout/hosting?product=web-hosting&plan=professional&billing=annually&step=plan",
    );
  });

  it("rewrites signup Get Started on home web-hosting cards", () => {
    assert.equal(
      planBookingHref({
        planId: "starter",
        billing: "monthly",
        ctaHref: "/signup",
      }),
      "/checkout/hosting?product=web-hosting&plan=starter&billing=monthly&step=plan",
    );
  });

  it("uses the product slug when the card passes one", () => {
    assert.equal(
      planBookingHref({
        planId: "business",
        billing: "annually",
        productSlug: "wordpress-hosting",
        ctaHref: "/signup",
      }),
      "/checkout/hosting?product=wordpress-hosting&plan=business&billing=annually&step=plan",
    );
  });

  it("maps commerce and cloud CMS ids onto seeded plan keys", () => {
    assert.equal(
      resolveHostingPlanKey("ecommerce-hosting", "commerce-cloud"),
      "business",
    );
    assert.equal(
      resolveHostingPlanKey("business-hosting", "cloud-starter"),
      "starter",
    );
    assert.deepEqual(inferHostingBookingTarget("vps-2"), {
      product: "kvm-vps",
      plan: "vps-2",
    });
  });

  it("leaves Beyond AI and email product links alone", () => {
    assert.equal(
      planBookingHref({
        planId: "beyond-ai-free",
        billing: "annually",
        ctaHref: "/beyond-ai",
      }),
      "/beyond-ai",
    );
  });

  it("rewrites signup closing CTAs onto the plans band", () => {
    assert.equal(rewriteDeadBookingCta("/signup", "#plans"), "#plans");
    assert.equal(rewriteDeadBookingCta("/get-started", "#plans"), "#plans");
    assert.equal(
      rewriteDeadBookingCta("/web-hosting#plans", "#plans"),
      "/web-hosting#plans",
    );
  });
});
