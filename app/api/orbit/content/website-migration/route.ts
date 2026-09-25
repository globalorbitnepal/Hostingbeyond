import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getWebsiteMigrationPageContent,
  saveWebsiteMigrationPageContent,
} from "@/lib/orbit/content";
import type { CmsWebsiteMigrationPageContent } from "@/lib/orbit/website-migration-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getWebsiteMigrationPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as {
    content?: CmsWebsiteMigrationPageContent;
  };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveWebsiteMigrationPageContent(body.content);
  const content = await getWebsiteMigrationPageContent();
  return NextResponse.json({ ok: true, content });
}
