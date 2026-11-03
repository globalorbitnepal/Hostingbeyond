/** Shared panel currency formatting (server + client safe). */
export function formatMoney(
  amount: number,
  currency: string,
  options?: { minimumFractionDigits?: number },
) {
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}
