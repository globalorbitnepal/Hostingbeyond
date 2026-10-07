import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getAboutPageContent,
  saveAboutPageContent,
} from "@/lib/orbit/content";
import type { CmsAboutPageContent } from "@/lib/orbit/about-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getAboutPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { content?: CmsAboutPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveAboutPageContent(body.content);
  const content = await getAboutPageContent();
  return NextResponse.json({ ok: true, content });
}
