import type { DomainResult } from "@/lib/domains/availability";
import {
  getRetailQuoteForTld,
  premiumRetailFromSupplier,
  type RetailQuote,
} from "@/lib/domains/pricing-engine";
import {
  buildPremiumRegistrationQuote,
  buildStandardRegistrationQuote,
  resolveCheckoutTermYears,
  tldTermContextFromRow,
  type TldTermContext,
} from "@/lib/domains/registration-term";
import { getRetailPricesForTld } from "@/lib/domains/retail-pricing";
import { splitDomain } from "@/lib/domains/tlds";
import {
  searchCacheKey,
  withSearchDedup,
} from "@/lib/domains/availability-cache";
import { logDomainProvider } from "@/lib/domains/domain-provider-log";
import { resolveAvailabilityProvider } from "@/lib/domains/providers/index";
import {
  DomainProviderError,
  type ProviderAvailabilityRow,
} from "@/lib/domains/providers/types";
import { prisma } from "@/lib/prisma";

async function logProviderCall(
  operation: string,
  started: number,
  success: boolean,
  errorCode?: string,
  errorMessageInternal?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await prisma.domainProviderLog.create({
      data: {
        level: success ? "INFO" : "ERROR",
        operation,
        success,
        durationMs: Date.now() - started,
        errorCode: errorCode ?? null,
        errorMessageInternal: errorMessageInternal ?? null,
        metadata:
          metadata != null
            ? (JSON.parse(JSON.stringify(metadata)) as object)
            : undefined,
      },
    });
  } catch {
    // DB may be unavailable in local static builds — console log only.
  }
}

export type RetailPricingContext = {
  retailByTld: Map<string, RetailQuote>;
  premiumMarkupByTld: Map<string, number | null>;
  termByTld: Map<string, TldTermContext>;
};

function tldKeyFromRow(row: ProviderAvailabilityRow): string {
  return row.tld.startsWith(".")
    ? row.tld.toLowerCase()
    : `.${row.tld.toLowerCase()}`;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export async function buildRetailPricingContext(
  tlds: string[],
): Promise<RetailPricingContext> {
  const keys = [
    ...new Set(
      tlds.map((t) =>
        t.startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`,
      ),
    ),
  ];
  const rows = await prisma.domainTldPrice.findMany({
    where: { tld: { in: keys } },
  });
  const retailByTld = new Map<string, RetailQuote>();
  const premiumMarkupByTld = new Map<string, number | null>();
  const termByTld = new Map<string, TldTermContext>();
  const now = new Date();
  for (const row of rows) {
    if (!row.enabled) continue;
    const termCtx = tldTermContextFromRow(row);
    termByTld.set(row.tld.toLowerCase(), termCtx);
    const promoActive =
      row.promoRegister != null && (!row.promoEndsAt || row.promoEndsAt > now);
    retailByTld.set(row.tld.toLowerCase(), {
      tld: row.tld,
      register: promoActive
        ? toNumber(row.promoRegister)
        : toNumber(row.retailRegister),
      renew: toNumber(row.retailRenew),
      transfer: toNumber(row.retailTransfer),
      restore: row.retailRestore != null ? toNumber(row.retailRestore) : null,
      currency: row.retailCurrency,
      isPromo: promoActive,
    });
    premiumMarkupByTld.set(
      row.tld.toLowerCase(),
      row.premiumMarkupPercent != null
        ? toNumber(row.premiumMarkupPercent)
        : null,
    );
  }
  return { retailByTld, premiumMarkupByTld, termByTld };
}

async function termContextForTld(
  tldKey: string,
  pricingCtx?: RetailPricingContext,
): Promise<TldTermContext | null> {
  const cached = pricingCtx?.termByTld.get(tldKey);
  if (cached) return cached;
  const row = await prisma.domainTldPrice.findUnique({
    where: { tld: tldKey },
  });
  if (!row || !row.enabled) return null;
  return tldTermContextFromRow(row);
}

function termPricingMessage(
  termYears: number,
  base?: string,
): string | undefined {
  if (termYears <= 1) return base;
  return base ? `${base} (${termYears}-year term).` : undefined;
}

export async function mapRowToCustomerResult(
  row: ProviderAvailabilityRow,
  pricingCtx?: RetailPricingContext,
): Promise<DomainResult | null> {
  const tldKey = tldKeyFromRow(row);
  let retail =
    pricingCtx?.retailByTld.get(tldKey) ??
    (await getRetailQuoteForTld(tldKey).catch(() => null));
  if (!retail) {
    const catalogue = getRetailPricesForTld(tldKey);
    if (!catalogue) {
      return {
        domain: row.domain,
        name: row.name,
        tld: tldKey,
        status: "invalid",
        register: null,
        renew: null,
        transfer: null,
        message: `We do not sell ${tldKey} yet — try another extension.`,
      };
    }
    retail = {
      tld: tldKey,
      register: catalogue.register,
      renew: catalogue.renew,
      transfer: catalogue.transfer,
      restore: null,
      currency: "USD",
      isPromo: false,
    };
  }

  if (row.status === "taken") {
    return {
      domain: row.domain,
      name: row.name,
      tld: tldKey,
      status: "taken",
      register: null,
      renew: retail.renew,
      transfer: retail.transfer,
      message: row.message ?? "This domain is already registered.",
    };
  }

  if (row.status === "unknown") {
    return {
      domain: row.domain,
      name: row.name,
      tld: tldKey,
      status: "unknown",
      register: null,
      renew: null,
      transfer: null,
      message:
        row.message ??
        "Temporarily unavailable — registry check did not complete. Please try again.",
    };
  }

  if (row.status === "invalid") {
    return {
      domain: row.domain,
      name: row.name,
      tld: tldKey,
      status: "invalid",
      register: null,
      renew: null,
      transfer: null,
      message: row.message ?? "Please enter a valid domain name.",
    };
  }

  const termCtx = await termContextForTld(tldKey, pricingCtx);
  if (!termCtx) {
    return {
      domain: row.domain,
      name: row.name,
      tld: tldKey,
      status: "invalid",
      register: null,
      renew: null,
      transfer: null,
      message: `We do not sell ${tldKey} yet — try another extension.`,
    };
  }

  const isPremium = row.status === "premium";
  if (isPremium) {
    const markup =
      pricingCtx?.premiumMarkupByTld.get(tldKey) ??
      (await prisma.domainTldPrice
        .findUnique({ where: { tld: tldKey } })
        .then((r) =>
          r?.premiumMarkupPercent != null
            ? Number(r.premiumMarkupPercent)
            : null,
        )
        .catch(() => null));
    const quote = buildPremiumRegistrationQuote(
      termCtx,
      row.supplier,
      markup,
      premiumRetailFromSupplier,
    );
    if (!quote) {
      return {
        domain: row.domain,
        name: row.name,
        tld: tldKey,
        status: "unknown",
        register: null,
        renew: null,
        transfer: null,
        message:
          "Premium pricing could not be verified. Please try again or contact support.",
      };
    }
    return {
      domain: row.domain,
      name: row.name,
      tld: tldKey,
      status: "premium",
      register: quote.registerTotal,
      registerTermYears: quote.termYears,
      renew: quote.renewPerYear,
      transfer: quote.transfer,
      message: termPricingMessage(
        quote.termYears,
        "Premium domain — price includes registry fees.",
      ),
    };
  }

  const termYears = resolveCheckoutTermYears(termCtx, null);
  const quote = buildStandardRegistrationQuote(termCtx, termYears);
  if (!quote) {
    return {
      domain: row.domain,
      name: row.name,
      tld: tldKey,
      status: "unknown",
      register: null,
      registerTermYears: termYears,
      renew: null,
      transfer: null,
      message:
        termYears > 1
          ? `This extension requires a ${termYears}-year registration; retail pricing is not configured for that term.`
          : "Pricing is unavailable for this domain. Please search again.",
    };
  }

  return {
    domain: row.domain,
    name: row.name,
    tld: tldKey,
    status: "available",
    register: quote.registerTotal,
    registerTermYears: quote.termYears,
    renew: quote.renewPerYear,
    transfer: quote.transfer,
    message:
      quote.isPromo && quote.termYears === 1
        ? `Promotional first year — renews at $${quote.renewPerYear?.toFixed(2) ?? "—"}/yr`
        : quote.termYears > 1
          ? `${quote.termYears}-year registration — total $${quote.registerTotal.toFixed(2)}`
          : undefined,
  };
}

function availabilityBatchSize(): number {
  /** LIVE DNA bulk-search returns 403 above ~25 names per request. */
  const raw = Number(process.env.DOMAIN_AVAILABILITY_BATCH_SIZE ?? 25);
  if (!Number.isFinite(raw) || raw < 5) return 25;
  return Math.min(Math.max(raw, 5), 50);
}

function availabilityBatchConcurrency(): number {
  const raw = Number(process.env.DOMAIN_AVAILABILITY_BATCH_CONCURRENCY ?? 1);
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(Math.max(raw, 1), 4);
}

function batchPacingMs(): number {
  const raw = Number(process.env.DOMAIN_AVAILABILITY_BATCH_PACING_MS ?? 0);
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(Math.max(raw, 0), 2000);
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkAvailabilityChunkWithRetry(
  provider: NonNullable<ReturnType<typeof resolveAvailabilityProvider>>,
  fqdns: string[],
  maxAttempts = 4,
): Promise<import("@/lib/domains/providers/types").ProviderAvailabilityRow[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await provider.checkAvailability(fqdns);
    } catch (error) {
      lastError = error;
      const code =
        error instanceof DomainProviderError
          ? error.code
          : error instanceof Error
            ? error.message
            : "";
      if (code !== "rate_limit" || attempt >= maxAttempts - 1) break;
      await sleep(500 * (attempt + 1));
    }
  }
  throw lastError;
}

async function checkAvailabilityInBatches(
  provider: NonNullable<ReturnType<typeof resolveAvailabilityProvider>>,
  fqdns: string[],
): Promise<import("@/lib/domains/providers/types").ProviderAvailabilityRow[]> {
  const size = availabilityBatchSize();
  if (fqdns.length <= size) {
    return checkAvailabilityChunkWithRetry(provider, fqdns);
  }
  const chunks: string[][] = [];
  for (let i = 0; i < fqdns.length; i += size) {
    chunks.push(fqdns.slice(i, i + size));
  }
  const limit = availabilityBatchConcurrency();
  const pacing = batchPacingMs();
  const results: import("@/lib/domains/providers/types").ProviderAvailabilityRow[] =
    [];

  const fallbackRowsForChunk = (
    fqdns: string[],
    message?: string,
  ): import("@/lib/domains/providers/types").ProviderAvailabilityRow[] =>
    fqdns.map((fqdn) => {
      const { name, tld } = splitDomain(fqdn);
      return {
        domain: fqdn.toLowerCase(),
        name,
        tld: tld || ".com",
        status: "unknown",
        supplier: {
          register: null,
          renew: null,
          transfer: null,
          currency: "USD",
        },
        message:
          message ??
          "Temporarily unavailable — registry check did not complete. Please try again.",
      };
    });

  if (limit <= 1) {
    for (let i = 0; i < chunks.length; i++) {
      try {
        const part = await checkAvailabilityChunkWithRetry(
          provider,
          chunks[i]!,
        );
        results.push(...part);
      } catch (error) {
        const hint =
          error instanceof DomainProviderError && error.code === "timeout"
            ? "Temporarily unavailable — the registry timed out. Please try again."
            : error instanceof DomainProviderError &&
                error.code === "rate_limit"
              ? "Temporarily unavailable — too many checks at once. Please wait and try again."
              : undefined;
        results.push(...fallbackRowsForChunk(chunks[i]!, hint));
      }
      if (i < chunks.length - 1 && pacing > 0) await sleep(pacing);
    }
    return results;
  }

  const chunkResults: import("@/lib/domains/providers/types").ProviderAvailabilityRow[][] =
    new Array(chunks.length);
  let index = 0;
  async function worker() {
    while (index < chunks.length) {
      const chunkIndex = index++;
      try {
        chunkResults[chunkIndex] = await checkAvailabilityChunkWithRetry(
          provider,
          chunks[chunkIndex]!,
        );
      } catch (error) {
        const hint =
          error instanceof DomainProviderError && error.code === "timeout"
            ? "Temporarily unavailable — the registry timed out. Please try again."
            : error instanceof DomainProviderError &&
                error.code === "rate_limit"
              ? "Temporarily unavailable — too many checks at once. Please wait and try again."
              : undefined;
        chunkResults[chunkIndex] = fallbackRowsForChunk(
          chunks[chunkIndex]!,
          hint,
        );
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, chunks.length) }, () => worker()),
  );
  for (const part of chunkResults) {
    if (part?.length) results.push(...part);
  }
  return results;
}

async function searchDomainsWithProviderUncached(
  fqdns: string[],
): Promise<{ results: DomainResult[]; source: "registrar" | "catalog" }> {
  const provider = resolveAvailabilityProvider();
  if (!provider) {
    throw new Error("lookup_unconfigured");
  }

  const started = Date.now();
  const pricingStarted = Date.now();
  try {
    const providerStarted = Date.now();
    const rows = await checkAvailabilityInBatches(provider, fqdns);
    const providerRequestMs = Date.now() - providerStarted;

    const byDomain = new Map(rows.map((r) => [r.domain.toLowerCase(), r]));
    const uniqueTlds = rows.map((r) => tldKeyFromRow(r));
    const pricingCtx = await buildRetailPricingContext(uniqueTlds);
    const results = await Promise.all(
      fqdns.map(async (fqdn) => {
        const key = fqdn.toLowerCase();
        const row = byDomain.get(key);
        if (!row) {
          const { name, tld } = splitDomain(fqdn);
          return {
            domain: key,
            name,
            tld: tld || ".com",
            status: "unknown" as const,
            register: null,
            renew: null,
            transfer: null,
            message:
              "Temporarily unavailable — registry check did not complete. Please try again.",
          };
        }
        const mapped = await mapRowToCustomerResult(row, pricingCtx);
        if (!mapped) return null;
        return mapped;
      }),
    );
    const pricingMs = Date.now() - pricingStarted;
    const totalRequestMs = Date.now() - started;

    logDomainProvider("search_timing", {
      domainCount: fqdns.length,
      provider_request_ms: providerRequestMs,
      pricing_ms: pricingMs,
      total_request_ms: totalRequestMs,
    });

    await logProviderCall(
      "checkAvailability",
      started,
      true,
      undefined,
      undefined,
      {
        count: fqdns.length,
        provider: provider.id,
        provider_request_ms: providerRequestMs,
        total_request_ms: totalRequestMs,
      },
    );

    return {
      results: results.filter((item): item is DomainResult => item !== null),
      source: "registrar",
    };
  } catch (error) {
    const code =
      error instanceof DomainProviderError
        ? error.code
        : error instanceof Error
          ? error.message
          : "provider_failure";
    await logProviderCall(
      "checkAvailability",
      started,
      false,
      code,
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

export async function searchDomainsWithProvider(
  fqdns: string[],
  options?: { fresh?: boolean },
): Promise<{ results: DomainResult[]; source: "registrar" | "catalog" }> {
  const key = searchCacheKey(fqdns);
  return withSearchDedup(key, () => searchDomainsWithProviderUncached(fqdns), {
    fresh: options?.fresh,
  });
}

export async function refreshSupplierTldPricesFromProvider(
  adminUserId?: string,
) {
  const { syncSupplierCatalogueFromProvider } =
    await import("@/lib/domains/supplier-catalogue-sync");
  const started = Date.now();
  const result = await syncSupplierCatalogueFromProvider(adminUserId);
  await logProviderCall(
    "listAllTldPricing",
    started,
    true,
    undefined,
    undefined,
    {
      ...result,
      syncedAt: result.syncedAt.toISOString(),
    },
  );
  return result;
}
