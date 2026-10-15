import type { DomainCheckoutServiceSelection } from "@/lib/domains/domain-checkout-offers";

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
