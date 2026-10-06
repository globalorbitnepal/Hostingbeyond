import type { DomainResult } from "@/lib/domains/availability";
import {
  getRetailQuoteForTld,
  premiumRetailFromSupplier,
} from "@/lib/domains/pricing-engine";
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

export async function mapRowToCustomerResult(
  row: ProviderAvailabilityRow,
): Promise<DomainResult | null> {
  const tldKey = row.tld.startsWith(".")
    ? row.tld.toLowerCase()
    : `.${row.tld.toLowerCase()}`;
  let retail = await getRetailQuoteForTld(tldKey).catch(() => null);
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
        "We couldn't verify availability for this name right now. Please try again.",
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

  const isPremium = row.status === "premium";
  const supplierReg = row.supplier.register;
  let register = retail.register;
  if (isPremium && supplierReg == null) {
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
  if (isPremium && supplierReg != null) {
    const rowDb = await prisma.domainTldPrice
      .findUnique({
        where: { tld: tldKey },
      })
      .catch(() => null);
    register = premiumRetailFromSupplier(
      supplierReg,
      retail.register,
      rowDb?.premiumMarkupPercent != null
        ? Number(rowDb.premiumMarkupPercent)
        : null,
    );
  }

  return {
    domain: row.domain,
    name: row.name,
    tld: tldKey,
    status: isPremium ? "premium" : "available",
    register,
    renew: retail.renew,
    transfer: retail.transfer,
    message: isPremium
      ? "Premium domain — price includes registry fees."
      : retail.isPromo
        ? `Promotional first year — renews at $${retail.renew.toFixed(2)}/yr`
        : undefined,
  };
}

function availabilityBatchSize(): number {
  const raw = Number(process.env.DOMAIN_AVAILABILITY_BATCH_SIZE ?? 25);
  if (!Number.isFinite(raw) || raw < 5) return 25;
  return Math.min(Math.max(raw, 5), 50);
}

function availabilityBatchConcurrency(): number {
  const raw = Number(process.env.DOMAIN_AVAILABILITY_BATCH_CONCURRENCY ?? 2);
  if (!Number.isFinite(raw) || raw < 1) return 2;
  return Math.min(Math.max(raw, 1), 4);
}

async function checkAvailabilityInBatches(
  provider: NonNullable<ReturnType<typeof resolveAvailabilityProvider>>,
  fqdns: string[],
): Promise<import("@/lib/domains/providers/types").ProviderAvailabilityRow[]> {
  const size = availabilityBatchSize();
  if (fqdns.length <= size) {
    return provider.checkAvailability(fqdns);
  }
  const chunks: string[][] = [];
  for (let i = 0; i < fqdns.length; i += size) {
    chunks.push(fqdns.slice(i, i + size));
  }
  const limit = availabilityBatchConcurrency();
  const results: import("@/lib/domains/providers/types").ProviderAvailabilityRow[] =
    [];
  let index = 0;
  async function worker() {
    while (index < chunks.length) {
      const chunkIndex = index++;
      const part = await provider.checkAvailability(chunks[chunkIndex]!);
      results.push(...part);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, chunks.length) }, () => worker()),
  );
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
            message: "Unable to check this extension right now.",
          };
        }
        const mapped = await mapRowToCustomerResult(row);
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
): Promise<{ results: DomainResult[]; source: "registrar" | "catalog" }> {
  const key = searchCacheKey(fqdns);
  return withSearchDedup(key, () => searchDomainsWithProviderUncached(fqdns));
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
