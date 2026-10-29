import { usdToLocalRate, type CurrencyCode } from "@/config/pricing";

/** Commercial pins applied on top of market FX (units of local currency per 1 USD). */
export const COMMERCIAL_FX_PINS: Partial<Record<CurrencyCode, number>> = {
  INR: 95,
  NPR: 154,
};

type ErApiLatest = {
  result?: string;
  conversion_rates?: Record<string, number>;
  rates?: Record<string, number>;
};

/** Fetch mid-market USD base rates and map to our supported currency book. */
export async function fetchMarketDisplayRates(): Promise<
  Partial<Record<CurrencyCode, number>>
> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Market FX request failed (${res.status})`);
  }
  const json = (await res.json()) as ErApiLatest;
  const table = json.rates ?? json.conversion_rates;
  if (json.result !== "success" || !table) {
    throw new Error("Market FX response invalid");
  }

  const out: Partial<Record<CurrencyCode, number>> = { USD: 1 };
  for (const code of Object.keys(usdToLocalRate) as CurrencyCode[]) {
    if (code === "USD") continue;
    const rate = table[code];
    if (rate != null && Number.isFinite(rate) && rate > 0) {
      out[code] = rate;
    } else {
      out[code] = usdToLocalRate[code];
    }
  }

  return { ...out, ...COMMERCIAL_FX_PINS };
}
