import { NextResponse } from "next/server";

import {
  assertBulkApplyAllowed,
  type BulkApplyItem,
} from "@/lib/orbit/bulk-retail-policy";
import {
  buildBulkRetailPreview,
  type TldPriceRowInput,
} from "@/lib/orbit/bulk-retail-preview";
import { authorizeDomainPricingAdmin } from "@/lib/orbit/domain-pricing-auth";
import {
  pickBulkRetailUpdateData,
  toPrismaRetailUpdateData,
  validateBulkRetailItem,
} from "@/lib/orbit/domain-pricing-update";
import {
  assertRetailUpdateAllowed,
  retailPriceFieldsInUpdate,
} from "@/lib/orbit/retail-price-lock";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function toRowInput(
  row: Awaited<ReturnType<typeof prisma.domainTldPrice.findMany>>[0],
): TldPriceRowInput {
  const num = (v: unknown) => {
    if (v == null) return null;
    if (typeof v === "object" && v !== null && "toNumber" in v) {
      return (v as { toNumber: () => number }).toNumber();
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
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
    namesiloRegister: num(row.namesiloRegister),
    namesiloRenew: num(row.namesiloRenew),
    namesiloTransfer: num(row.namesiloTransfer),
    namesiloSyncedAt: row.namesiloSyncedAt,
    namesiloPriceStatus: row.namesiloPriceStatus,
    supplierCurrency: row.supplierCurrency,
    retailCurrency: row.retailCurrency,
  };
}

export async function POST(request: Request) {
  const admin = await authorizeDomainPricingAdmin();
  if (admin instanceof Response) return admin;

  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const body = (await request.json()) as {
    items?: BulkApplyItem[];
    confirm?: boolean;
  };

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }

  for (const item of body.items) {
    const errors = validateBulkRetailItem(item as Record<string, unknown>);
    if (errors.length) {
      return NextResponse.json(
        { error: errors[0]!.message, field: errors[0]!.field },
        { status: 400 },
      );
    }
  }

  const keys = body.items.map((i) =>
    i.tld.startsWith(".") ? i.tld : `.${i.tld}`,
  );
  const dbRows = await prisma.domainTldPrice.findMany({
    where: { tld: { in: keys } },
  });
  const byTld = new Map(dbRows.map((r) => [r.tld, toRowInput(r)]));
  const preview = buildBulkRetailPreview(byTld, body.items);

  if (action === "preview") {
    return NextResponse.json({
      preview,
      summary: {
        total: preview.length,
        willChange: preview.filter((p) => !p.skipped).length,
        skippedLocked: preview.filter(
          (p) => p.skipReason === "retail_price_locked",
        ).length,
        withWarnings: preview.filter((p) => p.warnings.length > 0).length,
      },
    });
  }

  if (action !== "apply") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if (!body.confirm) {
    return NextResponse.json(
      {
        error:
          "Call preview first, then apply with { confirm: true } after review.",
        code: "bulk_retail_confirm_required",
      },
      { status: 400 },
    );
  }

  const freshDbRows = await prisma.domainTldPrice.findMany({
    where: { tld: { in: keys } },
  });
  const freshByTld = new Map(freshDbRows.map((r) => [r.tld, toRowInput(r)]));
  const previewAtApply = buildBulkRetailPreview(freshByTld, body.items);
  const applyGuard = assertBulkApplyAllowed(body.items, previewAtApply);
  if (!applyGuard.ok) {
    const status =
      applyGuard.code === "retail_price_locked"
        ? 403
        : applyGuard.code === "stale_preview" ||
            applyGuard.code === "preview_mismatch"
          ? 409
          : 400;
    return NextResponse.json(
      {
        error: applyGuard.code,
        tld: applyGuard.tld,
        message: applyGuard.message,
      },
      { status },
    );
  }

  const updated: string[] = [];
  for (const item of body.items) {
    const key = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
    const row = freshByTld.get(key);
    if (!row) continue;

    const updateData = pickBulkRetailUpdateData(
      item as Record<string, unknown>,
    );
    if (!retailPriceFieldsInUpdate(updateData)) continue;

    const lock = assertRetailUpdateAllowed(row, updateData);
    if (!lock.ok) {
      return NextResponse.json(
        { error: "retail_price_locked", tld: key },
        { status: 403 },
      );
    }

    const before = await prisma.domainTldPrice.findUnique({
      where: { tld: key },
    });
    if (!before) continue;
    if (before.updatedAt.toISOString() !== item.rowUpdatedAt) {
      return NextResponse.json(
        { error: "stale_preview", tld: key },
        { status: 409 },
      );
    }

    const rowUpdated = await prisma.domainTldPrice.update({
      where: { tld: key },
      data: toPrismaRetailUpdateData(updateData),
    });
    updated.push(key);
    await prisma.domainAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "DOMAIN_PRICING_BULK_RETAIL_APPLY",
        resource: "DomainTldPrice",
        resourceId: rowUpdated.id,
        details: {
          tld: key,
          previewedAt: item.rowUpdatedAt,
          applied: updateData,
        },
      },
    });
  }

  return NextResponse.json({ ok: true, updated });
}
