import { Prisma } from "@prisma/client";

import { decimal, roundMoney } from "@/lib/billing/money";

export type OrderTaxInput = {
  retailPrice: Prisma.Decimal;
  discount: Prisma.Decimal;
  tax: Prisma.Decimal | null;
  total: Prisma.Decimal;
  currency: string;
};

export type TaxSnapshot = {
  subtotal: Prisma.Decimal;
  discount: Prisma.Decimal;
  tax: Prisma.Decimal;
  total: Prisma.Decimal;
  taxTreatment: "NONE" | "STORED_ON_ORDER" | "VAT_INCLUSIVE";
  taxRatePercent: Prisma.Decimal | null;
};

export type InvoiceTaxConfig = {
  /** When order has no tax snapshot, apply VAT-inclusive reverse calc (e.g. 13 for Nepal). */
  vatInclusivePercent: number | null;
};

export function readInvoiceTaxConfigFromEnv(): InvoiceTaxConfig {
  const raw = process.env.INVOICE_VAT_INCLUSIVE_PERCENT?.trim();
  if (!raw) return { vatInclusivePercent: null };
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 100) {
    return { vatInclusivePercent: null };
  }
  return { vatInclusivePercent: n };
}

/**
 * Build immutable invoice amounts from a domain order snapshot.
 * Never adds VAT on top of an already VAT-inclusive total.
 */
export function deriveTaxSnapshotFromOrder(
  order: OrderTaxInput,
  config: InvoiceTaxConfig = readInvoiceTaxConfigFromEnv(),
): TaxSnapshot {
  const discount = roundMoney(decimal(order.discount));
  const total = roundMoney(decimal(order.total));

  if (order.tax != null) {
    const tax = roundMoney(decimal(order.tax));
    const subtotal = roundMoney(total.sub(tax));
    return {
      subtotal,
      discount,
      tax,
      total,
      taxTreatment: "STORED_ON_ORDER",
      taxRatePercent: null,
    };
  }

  if (config.vatInclusivePercent != null) {
    const rate = new Prisma.Decimal(config.vatInclusivePercent);
    const divisor = rate.div(100).add(1);
    const subtotal = roundMoney(total.div(divisor));
    const tax = roundMoney(total.sub(subtotal));
    return {
      subtotal,
      discount,
      tax,
      total,
      taxTreatment: "VAT_INCLUSIVE",
      taxRatePercent: rate,
    };
  }

  const subtotal = roundMoney(total);
  return {
    subtotal,
    discount,
    tax: roundMoney(new Prisma.Decimal(0)),
    total,
    taxTreatment: "NONE",
    taxRatePercent: null,
  };
}
