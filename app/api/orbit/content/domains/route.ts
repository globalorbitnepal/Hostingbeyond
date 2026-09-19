import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { getDomainContent, saveDomainContent } from "@/lib/orbit/content";
import { logActivity } from "@/lib/orbit/session";
import type { DomainContent } from "@/lib/domains/content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  return NextResponse.json({ content: await getDomainContent() });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json().catch(() => null)) as {
    content?: DomainContent;
  } | null;

  if (!body?.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveDomainContent(body.content);
  const content = await getDomainContent();

  await logActivity({
    adminUserId: admin.id,
    action: "CONTENT_UPDATE",
    resource: "domain-search",
    details: "Updated domain search pages",
  });

  return NextResponse.json({ ok: true, content });
}
