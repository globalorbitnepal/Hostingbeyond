import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { getSiteSettings, saveSiteSettings } from "@/lib/orbit/content";
import { inspectGoogleCloudTranslateSetup } from "@/lib/integrations/translation/config";
import { logActivity } from "@/lib/orbit/session";
import {
  WEBSITE_LANGUAGES,
  normalizeEnabledLanguageCodes,
  withEnabledWebsiteLanguages,
  withLanguageEnabledStatus,
} from "@/lib/i18n/website-languages";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const settings = await getSiteSettings();
  const enabledCodes = normalizeEnabledLanguageCodes(
    settings.websiteLanguageEnabledCodes,
  );
  const setup = inspectGoogleCloudTranslateSetup();

  return NextResponse.json({
    languages: withLanguageEnabledStatus(enabledCodes),
    total: WEBSITE_LANGUAGES.length,
    enabledCount: enabledCodes.length,
    defaultLanguage: "en",
    translation: {
      enabledFlag: setup.enabledFlag,
      projectId: setup.projectId,
      credentialsPathConfigured: setup.credentialsPathConfigured,
      credentialsFilePresent: setup.credentialsFilePresent,
      adapterEnabled: setup.adapterEnabled,
      liveTranslationVerified: false,
    },
  });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json().catch(() => null)) as {
    enabledCodes?: unknown;
  } | null;
  if (!body || !Array.isArray(body.enabledCodes)) {
    return NextResponse.json(
      { error: "Missing enabledCodes" },
      { status: 400 },
    );
  }

  const settings = await getSiteSettings();
  const saved = await saveSiteSettings(
    withEnabledWebsiteLanguages(settings, body.enabledCodes),
  );

  await logActivity({
    adminUserId: admin.id,
    action: "SETTINGS_UPDATE",
    resource: "website-languages",
  });

  const next = normalizeEnabledLanguageCodes(saved.websiteLanguageEnabledCodes);
  return NextResponse.json({
    ok: true,
    languages: withLanguageEnabledStatus(next),
    enabledCount: next.length,
  });
}
