import type { HostingCartQuote } from "./types";
import type { SettledHostingQuote } from "./settlement";

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
  /** True when the order was converted from USD into the charge currency. */
  settledFromUsd?: boolean;
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
  settlement?: SettledHostingQuote | null,
): HostingOrderSnapshot {
  const lines = settlement?.lines ?? quote.lines;
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    productSlug: quote.configuration.productSlug,
    productName: quote.productName,
    planKey: quote.configuration.planKey,
    planName: quote.planName,
    billingPeriod: quote.configuration.billingPeriod,
    currency: settlement?.currency ?? quote.currency,
    ...(settlement?.currencyChanged ? { settledFromUsd: true } : {}),
    domainChoice: quote.configuration.domainChoice,
    domainName: quote.configuration.domainName,
    freeDomainEligible: quote.freeDomainEligible,
    lines: lines.map((l) => ({
      id: l.id,
      label: l.label,
      amount: l.amount,
      kind: l.kind,
      note: l.note,
    })),
    subtotal: settlement?.subtotal ?? quote.subtotal,
    discount: settlement?.discount ?? quote.discount,
    tax: settlement?.tax ?? quote.tax,
    total: settlement?.total ?? quote.total,
    configuration: quote.configuration,
  };
}
