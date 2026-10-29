import { NextResponse } from "next/server";

import { rateLimitResponse } from "@/lib/http/fixed-window-rate-limit";
import { rateLimitCloudTranslate } from "@/lib/http/public-endpoint-rate-limit";
import { inspectGoogleCloudTranslateSetup } from "@/lib/integrations/translation/config";
import {
  cloudTranslateRequestSchema,
  totalTranslateChars,
  TRANSLATE_MAX_CHARS_TOTAL,
} from "@/lib/integrations/translation/request";
import { prepareCloudTranslations } from "@/lib/integrations/translation/service";
import { isTranslationTargetAllowed } from "@/lib/i18n/website-languages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HONEST_NOTE =
  "Machine-translated marketing copy. Prices, domains, product ids, and checkout stay in the source form. Some phrases may remain English.";

const CLIENT_ERROR_STATUS: Record<string, number> = {
  translation_not_configured: 503,
  translation_quota: 429,
  translation_auth_failed: 502,
  translation_permission_denied: 502,
  translation_failed: 502,
  translation_length_mismatch: 502,
};

export async function GET() {
  const setup = inspectGoogleCloudTranslateSetup();
  return NextResponse.json({
    configured: true,
    credentialsFilePresent: setup.credentialsFilePresent,
    cloudConfigured: setup.adapterEnabled,
    liveTranslationVerified: false,
    note: HONEST_NOTE,
  });
}

export async function POST(request: Request) {
  if (!rateLimitCloudTranslate(request)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = cloudTranslateRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_translate_request" },
      { status: 400 },
    );
  }

  if (totalTranslateChars(parsed.data.texts) > TRANSLATE_MAX_CHARS_TOTAL) {
    return NextResponse.json(
      { error: "translate_payload_too_large" },
      { status: 413 },
    );
  }

  const { getSiteSettings } = await import("@/lib/orbit/content");
  const settings = await getSiteSettings();
  if (
    !isTranslationTargetAllowed(
      parsed.data.targetLanguage,
      settings.websiteLanguageEnabledCodes,
    )
  ) {
    return NextResponse.json({ error: "language_disabled" }, { status: 400 });
  }

  const result = await prepareCloudTranslations(
    parsed.data.texts,
    parsed.data.targetLanguage,
  );
  if (!result.ok) {
    const status = CLIENT_ERROR_STATUS[result.code] ?? 502;
    return NextResponse.json({ error: result.code }, { status });
  }

  return NextResponse.json({
    items: result.items,
    note: HONEST_NOTE,
    liveTranslationVerified: false,
  });
}
