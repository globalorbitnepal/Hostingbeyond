import type { DomainCheckoutServiceSelection } from "@/lib/domains/domain-checkout-offers";
import type { HostingCartConfiguration } from "@/lib/hosting/cart/types";
import { HOSTING_CART_STORAGE_KEY } from "@/lib/hosting/cart/types";
import { hostingCheckoutPath } from "@/lib/hosting/purchase-intent";

export const PREMIUM_CART_SERVICES_KEY = "hb-premium-cart-services";

export function readPremiumCartServices(): DomainCheckoutServiceSelection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(PREMIUM_CART_SERVICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DomainCheckoutServiceSelection[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePremiumCartServices(
  selections: DomainCheckoutServiceSelection[],
) {
  sessionStorage.setItem(PREMIUM_CART_SERVICES_KEY, JSON.stringify(selections));
}

export function clearPremiumCartServices() {
  sessionStorage.removeItem(PREMIUM_CART_SERVICES_KEY);
}

/** Prefill hosting checkout with the domain + add-ons chosen on domain checkout. */
export function hostingContinueHrefAfterDomain(input: {
  domain: string;
  selections?: DomainCheckoutServiceSelection[];
}): string | null {
  const domain = input.domain.trim().toLowerCase();
  if (!domain) return null;
  const selections = input.selections ?? readPremiumCartServices();
  const hosting = selections.find((sel) => sel.kind === "hosting");
  if (!hosting || hosting.kind !== "hosting") return null;
  const email = selections.find((sel) => sel.kind === "business-email");
  const configuration: HostingCartConfiguration = {
    productSlug: hosting.productSlug,
    planKey: hosting.planKey,
    billingPeriod: hosting.billing,
    domainChoice: "existing",
    domainName: domain,
    addons:
      email && email.kind === "business-email"
        ? [
            {
              addonSlug: "business-email",
              enabled: true,
              quantity: 1,
              optionId: email.planId,
            },
          ]
        : [],
  };
  sessionStorage.setItem(
    HOSTING_CART_STORAGE_KEY,
    JSON.stringify(configuration),
  );
  return `${hostingCheckoutPath({
    product: hosting.productSlug,
    plan: hosting.planKey,
    billing: hosting.billing,
  })}&step=review`;
}
