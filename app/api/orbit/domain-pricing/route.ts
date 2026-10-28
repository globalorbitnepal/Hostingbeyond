import { NextResponse } from "next/server";

import { refreshSupplierTldPricesFromProvider } from "@/lib/domains/domain-service";
import {
  ensureDomainTldPricesSeeded,
  listRetailTldPrices,
} from "@/lib/domains/pricing-engine";
import {
  extraLiveOnlyTlds,
  overlayRowWithLiveNameSilo,
  readLiveNameSiloOverlay,
} from "@/lib/domains/namesilo-live-display";
import {
  getLatestNameSiloSyncMeta,
  normalizeCatalogueTld,
} from "@/lib/domains/namesilo-supplier-sync";
import { getLatestSupplierSyncMeta } from "@/lib/domains/supplier-catalogue-sync";
import { revalidateDomainRetailSurfaces } from "@/lib/orbit/revalidate-domain-pricing";
import { bulkRetailPreviewRequiredResponse } from "@/lib/orbit/bulk-retail-policy";
import {
  pickRetailUpdateData,
  toPrismaRetailUpdateData,
  validateRetailPricePayload,
} from "@/lib/orbit/domain-pricing-update";
import { authorizeDomainPricingAdmin } from "@/lib/orbit/domain-pricing-auth";
import {
  assertRetailUpdateAllowed,
  retailPriceFieldsInUpdate,
} from "@/lib/orbit/retail-price-lock";
import { buildCatalogueRowMetrics } from "@/lib/orbit/pricing-financial-metrics";
import type { TldPriceRowInput } from "@/lib/orbit/bulk-retail-preview";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeRow(
  row: Awaited<ReturnType<typeof listRetailTldPrices>>[0],
  live?: {
    byTld: Map<
      string,
      import("@/lib/domains/providers/namesilo-pricing").NameSiloPriceRow
    >;
    fetchedAt: Date | null;
    active: boolean;
  },
) {
  const num = (v: unknown) =>
    v == null
      ? null
      : typeof v === "object" && v !== null && "toNumber" in v
        ? (v as { toNumber: () => number }).toNumber()
        : Number(v);
  const storedNs = {
    namesiloRegister: num(row.namesiloRegister),
    namesiloRenew: num(row.namesiloRenew),
    namesiloTransfer: num(row.namesiloTransfer),
    namesiloSyncedAt: row.namesiloSyncedAt,
    namesiloPriceStatus: row.namesiloPriceStatus,
  };
  const overlaid = live?.active
    ? overlayRowWithLiveNameSilo(
        storedNs,
        live.byTld.get(normalizeCatalogueTld(row.tld)),
        live.fetchedAt,
      )
    : overlayRowWithLiveNameSilo(storedNs, undefined, null);
  const input: TldPriceRowInput = {
    tld: row.tld,
    updatedAt: row.updatedAt,
    retailPriceLocked: row.retailPriceLocked,
    retailRegister: num(row.retailRegister) ?? 0,
    retailRenew: num(row.retailRenew) ?? 0,
    retailTransfer: num(row.retailTransfer) ?? 0,
    supplierRegister: num(row.supplierRegister),
    supplierRenew: num(row.supplierRenew),
    supplierTransfer: num(row.supplierTransfer),
    supplierSyncedAt: row.supplierSyncedAt,
    namesiloRegister: overlaid.namesiloRegister,
    namesiloRenew: overlaid.namesiloRenew,
    namesiloTransfer: overlaid.namesiloTransfer,
    namesiloSyncedAt: overlaid.namesiloSyncedAt,
    namesiloPriceStatus: overlaid.namesiloPriceStatus,
    supplierCurrency: row.supplierCurrency,
    retailCurrency: row.retailCurrency,
  };
  const metrics = buildCatalogueRowMetrics(input);
  const liveMax = live?.active
    ? live.byTld.get(normalizeCatalogueTld(row.tld))?.maxRegisterYears
    : null;
  return {
    id: row.id,
    tld: row.tld,
    supplierCurrency: row.supplierCurrency,
    retailCurrency: row.retailCurrency,
    supplierRegister: num(row.supplierRegister),
    supplierRenew: num(row.supplierRenew),
    supplierTransfer: num(row.supplierTransfer),
    supplierRestore: num(row.supplierRestore),
    supplierSyncedAt: row.supplierSyncedAt?.toISOString() ?? null,
    supplierMaxRegisterYears:
      liveMax != null ? liveMax : row.supplierMaxRegisterYears,
    retailRegister: num(row.retailRegister),
    retailRenew: num(row.retailRenew),
    retailTransfer: num(row.retailTransfer),
    retailRestore: num(row.retailRestore),
    retailRegisterByYear: row.retailRegisterByYear,
    retailRenewByYear: row.retailRenewByYear,
    enabled: row.enabled,
    namesiloRegister: overlaid.namesiloRegister,
    namesiloRenew: overlaid.namesiloRenew,
    namesiloTransfer: overlaid.namesiloTransfer,
    namesiloSyncedAt: overlaid.namesiloSyncedAt?.toISOString() ?? null,
    namesiloPriceStatus: overlaid.namesiloPriceStatus,
    namesiloPriceSource: overlaid.namesiloPriceSource,
    storedNamesiloRegister: overlaid.storedNamesiloRegister,
    storedNamesiloRenew: overlaid.storedNamesiloRenew,
    storedNamesiloTransfer: overlaid.storedNamesiloTransfer,
    lifecycleProvider: row.lifecycleProvider,
    retailPriceLocked: row.retailPriceLocked,
    liveOnly: false,
    metrics,
  };
}

function serializeLiveOnlyRow(
  liveRow: import("@/lib/domains/providers/namesilo-pricing").NameSiloPriceRow,
  fetchedAt: Date | null,
) {
  const overlaid = overlayRowWithLiveNameSilo(
    {
      namesiloRegister: null,
      namesiloRenew: null,
      namesiloTransfer: null,
      namesiloSyncedAt: null,
      namesiloPriceStatus: null,
    },
    liveRow,
    fetchedAt,
  );
  const input: TldPriceRowInput = {
    tld: liveRow.tld,
    updatedAt: fetchedAt ?? new Date(0),
    retailPriceLocked: true,
    retailRegister: 0,
    retailRenew: 0,
    retailTransfer: 0,
    supplierRegister: null,
    supplierRenew: null,
    supplierTransfer: null,
    supplierSyncedAt: null,
    namesiloRegister: overlaid.namesiloRegister,
    namesiloRenew: overlaid.namesiloRenew,
    namesiloTransfer: overlaid.namesiloTransfer,
    namesiloSyncedAt: overlaid.namesiloSyncedAt,
    namesiloPriceStatus: overlaid.namesiloPriceStatus,
    supplierCurrency: "USD",
    retailCurrency: "USD",
  };
  const metrics = buildCatalogueRowMetrics(input);
  return {
    id: `live:${liveRow.tld}`,
    tld: liveRow.tld,
    supplierCurrency: "USD",
    retailCurrency: "USD",
    supplierRegister: null,
    supplierRenew: null,
    supplierTransfer: null,
    supplierRestore: null,
    supplierSyncedAt: null,
    supplierMaxRegisterYears: liveRow.maxRegisterYears ?? null,
    retailRegister: 0,
    retailRenew: 0,
    retailTransfer: 0,
    retailRestore: null,
    retailRegisterByYear: null,
    retailRenewByYear: null,
    enabled: false,
    namesiloRegister: overlaid.namesiloRegister,
    namesiloRenew: overlaid.namesiloRenew,
    namesiloTransfer: overlaid.namesiloTransfer,
    namesiloSyncedAt: overlaid.namesiloSyncedAt?.toISOString() ?? null,
    namesiloPriceStatus: overlaid.namesiloPriceStatus,
    namesiloPriceSource: overlaid.namesiloPriceSource,
    storedNamesiloRegister: null,
    storedNamesiloRenew: null,
    storedNamesiloTransfer: null,
    lifecycleProvider: null,
    retailPriceLocked: true,
    liveOnly: true,
    metrics,
  };
}

export async function GET() {
  const admin = await authorizeDomainPricingAdmin();
  if (admin instanceof Response) return admin;
  await ensureDomainTldPricesSeeded();
  const rows = await listRetailTldPrices();
  const supplierSync = await getLatestSupplierSyncMeta();
  const namesiloSync = await getLatestNameSiloSyncMeta();
  const live = await readLiveNameSiloOverlay();
  const liveActive =
    live.meta.status === "live" || live.meta.status === "cached";
  const liveFetchedAt = live.meta.fetchedAt
    ? new Date(live.meta.fetchedAt)
    : null;
  const serialized = rows.map((row) =>
    serializeRow(row, {
      byTld: live.byTld,
      fetchedAt: liveFetchedAt,
      active: liveActive,
    }),
  );
  if (liveActive) {
    for (const liveRow of extraLiveOnlyTlds(
      rows.map((row) => row.tld),
      live.byTld,
    )) {
      serialized.push(serializeLiveOnlyRow(liveRow, liveFetchedAt));
    }
  }
  return NextResponse.json(
    {
      rows: serialized,
      supplierSync,
      namesiloSync,
      namesiloLive: live.meta,
      tldCount: serialized.length,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}

export async function PUT(request: Request) {
  const admin = await authorizeDomainPricingAdmin();
  if (admin instanceof Response) return admin;
  const body = (await request.json()) as {
    tld?: string;
    retailRegister?: number;
    retailRenew?: number;
    retailTransfer?: number;
    retailRestore?: number | null;
    retailRegisterByYear?: Record<string, number> | null;
    retailRenewByYear?: Record<string, number> | null;
    promoRegister?: number | null;
    minMarginPercent?: number;
    premiumMarkupPercent?: number | null;
    enabled?: boolean;
    bulk?: Array<{
      tld: string;
      retailRegister?: number;
      retailRenew?: number;
      retailTransfer?: number;
    }>;
  };

  if (Array.isArray(body.bulk) && body.bulk.length > 0) {
    return NextResponse.json(bulkRetailPreviewRequiredResponse(), {
      status: 400,
    });
  }

  const tld = body.tld?.trim();
  if (!tld) {
    return NextResponse.json({ error: "TLD required" }, { status: 400 });
  }

  const key = tld.startsWith(".") ? tld : `.${tld}`;
  const before = await prisma.domainTldPrice.findUnique({
    where: { tld: key },
  });
  if (!before) {
    return NextResponse.json({ error: "TLD not found" }, { status: 404 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const validationErrors = validateRetailPricePayload(bodyRecord);
  if (validationErrors.length) {
    return NextResponse.json(
      {
        error: validationErrors[0]!.message,
        field: validationErrors[0]!.field,
      },
      { status: 400 },
    );
  }

  const updateData = pickRetailUpdateData(bodyRecord);
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No retail fields to update." },
      { status: 400 },
    );
  }

  const lock = assertRetailUpdateAllowed(before, updateData, {
    unlocking: bodyRecord.retailPriceLocked === false,
  });
  if (!lock.ok && retailPriceFieldsInUpdate(updateData)) {
    return NextResponse.json(
      { error: "Retail price is locked. Unlock before editing retail fields." },
      { status: 403 },
    );
  }

  const row = await prisma.domainTldPrice.update({
    where: { tld: key },
    data: toPrismaRetailUpdateData(updateData),
  });
  revalidateDomainRetailSurfaces();

  await prisma.domainAuditLog.create({
    data: {
      adminUserId: admin.id,
      action: "DOMAIN_PRICING_UPDATE",
      resource: "DomainTldPrice",
      resourceId: row.id,
      details: {
        tld: key,
        before: {
          retailRegister: before.retailRegister,
          retailRenew: before.retailRenew,
          retailTransfer: before.retailTransfer,
          retailRegisterByYear: before.retailRegisterByYear,
          retailRenewByYear: before.retailRenewByYear,
        },
        after: {
          retailRegister: row.retailRegister,
          retailRenew: row.retailRenew,
          retailTransfer: row.retailTransfer,
          retailRegisterByYear: row.retailRegisterByYear,
          retailRenewByYear: row.retailRenewByYear,
        },
      },
    },
  });

  return NextResponse.json({ row: serializeRow(row) });
}

export async function POST(request: Request) {
  const admin = await authorizeDomainPricingAdmin();
  if (admin instanceof Response) return admin;
  const url = new URL(request.url);
  if (url.searchParams.get("action") !== "refresh-supplier") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  try {
    const result = await refreshSupplierTldPricesFromProvider(admin.id);
    return NextResponse.json({
      ok: true,
      deprecated: true,
      deprecation:
        "DNA catalogue refresh is not the authoritative Orbit domain supplier source. Use GET /api/orbit/domain-pricing/namesilo?action=preview-sync then POST ?action=apply-supplier-sync with { confirm: true }.",
      ...result,
      syncedAt: result.syncedAt.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not refresh supplier prices. Check API settings." },
      { status: 502 },
    );
  }
}
