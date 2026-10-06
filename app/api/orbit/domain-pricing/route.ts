import { NextResponse } from "next/server";

import { refreshSupplierTldPricesFromProvider } from "@/lib/domains/domain-service";
import {
  ensureDomainTldPricesSeeded,
  listRetailTldPrices,
} from "@/lib/domains/pricing-engine";
import { getLatestSupplierSyncMeta } from "@/lib/domains/supplier-catalogue-sync";
import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";

function serializeRow(row: Awaited<ReturnType<typeof listRetailTldPrices>>[0]) {
  const num = (v: unknown) =>
    v == null
      ? null
      : typeof v === "object" && v !== null && "toNumber" in v
        ? (v as { toNumber: () => number }).toNumber()
        : Number(v);
  return {
    id: row.id,
    tld: row.tld,
    supplierRegister: num(row.supplierRegister),
    supplierRenew: num(row.supplierRenew),
    supplierTransfer: num(row.supplierTransfer),
    supplierRestore: num(row.supplierRestore),
    supplierSyncedAt: row.supplierSyncedAt?.toISOString() ?? null,
    supplierMaxRegisterYears: row.supplierMaxRegisterYears,
    retailRegister: num(row.retailRegister),
    retailRenew: num(row.retailRenew),
    retailTransfer: num(row.retailTransfer),
    retailRestore: num(row.retailRestore),
    retailRegisterByYear: row.retailRegisterByYear,
    retailRenewByYear: row.retailRenewByYear,
    enabled: row.enabled,
  };
}

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDomainTldPricesSeeded();
  const rows = await listRetailTldPrices();
  const supplierSync = await getLatestSupplierSyncMeta();
  return NextResponse.json({
    rows: rows.map(serializeRow),
    supplierSync,
    tldCount: rows.length,
  });
}

export async function PUT(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
    const updated: string[] = [];
    for (const item of body.bulk) {
      const key = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
      const before = await prisma.domainTldPrice.findUnique({
        where: { tld: key },
      });
      if (!before) continue;
      const row = await prisma.domainTldPrice.update({
        where: { tld: key },
        data: {
          retailRegister: item.retailRegister,
          retailRenew: item.retailRenew,
          retailTransfer: item.retailTransfer,
        },
      });
      updated.push(key);
      await prisma.domainAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: "DOMAIN_PRICING_UPDATE",
          resource: "DomainTldPrice",
          resourceId: row.id,
          details: {
            tld: key,
            bulk: true,
            before: {
              retailRegister: before.retailRegister,
              retailRenew: before.retailRenew,
              retailTransfer: before.retailTransfer,
            },
            after: {
              retailRegister: row.retailRegister,
              retailRenew: row.retailRenew,
              retailTransfer: row.retailTransfer,
            },
          },
        },
      });
    }
    return NextResponse.json({ ok: true, updated });
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

  const row = await prisma.domainTldPrice.update({
    where: { tld: key },
    data: {
      retailRegister: body.retailRegister,
      retailRenew: body.retailRenew,
      retailTransfer: body.retailTransfer,
      retailRestore: body.retailRestore,
      retailRegisterByYear: body.retailRegisterByYear ?? undefined,
      retailRenewByYear: body.retailRenewByYear ?? undefined,
      promoRegister: body.promoRegister,
      minMarginPercent: body.minMarginPercent,
      premiumMarkupPercent: body.premiumMarkupPercent,
      enabled: body.enabled,
    },
  });

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
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  if (url.searchParams.get("action") !== "refresh-supplier") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  try {
    const result = await refreshSupplierTldPricesFromProvider(admin.id);
    return NextResponse.json({
      ok: true,
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
