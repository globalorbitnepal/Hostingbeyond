import { invalidateTldCatalogueCache } from "@/lib/domains/tld-catalogue-cache";
import { PRICE_BY_TLD, TLD_PRICES } from "@/lib/domains/tlds";
import { resolveAvailabilityProvider } from "@/lib/domains/providers/index";
import type { ProviderTldPricing } from "@/lib/domains/providers/provider";
import { prisma } from "@/lib/prisma";

export type SupplierCatalogueSyncStatus = "SUCCESS" | "PARTIAL" | "FAILED";

export type SupplierCatalogueSyncResult = {
  status: SupplierCatalogueSyncStatus;
  syncedAt: Date;
  tldsReceived: number;
  tldsUpdated: number;
  tldsFailed: number;
};

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

export async function syncSupplierCatalogueFromProvider(
  adminUserId?: string,
): Promise<SupplierCatalogueSyncResult> {
  const provider = resolveAvailabilityProvider();
  if (!provider?.listAllTldPricing) {
    throw new Error("provider_unavailable");
  }

  const started = Date.now();
  const syncedAt = new Date();
  let catalogue: ProviderTldPricing[] = [];
  let fetchError: string | undefined;

  try {
    catalogue = await provider.listAllTldPricing();
  } catch (error) {
    fetchError =
      error instanceof Error ? error.message : "provider_catalogue_failed";
  }

  let tldsUpdated = 0;
  let tldsFailed = 0;

  if (catalogue.length > 0) {
    for (const item of catalogue) {
      const tld = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
      const defaults = defaultRetailForTld(tld);
      try {
        await prisma.domainTldPrice.upsert({
          where: { tld },
          create: {
            tld,
            ...defaults,
            supplierRegister: item.register,
            supplierRenew: item.renew,
            supplierTransfer: item.transfer,
            supplierRestore: item.restore,
            supplierCurrency: item.currency,
            supplierSyncedAt: syncedAt,
            supplierMaxRegisterYears: item.maxRegisterYears ?? null,
            enabled: Boolean(PRICE_BY_TLD.get(tld)),
          },
          update: {
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
      } catch {
        tldsFailed += 1;
      }
    }
  }

  const status: SupplierCatalogueSyncStatus = fetchError
    ? catalogue.length > 0
      ? "PARTIAL"
      : "FAILED"
    : tldsFailed > 0
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
          tldsReceived: catalogue.length,
          tldsUpdated,
          tldsFailed,
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
    tldsReceived: catalogue.length,
    tldsUpdated,
    tldsFailed,
  };
}

export async function getLatestSupplierSyncMeta(): Promise<{
  status: SupplierCatalogueSyncStatus | null;
  syncedAt: string | null;
  tldsReceived: number | null;
  tldsUpdated: number | null;
  tldsFailed: number | null;
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
  };
}
