/**
 * Presentation amounts for hosting purchase review.
 * Numeric values are the plan ledger (USD when plan.currency is USD).
 * Does not apply display FX — callers use CatalogPrice / formatCatalogUsd.
 */

function finiteAmount(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function ledgerMoney(value: number, currency: string): string {
  const code = currency.trim() || "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(finiteAmount(value));
}

export type HostingPurchaseDisplay = {
  displayAmount: number;
  billedAmount: number;
  billedPeriod: "month" | "year";
  priceLabel: string;
  billedLabel: string;
  isUsdLedger: boolean;
};

export function hostingPurchaseDisplay(input: {
  monthlyPrice: number;
  yearlyPrice: number;
  billing: "monthly" | "annually";
  currency: string;
}): HostingPurchaseDisplay {
  const monthly = finiteAmount(Number(input.monthlyPrice));
  const yearly = finiteAmount(Number(input.yearlyPrice));
  const isAnnual = input.billing === "annually";
  const currency = input.currency.trim() || "USD";
  const isUsdLedger = currency.toUpperCase() === "USD";
  const displayAmount = isAnnual ? yearly / 12 : monthly;
  const billedAmount = isAnnual ? yearly : monthly;
  const billedPeriod = isAnnual ? "year" : "month";
  const priceLabel = `${ledgerMoney(displayAmount, currency)}/mo`;
  const billedLabel = isAnnual
    ? `Billed ${ledgerMoney(billedAmount, currency)}/yr`
    : `Billed ${ledgerMoney(billedAmount, currency)}/mo`;

  return {
    displayAmount,
    billedAmount,
    billedPeriod,
    priceLabel,
    billedLabel,
    isUsdLedger,
  };
}
