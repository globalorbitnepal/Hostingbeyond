/**
 * NameSilo has no documented SSL price API (getPrices is TLD-only).
 * Live amounts come from the public SSL store https://www.namesilo.com/ssl.
 * If the store cannot be read, we fall back to the last verified catalog —
 * never invent a higher or lower price at checkout.
 */

export type NameSiloSslProduct = {
  id: string;
  name: string;
  validation: "DV" | "EV";
  priceUsd: number;
  termLabel: string;
  features: string[];
  source: "namesilo-store" | "namesilo-fallback";
};

const STORE_URL = "https://www.namesilo.com/ssl";
const FETCH_MS = 8_000;

/** Last verified against namesilo.com/ssl (Positive $9.59, Essential $15.00, EV $99.99). */
export const NAMESILO_SSL_FALLBACK: NameSiloSslProduct[] = [
  {
    id: "positive-ssl",
    name: "Positive SSL Certificate",
    validation: "DV",
    priceUsd: 9.59,
    termLabel: "per year",
    features: ["Domain-validated", "Issued around the clock", "Free site seal"],
    source: "namesilo-fallback",
  },
  {
    id: "essential-ssl",
    name: "Essential SSL Certificate",
    validation: "DV",
    priceUsd: 15,
    termLabel: "per year",
    features: [
      "Domain-validated",
      "Unlimited server licences",
      "Free PCI and daily website scanning",
    ],
    source: "namesilo-fallback",
  },
  {
    id: "ev-ssl",
    name: "Extended Validation (EV) SSL",
    validation: "EV",
    priceUsd: 99.99,
    termLabel: "per year",
    features: [
      "Organisation name on the certificate",
      "Dynamic site seal",
      "Issuance can take up to 10 days",
    ],
    source: "namesilo-fallback",
  },
];

const HEADING_TO_ID: Array<{ match: RegExp; id: string }> = [
  { match: /positive\s+ssl/i, id: "positive-ssl" },
  { match: /essential\s+ssl/i, id: "essential-ssl" },
  { match: /extended\s+validation|\bev\b\s+ssl/i, id: "ev-ssl" },
];

export function parseNameSiloSslStoreHtml(
  html: string,
): { id: string; priceUsd: number }[] {
  const found: { id: string; priceUsd: number }[] = [];
  const seen = new Set<string>();
  const blocks = html.split(/<h[1-3][^>]*>/i);
  for (const block of blocks) {
    const heading = block.replace(/<[^>]+>/g, " ").slice(0, 120);
    const id = HEADING_TO_ID.find((row) => row.match.test(heading))?.id;
    if (!id || seen.has(id)) continue;
    const priceMatch = block.match(/\$([0-9]+(?:\.[0-9]{1,2})?)\s*\/\s*Year/i);
    if (!priceMatch) continue;
    const priceUsd = Number(priceMatch[1]);
    if (!Number.isFinite(priceUsd) || priceUsd <= 0 || priceUsd > 10_000) {
      continue;
    }
    seen.add(id);
    found.push({ id, priceUsd });
  }
  return found;
}

export function applyLiveSslPrices(
  live: { id: string; priceUsd: number }[],
): NameSiloSslProduct[] {
  if (live.length === 0)
    return NAMESILO_SSL_FALLBACK.map((row) => ({ ...row }));
  return NAMESILO_SSL_FALLBACK.map((row) => {
    const hit = live.find((item) => item.id === row.id);
    if (!hit) return { ...row };
    return { ...row, priceUsd: hit.priceUsd, source: "namesilo-store" };
  });
}

export function findNameSiloSslProduct(
  products: NameSiloSslProduct[],
  id: string,
): NameSiloSslProduct | null {
  return products.find((row) => row.id === id) ?? null;
}

let cache: { at: number; products: NameSiloSslProduct[] } | null = null;
const CACHE_MS = 6 * 60 * 60 * 1000;

export async function loadNameSiloSslCatalog(): Promise<{
  products: NameSiloSslProduct[];
  live: boolean;
}> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return {
      products: cache.products,
      live: cache.products.some((row) => row.source === "namesilo-store"),
    };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_MS);
    const res = await fetch(STORE_URL, {
      signal: controller.signal,
      headers: { accept: "text/html" },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { products: NAMESILO_SSL_FALLBACK, live: false };
    }
    const html = await res.text();
    const products = applyLiveSslPrices(parseNameSiloSslStoreHtml(html));
    cache = { at: Date.now(), products };
    return {
      products,
      live: products.some((row) => row.source === "namesilo-store"),
    };
  } catch {
    return { products: NAMESILO_SSL_FALLBACK, live: false };
  }
}

export function setNameSiloSslCatalogCacheForTests(
  products: NameSiloSslProduct[] | null,
) {
  if (process.env.NODE_ENV === "production") return;
  cache = products ? { at: Date.now(), products } : null;
}
