import { ensureDomainTldPricesSeeded } from "@/lib/domains/pricing-engine";
import { TLD_PRICES } from "@/lib/domains/tlds";
import { prisma } from "@/lib/prisma";

export type TldCatalogueSnapshot = {
  /** TLDs confirmed from provider sync (supplierSyncedAt set). */
  providerSupported: string[];
  /** Enabled HostingBeyond retail + provider-supported (customer search). */
  searchable: string[];
  loadedAt: number;
  source: "database" | "fallback";
};

let memoryCache: TldCatalogueSnapshot | null = null;

function catalogueTtlMs(): number {
  const hours = Number(process.env.DOMAIN_TLD_CATALOGUE_CACHE_HOURS ?? 4);
  if (!Number.isFinite(hours) || hours < 0.25) return 4 * 60 * 60 * 1000;
  return Math.min(Math.max(hours, 0.25), 24) * 60 * 60 * 1000;
}

function normalizeTld(tld: string): string {
  const key = tld.trim().toLowerCase();
  return key.startsWith(".") ? key : `.${key}`;
}

function staticFallbackCatalogue(): TldCatalogueSnapshot {
  const fallback = TLD_PRICES.map((r) => normalizeTld(r.tld));
  return {
    providerSupported: fallback,
    searchable: fallback,
    loadedAt: Date.now(),
    source: "fallback",
  };
}

async function loadCatalogueFromDatabase(): Promise<TldCatalogueSnapshot> {
  try {
    await ensureDomainTldPricesSeeded();
    const rows = await prisma.domainTldPrice.findMany({
      where: { supplierSyncedAt: { not: null } },
      select: { tld: true, enabled: true },
      orderBy: { tld: "asc" },
    });

    if (rows.length === 0) {
      return staticFallbackCatalogue();
    }

    const providerSupported = rows.map((r) => normalizeTld(r.tld));
    const searchable = rows
      .filter((r) => r.enabled)
      .map((r) => normalizeTld(r.tld));

    return {
      providerSupported,
      searchable,
      loadedAt: Date.now(),
      source: "database",
    };
  } catch {
    return staticFallbackCatalogue();
  }
}

/** Server-side TLD catalogue cache (not fetched from provider on each search). */
export async function getTldCatalogueSnapshot(
  force = false,
): Promise<TldCatalogueSnapshot> {
  const ttl = catalogueTtlMs();
  if (!force && memoryCache && Date.now() - memoryCache.loadedAt < ttl) {
    return memoryCache;
  }
  memoryCache = await loadCatalogueFromDatabase();
  return memoryCache;
}

export async function countProviderSupportedTlds(): Promise<number> {
  const snap = await getTldCatalogueSnapshot();
  return snap.providerSupported.length;
}

export function invalidateTldCatalogueCache(): void {
  memoryCache = null;
}

/** Warm cache on process start / after supplier sync. */
export async function warmTldCatalogueCache(): Promise<number> {
  const snap = await getTldCatalogueSnapshot(true);
  return snap.providerSupported.length;
}
