import { NextResponse } from "next/server";

import { refreshSupplierTldPricesFromProvider } from "@/lib/domains/domain-service";
import {
  ensureDomainTldPricesSeeded,
  listRetailTldPrices,
} from "@/lib/domains/pricing-engine";
import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDomainTldPricesSeeded();
  const rows = await listRetailTldPrices();
  return NextResponse.json({ rows });
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
    promoRegister?: number | null;
    minMarginPercent?: number;
    premiumMarkupPercent?: number | null;
    enabled?: boolean;
  };

  const tld = body.tld?.trim();
  if (!tld) {
    return NextResponse.json({ error: "TLD required" }, { status: 400 });
  }

  const key = tld.startsWith(".") ? tld : `.${tld}`;
  const row = await prisma.domainTldPrice.update({
    where: { tld: key },
    data: {
      retailRegister: body.retailRegister,
      retailRenew: body.retailRenew,
      retailTransfer: body.retailTransfer,
      retailRestore: body.retailRestore,
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
      details: { tld: key },
    },
  });

  return NextResponse.json({ row });
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
    const updated = await refreshSupplierTldPricesFromProvider();
    return NextResponse.json({ ok: true, updated });
  } catch {
    return NextResponse.json(
      { error: "Could not refresh supplier prices. Check API settings." },
      { status: 502 },
    );
  }
}
