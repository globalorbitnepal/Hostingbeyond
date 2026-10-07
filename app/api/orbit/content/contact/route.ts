import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getContactPageContent,
  saveContactPageContent,
} from "@/lib/orbit/content";
import type { CmsContactPageContent } from "@/lib/orbit/contact-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getContactPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { content?: CmsContactPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveContactPageContent(body.content);
  const content = await getContactPageContent();
  return NextResponse.json({ ok: true, content });
}
