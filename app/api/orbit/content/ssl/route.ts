import { NextRequest, NextResponse } from "next/server";

import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getSslPageContent,
  saveSslPageContent,
} from "@/lib/orbit/content";
import type { CmsSslPageContent } from "@/lib/orbit/ssl-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getSslPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { content?: CmsSslPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const content = await saveSslPageContent(body.content);
  return NextResponse.json({ ok: true, content });
}
