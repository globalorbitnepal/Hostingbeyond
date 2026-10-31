import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getGrowthHubPageContent,
  saveGrowthHubPageContent,
} from "@/lib/orbit/content";
import type { CmsGrowthHubPageContent } from "@/lib/orbit/growth-hub-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getGrowthHubPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { content?: CmsGrowthHubPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const content = await saveGrowthHubPageContent(body.content);
  return NextResponse.json({ ok: true, content });
}
