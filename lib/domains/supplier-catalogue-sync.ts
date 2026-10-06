import { invalidateTldCatalogueCache } from "@/lib/domains/tld-catalogue-cache";
import type { TldCatalogueFetchResult } from "@/lib/domains/providers/tld-catalogue-fetch";
import { PRICE_BY_TLD, TLD_PRICES } from "@/lib/domains/tlds";
import { resolveAvailabilityProvider } from "@/lib/domains/providers/index";
import type { ProviderTldPricing } from "@/lib/domains/providers/provider";
import { prisma } from "@/lib/prisma";

export type SupplierCatalogueSyncStatus = "SUCCESS" | "PARTIAL" | "FAILED";

export type SupplierCatalogueSyncResult = {
  status: SupplierCatalogueSyncStatus;
  syncedAt: Date;
  providerTotalCount: number;
  tldsReceived: number;
  pagesFetched: number;
  parseFailures: number;
  duplicateTlds: number;
  pageErrors: number;
  tldsUpdated: number;
  tldsCreated: number;
  tldsFailed: number;
  tldsSkipped: number;
  skipReasons: Record<string, number>;
  withRegisterPrice: number;
  withRenewPrice: number;
  withTransferPrice: number;
  withMaxRegisterYears: number;
  tldPresence: Record<string, boolean>;
};

const WATCH_TLDS = [
  ".in",
  ".pk",
  ".ai",
  ".io",
  ".app",
  ".dev",
  ".chat",
  ".studio",
] as const;

function defaultRetailForTld(tld: string) {
  const catalogue =
    PRICE_BY_TLD.get(tld) ?? TLD_PRICES.find((r) => r.tld === tld);
  if (catalogue) {
    return {
      retailRegister: catalogue.register,
      retailRenew: catalogue.renew,
      retailTransfer: catalogue.transfer,
    };
  }
  return {
    retailRegister: 19.99,
    retailRenew: 19.99,
    retailTransfer: 19.99,
  };
}

function summarizeCatalogue(items: ProviderTldPricing[]) {
  let withRegisterPrice = 0;
  let withRenewPrice = 0;
  let withTransferPrice = 0;
  let withMaxRegisterYears = 0;
  const tldPresence: Record<string, boolean> = {};
  for (const key of WATCH_TLDS) {
    tldPresence[key] = false;
  }
  for (const item of items) {
    const tld = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
    if (item.register != null) withRegisterPrice += 1;
    if (item.renew != null) withRenewPrice += 1;
    if (item.transfer != null) withTransferPrice += 1;
    if (item.maxRegisterYears != null && item.maxRegisterYears > 0) {
      withMaxRegisterYears += 1;
    }
    if (tld in tldPresence) tldPresence[tld] = true;
  }
  return {
    withRegisterPrice,
    withRenewPrice,
    withTransferPrice,
    withMaxRegisterYears,
    tldPresence,
  };
}

export type SupplierCatalogueDiagnostic = SupplierCatalogueSyncResult & {
  dbCountBefore: number;
  dbCountAfter: number;
  sampleSupplierPricing: Array<{
    tld: string;
    register: number | null;
    renew: number | null;
    transfer: number | null;
    maxRegisterYears: number | null;
  }>;
};

export async function diagnoseProviderTldCatalogue(): Promise<{
  fetch: TldCatalogueFetchResult | null;
  fetchError?: string;
  summary: ReturnType<typeof summarizeCatalogue> | null;
  dbCount: number;
}> {
  const provider = resolveAvailabilityProvider();
  const dbCount = await prisma.domainTldPrice.count().catch(() => 0);
  if (!provider?.listAllTldPricingDetailed) {
    return {
      fetch: null,
      fetchError: "provider_unavailable",
      summary: null,
      dbCount,
    };
  }
  try {
    const fetch = await provider.listAllTldPricingDetailed();
    return {
      fetch,
      summary: summarizeCatalogue(fetch.items),
      dbCount,
    };
  } catch (error) {
    return {
      fetch: null,
      fetchError:
        error instanceof Error ? error.message : "provider_catalogue_failed",
      summary: null,
      dbCount,
    };
  }
}

export async function syncSupplierCatalogueFromProvider(
  adminUserId?: string,
): Promise<SupplierCatalogueSyncResult> {
  const provider = resolveAvailabilityProvider();
  if (!provider?.listAllTldPricingDetailed) {
    throw new Error("provider_unavailable");
  }

  const started = Date.now();
  const syncedAt = new Date();
  const skipReasons: Record<string, number> = {};
  let fetchMeta: TldCatalogueFetchResult | null = null;
  let fetchError: string | undefined;
  let catalogue: ProviderTldPricing[] = [];

  try {
    fetchMeta = await provider.listAllTldPricingDetailed();
    catalogue = fetchMeta.items;
  } catch (error) {
    fetchError =
      error instanceof Error ? error.message : "provider_catalogue_failed";
  }

  let tldsUpdated = 0;
  let tldsCreated = 0;
  let tldsFailed = 0;
  let tldsSkipped = 0;

  const summary = summarizeCatalogue(catalogue);

  if (catalogue.length > 0) {
    const chunkSize = 40;
    for (let i = 0; i < catalogue.length; i += chunkSize) {
      const chunk = catalogue.slice(i, i + chunkSize);
      await prisma.$transaction(async (tx) => {
        for (const item of chunk) {
          const tld = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
          if (!tld || tld === ".") {
            tldsSkipped += 1;
            skipReasons.invalid_name = (skipReasons.invalid_name ?? 0) + 1;
            continue;
          }
          const defaults = defaultRetailForTld(tld);
          try {
            const existing = await tx.domainTldPrice.findUnique({
              where: { tld },
            });
            if (existing) {
              await tx.domainTldPrice.update({
                where: { tld },
                data: {
                  supplierRegister: item.register,
                  supplierRenew: item.renew,
                  supplierTransfer: item.transfer,
                  supplierRestore: item.restore,
                  supplierCurrency: item.currency,
                  supplierSyncedAt: syncedAt,
                  supplierMaxRegisterYears: item.maxRegisterYears ?? null,
                },
              });
              tldsUpdated += 1;
            } else {
              await tx.domainTldPrice.create({
                data: {
                  tld,
                  ...defaults,
                  supplierRegister: item.register,
                  supplierRenew: item.renew,
                  supplierTransfer: item.transfer,
                  supplierRestore: item.restore,
                  supplierCurrency: item.currency,
                  supplierSyncedAt: syncedAt,
                  supplierMaxRegisterYears: item.maxRegisterYears ?? null,
                  enabled: true,
                },
              });
              tldsCreated += 1;
            }
          } catch {
            tldsFailed += 1;
            skipReasons.db_error = (skipReasons.db_error ?? 0) + 1;
          }
        }
      });
    }
  }

  const status: SupplierCatalogueSyncStatus = fetchError
    ? catalogue.length > 0
      ? "PARTIAL"
      : "FAILED"
    : tldsFailed > 0 || (fetchMeta?.parseFailures ?? 0) > 0
      ? "PARTIAL"
      : "SUCCESS";

  try {
    await prisma.domainAuditLog.create({
      data: {
        adminUserId: adminUserId ?? null,
        action: "DOMAIN_PROVIDER_SYNC",
        resource: "DomainTldPrice",
        details: {
          status,
          syncedAt: syncedAt.toISOString(),
          providerTotalCount: fetchMeta?.totalCount ?? 0,
          pagesFetched: fetchMeta?.pagesFetched ?? 0,
          parseFailures: fetchMeta?.parseFailures ?? 0,
          duplicateTlds: fetchMeta?.duplicateTlds ?? 0,
          pageErrors: fetchMeta?.pageErrors ?? 0,
          tldsReceived: catalogue.length,
          tldsUpdated,
          tldsCreated,
          tldsFailed,
          tldsSkipped,
          skipReasons,
          ...summary,
          durationMs: Date.now() - started,
          fetchError,
        },
      },
    });
  } catch {
    /* audit optional when DB unavailable */
  }

  if (status === "FAILED") {
    throw new Error(fetchError ?? "supplier_sync_failed");
  }

  invalidateTldCatalogueCache();

  return {
    status,
    syncedAt,
    providerTotalCount: fetchMeta?.totalCount ?? catalogue.length,
    tldsReceived: catalogue.length,
    pagesFetched: fetchMeta?.pagesFetched ?? 0,
    parseFailures: fetchMeta?.parseFailures ?? 0,
    duplicateTlds: fetchMeta?.duplicateTlds ?? 0,
    pageErrors: fetchMeta?.pageErrors ?? 0,
    tldsUpdated,
    tldsCreated,
    tldsFailed,
    tldsSkipped,
    skipReasons,
    ...summary,
  };
}

export async function getLatestSupplierSyncMeta(): Promise<{
  status: SupplierCatalogueSyncStatus | null;
  syncedAt: string | null;
  tldsReceived: number | null;
  tldsUpdated: number | null;
  tldsFailed: number | null;
  providerTotalCount: number | null;
  pagesFetched: number | null;
}> {
  const row = await prisma.domainAuditLog.findFirst({
    where: { action: "DOMAIN_PROVIDER_SYNC" },
    orderBy: { createdAt: "desc" },
  });
  if (!row?.details || typeof row.details !== "object") {
    return {
      status: null,
      syncedAt: null,
      tldsReceived: null,
      tldsUpdated: null,
      tldsFailed: null,
      providerTotalCount: null,
      pagesFetched: null,
    };
  }
  const d = row.details as Record<string, unknown>;
  return {
    status: (d.status as SupplierCatalogueSyncStatus) ?? null,
    syncedAt:
      typeof d.syncedAt === "string" ? d.syncedAt : row.createdAt.toISOString(),
    tldsReceived: typeof d.tldsReceived === "number" ? d.tldsReceived : null,
    tldsUpdated: typeof d.tldsUpdated === "number" ? d.tldsUpdated : null,
    tldsFailed: typeof d.tldsFailed === "number" ? d.tldsFailed : null,
    providerTotalCount:
      typeof d.providerTotalCount === "number" ? d.providerTotalCount : null,
    pagesFetched: typeof d.pagesFetched === "number" ? d.pagesFetched : null,
  };
}
