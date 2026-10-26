import { invalidateTldCatalogueCache } from "@/lib/domains/tld-catalogue-cache";
import {
  deriveNameSiloCatalogueStatus,
  mergeNameSiloCosts,
  type NameSiloCataloguePriceStatus,
} from "@/lib/domains/namesilo-price-status";
import { withNameSiloSyncLock } from "@/lib/domains/namesilo-sync-lock";
import {
  PROPOSED_MARGIN_TARGETS,
  grossMarginPercent,
  recommendRetailPrice,
} from "@/lib/domains/pricing-margin-policy";
import {
  fetchNameSiloAccountPrices,
  type NameSiloPriceRow,
} from "@/lib/domains/providers/namesilo-pricing";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type NameSiloPriceStatus = NameSiloCataloguePriceStatus;

export type NameSiloSyncPreviewRow = {
  tld: string;
  enabled: boolean;
  retailPriceLocked: boolean;
  before: {
    namesiloRegister: number | null;
    namesiloRenew: number | null;
    namesiloTransfer: number | null;
    namesiloPriceStatus: string | null;
  };
  after: {
    namesiloRegister: number | null;
    namesiloRenew: number | null;
    namesiloTransfer: number | null;
    namesiloPriceStatus: NameSiloPriceStatus;
  };
  proposedRetail?: {
    register?: {
      recommended: number;
      grossProfit: number;
      grossMarginPercent: number;
      flag?: string;
    };
    renew?: {
      recommended: number;
      grossProfit: number;
      grossMarginPercent: number;
      flag?: string;
    };
    transfer?: {
      recommended: number;
      grossProfit: number;
      grossMarginPercent: number;
      flag?: string;
    };
  };
  currentRetail: {
    register: number;
    renew: number;
    transfer: number;
  };
  retailWarnings: string[];
};

export type NameSiloSyncApplyResult = {
  syncedAt: string;
  apiTldCount: number;
  catalogueRows: number;
  tldsUpdated: number;
  tldsUnchanged: number;
  tldsMissingOnApi: number;
  tldsInvalidOnApi: number;
  tldsPartial: number;
  tldsVerified: number;
};

/** Catalogue TLD key: lowercase with leading dot (matches `DomainTldPrice.tld`). */
export function normalizeCatalogueTld(tld: string): string {
  const k = tld.trim().toLowerCase();
  return k.startsWith(".") ? k : `.${k}`;
}

function num(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "object" && v !== null && "toNumber" in v) {
    return (v as { toNumber: () => number }).toNumber();
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

type ProposedPriceSlot = {
  recommended: number;
  grossProfit: number;
  grossMarginPercent: number;
  flag?: string;
};

function proposedForCost(
  cost: number | null,
  margin: number,
): ProposedPriceSlot | undefined {
  if (cost == null || !Number.isFinite(cost)) return undefined;
  const rec = recommendRetailPrice(cost, margin);
  if (!rec.ok) {
    return {
      recommended: NaN,
      grossProfit: NaN,
      grossMarginPercent: NaN,
      flag: rec.reason,
    };
  }
  return {
    recommended: rec.recommended,
    grossProfit: rec.grossProfit,
    grossMarginPercent: rec.grossMarginPercent,
  };
}

function incomingCosts(ns: NameSiloPriceRow) {
  return {
    register: ns.register,
    renew: ns.renew,
    transfer: ns.transfer,
  };
}

function previousCosts(db: {
  namesiloRegister: unknown;
  namesiloRenew: unknown;
  namesiloTransfer: unknown;
}) {
  return {
    register: num(db.namesiloRegister),
    renew: num(db.namesiloRenew),
    transfer: num(db.namesiloTransfer),
  };
}

export type PlanRowUpdateDb = {
  namesiloRegister: unknown;
  namesiloRenew: unknown;
  namesiloTransfer: unknown;
  namesiloPriceStatus: string | null;
  namesiloSyncedAt: Date | null;
};

export function planRowUpdate(
  db: PlanRowUpdateDb,
  ns: NameSiloPriceRow | undefined,
  syncedAt: Date,
): {
  data: Prisma.DomainTldPriceUpdateInput;
  status: NameSiloPriceStatus;
  changed: boolean;
} {
  const prev = previousCosts(db);
  if (!ns) {
    const merged = prev;
    const status = deriveNameSiloCatalogueStatus(merged, { onApi: false });
    const data: Prisma.DomainTldPriceUpdateInput = {
      namesiloPriceStatus: status,
      namesiloSyncedAt: syncedAt,
    };
    return {
      data,
      status,
      changed:
        db.namesiloPriceStatus !== status ||
        db.namesiloSyncedAt?.getTime() !== syncedAt.getTime(),
    };
  }

  const merged = mergeNameSiloCosts(prev, incomingCosts(ns));
  const hadInvalid = ns.invalidFields.length > 0;
  const status = deriveNameSiloCatalogueStatus(merged, {
    hadInvalidField: hadInvalid,
    onApi: true,
  });
  const data: Prisma.DomainTldPriceUpdateInput = {
    namesiloRegister: merged.register,
    namesiloRenew: merged.renew,
    namesiloTransfer: merged.transfer,
    namesiloSyncedAt: syncedAt,
    namesiloPriceStatus: status,
  };

  const changed =
    num(db.namesiloRegister) !== merged.register ||
    num(db.namesiloRenew) !== merged.renew ||
    num(db.namesiloTransfer) !== merged.transfer ||
    db.namesiloPriceStatus !== status ||
    db.namesiloSyncedAt?.getTime() !== syncedAt.getTime();

  return { data, status, changed };
}

export async function getLatestNameSiloSyncMeta(): Promise<{
  status: "SUCCESS" | "FAILED" | null;
  syncedAt: string | null;
  apiTldCount: number | null;
  tldsUpdated: number | null;
  tldsMissingOnApi: number | null;
  error: string | null;
}> {
  const success = await prisma.domainAuditLog.findFirst({
    where: { action: "DOMAIN_NAMESILO_SUPPLIER_SYNC" },
    orderBy: { createdAt: "desc" },
  });
  const failure = await prisma.domainAuditLog.findFirst({
    where: { action: "DOMAIN_NAMESILO_SUPPLIER_SYNC_FAILED" },
    orderBy: { createdAt: "desc" },
  });
  const latest =
    success && failure
      ? success.createdAt >= failure.createdAt
        ? success
        : failure
      : (success ?? failure);
  if (!latest) {
    return {
      status: null,
      syncedAt: null,
      apiTldCount: null,
      tldsUpdated: null,
      tldsMissingOnApi: null,
      error: null,
    };
  }
  const details = (latest.details ?? {}) as Record<string, unknown>;
  if (latest.action === "DOMAIN_NAMESILO_SUPPLIER_SYNC_FAILED") {
    return {
      status: "FAILED",
      syncedAt: latest.createdAt.toISOString(),
      apiTldCount: null,
      tldsUpdated: null,
      tldsMissingOnApi: null,
      error: String(details.error ?? "sync_failed"),
    };
  }
  return {
    status: "SUCCESS",
    syncedAt:
      typeof details.syncedAt === "string"
        ? details.syncedAt
        : latest.createdAt.toISOString(),
    apiTldCount:
      typeof details.apiTldCount === "number" ? details.apiTldCount : null,
    tldsUpdated:
      typeof details.tldsUpdated === "number" ? details.tldsUpdated : null,
    tldsMissingOnApi:
      typeof details.tldsMissingOnApi === "number"
        ? details.tldsMissingOnApi
        : null,
    error: null,
  };
}

export async function previewNameSiloSupplierSync(): Promise<{
  fetchedAt: string;
  apiTldCount: number;
  rows: NameSiloSyncPreviewRow[];
}> {
  const apiKey = process.env.NAMESILO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("namesilo_api_key_missing");
  }
  const { rows: apiRows, fetchedAt } = await fetchNameSiloAccountPrices(apiKey);
  const byTld = new Map(apiRows.map((r) => [normalizeCatalogueTld(r.tld), r]));
  const dbRows = await prisma.domainTldPrice.findMany({
    orderBy: { tld: "asc" },
  });

  const previews: NameSiloSyncPreviewRow[] = [];
  for (const db of dbRows) {
    const ns = byTld.get(normalizeCatalogueTld(db.tld));
    const plan = planRowUpdate(db, ns, fetchedAt);
    const merged = ns
      ? mergeNameSiloCosts(previousCosts(db), incomingCosts(ns))
      : previousCosts(db);
    const retailRegister = num(db.retailRegister) ?? 0;
    const retailRenew = num(db.retailRenew) ?? 0;
    const retailTransfer = num(db.retailTransfer) ?? 0;
    const warnings: string[] = [];
    if (merged.register != null && retailRegister < merged.register) {
      warnings.push("retail_register_below_namesilo_cost");
    }
    if (merged.renew != null && retailRenew < merged.renew) {
      warnings.push("retail_renew_below_namesilo_cost");
    }
    if (merged.transfer != null && retailTransfer < merged.transfer) {
      warnings.push("retail_transfer_below_namesilo_cost");
    }
    previews.push({
      tld: db.tld,
      enabled: db.enabled,
      retailPriceLocked: db.retailPriceLocked,
      before: {
        namesiloRegister: num(db.namesiloRegister),
        namesiloRenew: num(db.namesiloRenew),
        namesiloTransfer: num(db.namesiloTransfer),
        namesiloPriceStatus: db.namesiloPriceStatus,
      },
      after: {
        namesiloRegister: merged.register,
        namesiloRenew: merged.renew,
        namesiloTransfer: merged.transfer,
        namesiloPriceStatus: plan.status,
      },
      proposedRetail: {
        register: proposedForCost(
          merged.register,
          PROPOSED_MARGIN_TARGETS.registrationGrossPercent,
        ),
        renew: proposedForCost(
          merged.renew,
          PROPOSED_MARGIN_TARGETS.renewalGrossPercent,
        ),
        transfer: proposedForCost(
          merged.transfer,
          PROPOSED_MARGIN_TARGETS.transferGrossPercent,
        ),
      },
      currentRetail: {
        register: retailRegister,
        renew: retailRenew,
        transfer: retailTransfer,
      },
      retailWarnings: warnings,
    });
  }

  return {
    fetchedAt: fetchedAt.toISOString(),
    apiTldCount: apiRows.length,
    rows: previews,
  };
}

export async function applyNameSiloSupplierSync(
  adminUserId?: string,
): Promise<NameSiloSyncApplyResult> {
  return withNameSiloSyncLock(async () => {
    const apiKey = process.env.NAMESILO_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("namesilo_api_key_missing");
    }

    let apiRows: NameSiloPriceRow[];
    let fetchedAt: Date;
    try {
      const fetched = await fetchNameSiloAccountPrices(apiKey);
      apiRows = fetched.rows;
      fetchedAt = fetched.fetchedAt;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "namesilo_fetch_failed";
      try {
        await prisma.domainAuditLog.create({
          data: {
            adminUserId: adminUserId ?? null,
            action: "DOMAIN_NAMESILO_SUPPLIER_SYNC_FAILED",
            resource: "DomainTldPrice",
            details: { error: message },
          },
        });
      } catch {
        /* optional */
      }
      throw error;
    }

    const byTld = new Map(
      apiRows.map((r) => [normalizeCatalogueTld(r.tld), r]),
    );
    const dbRows = await prisma.domainTldPrice.findMany();
    let tldsUpdated = 0;
    let tldsUnchanged = 0;
    let tldsMissingOnApi = 0;
    let tldsInvalidOnApi = 0;
    let tldsPartial = 0;
    let tldsVerified = 0;

    const chunkSize = 50;
    for (let i = 0; i < dbRows.length; i += chunkSize) {
      const chunk = dbRows.slice(i, i + chunkSize);
      await prisma.$transaction(async (tx) => {
        for (const db of chunk) {
          const ns = byTld.get(normalizeCatalogueTld(db.tld));
          if (!ns) tldsMissingOnApi += 1;
          if (ns?.invalidFields.length) tldsInvalidOnApi += 1;
          const plan = planRowUpdate(db, ns, fetchedAt);
          if (plan.status === "verified") tldsVerified += 1;
          if (plan.status === "partial") tldsPartial += 1;
          if (!plan.changed) {
            tldsUnchanged += 1;
            continue;
          }
          await tx.domainTldPrice.update({
            where: { id: db.id },
            data: plan.data,
          });
          tldsUpdated += 1;
        }
      });
    }

    const result: NameSiloSyncApplyResult = {
      syncedAt: fetchedAt.toISOString(),
      apiTldCount: apiRows.length,
      catalogueRows: dbRows.length,
      tldsUpdated,
      tldsUnchanged,
      tldsMissingOnApi,
      tldsInvalidOnApi,
      tldsPartial,
      tldsVerified,
    };

    try {
      await prisma.domainAuditLog.create({
        data: {
          adminUserId: adminUserId ?? null,
          action: "DOMAIN_NAMESILO_SUPPLIER_SYNC",
          resource: "DomainTldPrice",
          details: result,
        },
      });
    } catch {
      /* optional */
    }

    invalidateTldCatalogueCache();
    return result;
  });
}

export function marginForRetail(
  retail: number,
  cost: number | null,
): number | null {
  if (cost == null) return null;
  return grossMarginPercent(retail, cost);
}
