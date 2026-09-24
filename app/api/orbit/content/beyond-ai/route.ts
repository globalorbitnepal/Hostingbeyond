import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getBeyondAiPageContent,
  saveBeyondAiPageContent,
} from "@/lib/orbit/content";
import { logActivity } from "@/lib/orbit/session";
import type { CmsBeyondAiPageContent } from "@/lib/orbit/beyond-ai-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getBeyondAiPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { content?: CmsBeyondAiPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveBeyondAiPageContent(body.content);
  const content = await getBeyondAiPageContent();
  await logActivity({
    adminUserId: admin.id,
    action: "CONTENT_UPDATE",
    resource: "beyond-ai-product",
    details: "Updated Beyond AI product page content",
  });

  return NextResponse.json({ ok: true, content });
}
