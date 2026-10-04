import type { HostingCartQuote } from "./types";

export type HostingOrderLineSnapshot = {
  id: string;
  label: string;
  amount: number;
  kind: string;
  note?: string;
};

export type HostingOrderSnapshot = {
  version: 1;
  createdAt: string;
  productSlug: string;
  productName: string;
  planKey: string;
  planName: string;
  billingPeriod: string;
  currency: string;
  domainChoice: string | null;
  domainName: string | null;
  freeDomainEligible: boolean;
  lines: HostingOrderLineSnapshot[];
  subtotal: number;
  discount: number;
  tax: number | null;
  total: number;
  configuration: HostingCartQuote["configuration"];
};

export function buildOrderSnapshot(
  quote: HostingCartQuote,
): HostingOrderSnapshot {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    productSlug: quote.configuration.productSlug,
    productName: quote.productName,
    planKey: quote.configuration.planKey,
    planName: quote.planName,
    billingPeriod: quote.configuration.billingPeriod,
    currency: quote.currency,
    domainChoice: quote.configuration.domainChoice,
    domainName: quote.configuration.domainName,
    freeDomainEligible: quote.freeDomainEligible,
    lines: quote.lines.map((l) => ({
      id: l.id,
      label: l.label,
      amount: l.amount,
      kind: l.kind,
      note: l.note,
    })),
    subtotal: quote.subtotal,
    discount: quote.discount,
    tax: quote.tax,
    total: quote.total,
    configuration: quote.configuration,
  };
}
