import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getTipsHubPageContent,
  saveTipsHubPageContent,
} from "@/lib/orbit/content";
import type { CmsTipsHubPageContent } from "@/lib/orbit/tips-hub-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getTipsHubPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { content?: CmsTipsHubPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveTipsHubPageContent(body.content);
  const content = await getTipsHubPageContent();
  return NextResponse.json({ ok: true, content });
}
