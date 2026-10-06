import type { DomainNameApiConfig } from "@/lib/domains/providers/domain-name-api-config";
import type { ProviderTldPricing } from "@/lib/domains/providers/provider";
import { DomainProviderError } from "@/lib/domains/providers/types";

type FetchLike = typeof fetch;

export type TldCataloguePageResult = {
  items: ProviderTldPricing[];
  parseFailures: number;
  skipCount: number;
  pageSize: number;
  totalCount: number;
  rawItemCount: number;
};

export type TldCatalogueFetchResult = {
  items: ProviderTldPricing[];
  totalCount: number;
  pagesFetched: number;
  parseFailures: number;
  duplicateTlds: number;
  pageErrors: number;
};

const CATALOGUE_TIMEOUT_MS = 60_000;
const DEFAULT_PAGE_SIZE = 200;
const MAX_PAGES = 200;

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Supplier catalogue prices are per registration/renewal period; arrays are not ordered. */
function priceForPeriod(block: unknown, period: number): number | null {
  if (!Array.isArray(block)) {
    if (block && typeof block === "object" && !Array.isArray(block)) {
      const o = block as Record<string, unknown>;
      if ("price" in o) return parsePrice(o.price);
    }
    return null;
  }
  for (const row of block) {
    if (!row || typeof row !== "object") continue;
    const p = (row as Record<string, unknown>).period;
    if (typeof p === "number" && p === period) {
      return parsePrice((row as Record<string, unknown>).price);
    }
  }
  return null;
}

function standardTermPrice(block: unknown): number | null {
  const oneYear = priceForPeriod(block, 1);
  if (oneYear != null) return oneYear;
  if (!Array.isArray(block) || block.length === 0) return null;
  let bestPeriod: number | null = null;
  let bestPrice: number | null = null;
  for (const row of block) {
    if (!row || typeof row !== "object") continue;
    const periodRaw = (row as Record<string, unknown>).period;
    const period =
      typeof periodRaw === "number" && Number.isFinite(periodRaw)
        ? periodRaw
        : null;
    const price = parsePrice((row as Record<string, unknown>).price);
    if (price == null) continue;
    if (period == null) return price;
    if (bestPeriod == null || period < bestPeriod) {
      bestPeriod = period;
      bestPrice = price;
    }
  }
  return bestPrice;
}

function currencyFromPriceBlock(block: unknown): string | null {
  if (!Array.isArray(block)) return null;
  for (const row of block) {
    if (!row || typeof row !== "object") continue;
    if ((row as Record<string, unknown>).period === 1) {
      const c = (row as Record<string, unknown>).currency;
      if (typeof c === "string" && c.trim()) return c.trim();
    }
  }
  const first = block[0];
  if (first && typeof first === "object") {
    const c = (first as Record<string, unknown>).currency;
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

function maxYearsFromRegisterBlock(block: unknown): number | null {
  if (Array.isArray(block) && block.length > 0) return block.length;
  return null;
}

/** Parse ProductTldListDto per official Swagger (prices[].register/renew/transfer arrays). */
export function parseProductTldListDto(
  raw: unknown,
): ProviderTldPricing | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const name = String(item.name ?? "")
    .toLowerCase()
    .replace(/^\./, "");
  if (!name) return null;

  const priceGroups = Array.isArray(item.prices) ? item.prices : [];
  const group = (priceGroups[0] ?? null) as Record<string, unknown> | null;

  const registerBlock = group?.register ?? group?.registration;
  const renewBlock = group?.renew ?? group?.renewal;
  const transferBlock = group?.transfer;

  const maxRegisterYears =
    typeof item.maxRegistrationPeriod === "number"
      ? item.maxRegistrationPeriod
      : maxYearsFromRegisterBlock(registerBlock);

  const currency = currencyFromPriceBlock(registerBlock) ?? "USD";

  return {
    tld: `.${name}`,
    register: standardTermPrice(registerBlock),
    renew: standardTermPrice(renewBlock),
    transfer: standardTermPrice(transferBlock),
    restore: standardTermPrice(group?.restore),
    currency: currency || "USD",
    maxRegisterYears,
  };
}

export type FetchTldPageFn = (
  skip: number,
  pageSize: number,
) => Promise<{ items: unknown[]; totalCount: number }>;

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAllTldCataloguePages(
  fetchPage: FetchTldPageFn,
  options?: { pageSize?: number; maxPages?: number },
): Promise<TldCatalogueFetchResult> {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = options?.maxPages ?? MAX_PAGES;
  let skip = 0;
  let totalCount = 0;
  let pagesFetched = 0;
  let parseFailures = 0;
  let pageErrors = 0;
  let duplicateTlds = 0;
  const byTld = new Map<string, ProviderTldPricing>();

  while (pagesFetched < maxPages) {
    let rawItems: unknown[] = [];
    let pageTotal = 0;
    let attempt = 0;
    while (attempt < 3) {
      try {
        const page = await fetchPage(skip, pageSize);
        rawItems = page.items;
        pageTotal = page.totalCount;
        break;
      } catch {
        attempt += 1;
        if (attempt >= 3) {
          pageErrors += 1;
          throw new DomainProviderError("provider_failure", "tld_page_failed");
        }
        await sleep(400 * attempt);
      }
    }

    pagesFetched += 1;
    if (pagesFetched === 1 && pageTotal > 0) {
      totalCount = pageTotal;
    }

    if (!rawItems.length) break;

    for (const raw of rawItems) {
      const row = parseProductTldListDto(raw);
      if (!row) {
        parseFailures += 1;
        continue;
      }
      const key = row.tld.toLowerCase();
      if (byTld.has(key)) duplicateTlds += 1;
      byTld.set(key, row);
    }

    skip += rawItems.length;
    if (totalCount > 0 && skip >= totalCount) break;
    if (rawItems.length < pageSize) break;
  }

  return {
    items: [...byTld.values()],
    totalCount: totalCount || byTld.size,
    pagesFetched,
    parseFailures,
    duplicateTlds,
    pageErrors,
  };
}

export function createTldCataloguePageFetcher(
  config: DomainNameApiConfig,
  fetchImpl: FetchLike,
  apiRequest: (
    config: DomainNameApiConfig,
    fetchImpl: FetchLike,
    method: string,
    endpoint: string,
    data: unknown,
    timeoutMs: number,
  ) => Promise<unknown>,
): FetchTldPageFn {
  return async (skip, pageSize) => {
    const json = (await apiRequest(
      config,
      fetchImpl,
      "GET",
      "products/tlds",
      {
        SkipCount: String(skip),
        MaxResultCount: String(pageSize),
      },
      CATALOGUE_TIMEOUT_MS,
    )) as { items?: unknown[]; totalCount?: number };
    const items = Array.isArray(json.items) ? json.items : [];
    const totalCount =
      typeof json.totalCount === "number" && Number.isFinite(json.totalCount)
        ? json.totalCount
        : items.length;
    return { items, totalCount };
  };
}
