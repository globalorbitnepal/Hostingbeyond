import {
  hostingCheckoutPath,
  WEB_HOSTING_PLAN_KEYS,
  type HostingBillingCycle,
  type HostingPurchaseIntent,
} from "@/lib/hosting/purchase-intent";

const COMMERCE_PLAN_MAP: Record<string, string> = {
  "commerce-essential": "essential",
  "commerce-plus": "plus",
  "commerce-cloud": "pro",
  "commerce-enterprise": "ultimate",
};

const CLOUD_PLAN_MAP: Record<string, string> = {
  "cloud-starter": "essential",
  "cloud-business": "pro",
  "cloud-pro": "ultimate",
};

export function resolveHostingPlanKey(
  productSlug: string,
  planId: string,
): string {
  if (productSlug === "ecommerce-hosting") {
    return COMMERCE_PLAN_MAP[planId] ?? planId;
  }
  if (productSlug === "business-hosting") {
    return CLOUD_PLAN_MAP[planId] ?? planId;
  }
  return planId;
}

export function inferHostingBookingTarget(
  planId: string,
): { product: string; plan: string } | null {
  if ((WEB_HOSTING_PLAN_KEYS as readonly string[]).includes(planId)) {
    return { product: "web-hosting", plan: planId };
  }
  if (planId.startsWith("vps-")) {
    return { product: "kvm-vps", plan: planId };
  }
  if (COMMERCE_PLAN_MAP[planId]) {
    return {
      product: "ecommerce-hosting",
      plan: COMMERCE_PLAN_MAP[planId],
    };
  }
  if (CLOUD_PLAN_MAP[planId]) {
    return {
      product: "business-hosting",
      plan: CLOUD_PLAN_MAP[planId],
    };
  }
  return null;
}

/** Shared Buy now → four-step booking URL for every hosting product. */
export function hostingCheckoutHref(
  productSlug: string,
  planKey: string,
  billing: HostingBillingCycle = "annually",
): string {
  const plan = resolveHostingPlanKey(productSlug, planKey);
  return `${hostingCheckoutPath({
    product: productSlug,
    plan,
    billing,
  })}&step=plan`;
}

export function hostingCheckoutHrefFromIntent(intent: HostingPurchaseIntent) {
  return `${hostingCheckoutPath(intent)}&step=plan`;
}

/**
 * Plan-card Get Started must open the 4-step booking page.
 * Orbit copy often still stores /signup — never keep that for hosting plans.
 */
export function planBookingHref(input: {
  planId: string;
  billing: HostingBillingCycle;
  productSlug?: string;
  ctaHref?: string;
}): string {
  const productSlug = input.productSlug?.trim();
  const inferred = productSlug
    ? {
        product: productSlug,
        plan: resolveHostingPlanKey(productSlug, input.planId),
      }
    : inferHostingBookingTarget(input.planId);

  if (inferred) {
    return hostingCheckoutHref(inferred.product, inferred.plan, input.billing);
  }

  const href = input.ctaHref?.trim() ?? "";
  if (href.startsWith("/checkout/hosting")) {
    try {
      const url = new URL(href, "https://hosting.theglobalorbit.com");
      url.searchParams.set("billing", input.billing);
      url.searchParams.set("plan", input.planId);
      if (!url.searchParams.get("product")) {
        url.searchParams.set("product", "web-hosting");
      }
      url.searchParams.set("step", "plan");
      return `${url.pathname}?${url.searchParams.toString()}`;
    } catch {
      return href;
    }
  }

  return href;
}

const DEAD_PUBLIC_CTA = new Set(["", "/", "/signup", "/login", "/get-started"]);

/** Hero/closing buttons must not dump buyers on account signup. */
export function rewriteDeadBookingCta(
  href: string | undefined,
  fallback: string,
): string {
  const raw = (href ?? "").trim();
  const path = (raw.split("?")[0] ?? "").replace(/\/+$/, "") || "/";
  if (DEAD_PUBLIC_CTA.has(path)) return fallback;
  return raw || fallback;
}
