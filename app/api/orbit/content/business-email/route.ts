import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getBusinessEmailPageContent,
  saveBusinessEmailPageContent,
} from "@/lib/orbit/content";
import type { CmsBusinessEmailPageContent } from "@/lib/orbit/business-email-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getBusinessEmailPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as {
    content?: CmsBusinessEmailPageContent;
  };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveBusinessEmailPageContent(body.content);
  const content = await getBusinessEmailPageContent();
  return NextResponse.json({ ok: true, content });
}
