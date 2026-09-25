import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getCloudHostingPageContent,
  saveCloudHostingPageContent,
} from "@/lib/orbit/content";
import type { CmsCloudHostingPageContent } from "@/lib/orbit/cloud-hosting-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getCloudHostingPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as {
    content?: CmsCloudHostingPageContent;
  };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveCloudHostingPageContent(body.content);
  const content = await getCloudHostingPageContent();
  return NextResponse.json({ ok: true, content });
}
