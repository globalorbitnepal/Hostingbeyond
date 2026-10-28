import type { CurrencyCode } from "@/config/pricing";

/** Visitor-selectable display currencies (checkout may still bill in USD). */
export const PUBLIC_DISPLAY_CURRENCIES = ["USD", "INR", "NPR"] as const;

export type PublicDisplayCurrency = (typeof PUBLIC_DISPLAY_CURRENCIES)[number];

const publicSet = new Set<string>(PUBLIC_DISPLAY_CURRENCIES);

export function isPublicDisplayCurrency(
  value: string | undefined | null,
): value is PublicDisplayCurrency {
  return typeof value === "string" && publicSet.has(value.toUpperCase());
}

export function normalizePublicDisplayCurrency(
  value: string | undefined | null,
  fallback: PublicDisplayCurrency = "USD",
): PublicDisplayCurrency {
  if (isPublicDisplayCurrency(value)) {
    return value.toUpperCase() as PublicDisplayCurrency;
  }
  return fallback;
}

export const PUBLIC_DISPLAY_CURRENCY_LABELS: Record<
  PublicDisplayCurrency,
  { code: string; symbol: string; title: string }
> = {
  USD: { code: "USD", symbol: "$", title: "US Dollar" },
  INR: { code: "INR", symbol: "₹", title: "Indian Rupee" },
  NPR: { code: "NPR", symbol: "रु", title: "Nepalese Rupee" },
};

export function publicCurrencyTriggerLabel(currency: CurrencyCode): string {
  const key = normalizePublicDisplayCurrency(currency);
  return PUBLIC_DISPLAY_CURRENCY_LABELS[key].code;
}
