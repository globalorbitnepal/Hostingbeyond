import { NextRequest, NextResponse } from "next/server";

import { usdToLocalRate, type CurrencyCode } from "@/config/pricing";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import type { CmsSiteSettings } from "@/lib/orbit/defaults";
import { getSiteSettings, saveSiteSettings } from "@/lib/orbit/content";
import { fetchMarketDisplayRates } from "@/lib/pricing/market-rates";
import { logActivity } from "@/lib/orbit/session";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const settings = await getSiteSettings();
  return NextResponse.json({
    defaults: usdToLocalRate,
    overrides: settings.displayCurrencyRates ?? {},
  });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as {
    overrides?: Partial<Record<CurrencyCode, number>>;
  };
  if (!body.overrides || typeof body.overrides !== "object") {
    return NextResponse.json({ error: "Missing overrides" }, { status: 400 });
  }

  const settings = await getSiteSettings();
  const normalized: Partial<Record<CurrencyCode, number>> = {};
  for (const [key, value] of Object.entries(body.overrides)) {
    const code = key as CurrencyCode;
    if (!(code in usdToLocalRate)) continue;
    if (value == null) continue;
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) continue;
    normalized[code] = n;
  }

  const saved = await saveSiteSettings({
    ...settings,
    displayCurrencyRates: normalized,
  } satisfies CmsSiteSettings);

  await logActivity({
    adminUserId: admin.id,
    action: "SETTINGS_UPDATE",
    resource: "currency-rates",
  });

  return NextResponse.json({
    ok: true,
    overrides: saved.displayCurrencyRates ?? {},
  });
}

export async function POST(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
  };
  if (body.action !== "refresh-market") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const market = await fetchMarketDisplayRates();
  const settings = await getSiteSettings();
  const saved = await saveSiteSettings({
    ...settings,
    displayCurrencyRates: market,
  });

  await logActivity({
    adminUserId: admin.id,
    action: "SETTINGS_UPDATE",
    resource: "currency-rates-market",
  });

  return NextResponse.json({
    ok: true,
    overrides: saved.displayCurrencyRates ?? {},
    refreshedAt: new Date().toISOString(),
  });
}
