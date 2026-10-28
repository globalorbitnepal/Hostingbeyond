/**
 * Optional paid "Domain Protection" add-on — NOT enabled for checkout until
 * product scope is legally defined and distinct from free registrar WHOIS privacy.
 *
 * NameSilo WHOIS privacy is included on eligible domains at the supplier;
 * do not charge customers for the same capability under this SKU.
 */
export type DomainProtectionProductConfig = {
  /** When false, checkout must not show a paid protection upsell. */
  enabled: boolean;
  proposedRetailUsdPerYear: number;
  currency: string;
  sku: string;
  customerFacingTitle: string;
  customerFacingSummary: string;
};

export function getDomainProtectionProductConfig(): DomainProtectionProductConfig {
  const enabled =
    process.env.DOMAIN_PROTECTION_PAID_ENABLED === "true" &&
    Boolean(process.env.DOMAIN_PROTECTION_SERVICE_DEFINED?.trim());
  const raw = Number(process.env.DOMAIN_PROTECTION_RETAIL_USD ?? "9.99");
  const proposedRetailUsdPerYear =
    Number.isFinite(raw) && raw > 0 ? Math.round(raw * 100) / 100 : 9.99;

  return {
    enabled,
    proposedRetailUsdPerYear,
    currency: "USD",
    sku: "domain-protection-annual",
    customerFacingTitle: "Domain Protection",
    customerFacingSummary:
      "Optional HostingBeyond-managed protection services (only when explicitly configured — not WHOIS privacy).",
  };
}
