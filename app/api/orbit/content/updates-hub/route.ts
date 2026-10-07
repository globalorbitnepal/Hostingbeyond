import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getUpdatesHubPageContent,
  saveUpdatesHubPageContent,
} from "@/lib/orbit/content";
import type { CmsUpdatesHubPageContent } from "@/lib/orbit/updates-hub-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getUpdatesHubPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { content?: CmsUpdatesHubPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveUpdatesHubPageContent(body.content);
  const content = await getUpdatesHubPageContent();
  return NextResponse.json({ ok: true, content });
}
