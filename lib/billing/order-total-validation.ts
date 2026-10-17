import type { Prisma } from "@prisma/client";

import { decimal, moneyEquals, roundMoney } from "@/lib/billing/money";

export type DomainOrderTotalInput = {
  retailPrice: Prisma.Decimal;
  discount: Prisma.Decimal;
  tax: Prisma.Decimal | null;
  total: Prisma.Decimal;
};

/**
 * Authoritative checkout rule: total = retailPrice - discount + (tax ?? 0).
 * Tax on the order is exclusive add-on; VAT-inclusive gross totals must be stored
 * with tax null and total as the amount charged (see tax-snapshot at issuance).
 */
export function validateDomainOrderTotals(
  order: DomainOrderTotalInput,
): { ok: true } | { ok: false; reason: string } {
  const retail = roundMoney(decimal(order.retailPrice));
  const discount = roundMoney(decimal(order.discount));
  const tax =
    order.tax != null ? roundMoney(decimal(order.tax)) : roundMoney(decimal(0));
  const total = roundMoney(decimal(order.total));

  if (retail.lessThan(0) || discount.lessThan(0) || tax.lessThan(0)) {
    return { ok: false, reason: "order_negative_component" };
  }
  if (discount.greaterThan(retail)) {
    return { ok: false, reason: "order_discount_exceeds_retail" };
  }

  const net = roundMoney(retail.sub(discount));
  const expectedTotal = roundMoney(net.add(tax));
  if (!moneyEquals(expectedTotal, total)) {
    return { ok: false, reason: "order_total_mismatch" };
  }

  return { ok: true };
}
