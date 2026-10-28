import { NextResponse } from "next/server";

import {
  extrasFromSiteSettings,
  mergeDomainExtras,
} from "@/lib/domains/domain-extras";
import { getSiteSettings, saveSiteSettings } from "@/lib/orbit/content";
import { authorizeDomainPricingAdmin } from "@/lib/orbit/domain-pricing-auth";
import { revalidateDomainRetailSurfaces } from "@/lib/orbit/revalidate-domain-pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await authorizeDomainPricingAdmin();
  if (admin instanceof Response) return admin;
  const extras = extrasFromSiteSettings(await getSiteSettings());
  return NextResponse.json({ extras });
}

export async function PUT(request: Request) {
  const admin = await authorizeDomainPricingAdmin();
  if (admin instanceof Response) return admin;
  const body = (await request.json().catch(() => null)) as {
    extras?: Partial<{
      protectionEnabled: boolean;
      protectionPriceUsd: number;
      protectionLabel: string;
    }>;
  } | null;
  const merged = mergeDomainExtras(body?.extras ?? null);
  const settings = await getSiteSettings();
  const saved = await saveSiteSettings({
    ...settings,
    domainPrivacyFree: true,
    domainProtectionEnabled: merged.protectionEnabled,
    domainProtectionPriceUsd: merged.protectionPriceUsd,
    domainProtectionLabel: merged.protectionLabel,
  });
  revalidateDomainRetailSurfaces();
  return NextResponse.json({ extras: extrasFromSiteSettings(saved) });
}
