import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getSiteSettings,
  saveSiteSettings,
} from "@/lib/orbit/content";
import type { CmsSiteSettings } from "@/lib/orbit/defaults";
import { logActivity } from "@/lib/orbit/session";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  await ensureHomeSeeded();
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { settings?: CmsSiteSettings };
  if (!body.settings) {
    return NextResponse.json({ error: "Missing settings" }, { status: 400 });
  }

  const settings = await saveSiteSettings(body.settings);
  await logActivity({
    adminUserId: admin.id,
    action: "SETTINGS_UPDATE",
    resource: "site-settings",
  });

  return NextResponse.json({ ok: true, settings });
}
