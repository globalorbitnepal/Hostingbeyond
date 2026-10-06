/** Client-side cart badge sync after add/remove (logged-in server cart). */
export const DOMAIN_CART_UPDATED_EVENT = "hb:domain-cart-updated";

export type DomainCartUpdatedDetail = { count: number };

export function dispatchDomainCartUpdated(count: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<DomainCartUpdatedDetail>(DOMAIN_CART_UPDATED_EVENT, {
      detail: { count },
    }),
  );
}
