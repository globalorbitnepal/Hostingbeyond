import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getPricingPageContent,
  savePricingPageContent,
} from "@/lib/orbit/content";
import { logActivity } from "@/lib/orbit/session";
import type { CmsPricingPageContent } from "@/lib/orbit/pricing-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getPricingPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { content?: CmsPricingPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await savePricingPageContent(body.content);
  const content = await getPricingPageContent();
  await logActivity({
    adminUserId: admin.id,
    action: "CONTENT_UPDATE",
    resource: "pricing",
    details: "Updated pricing page content",
  });

  return NextResponse.json({ ok: true, content });
}
