import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getDomainTransferPageContent,
  saveDomainTransferPageContent,
} from "@/lib/orbit/content";
import type { CmsDomainTransferPageContent } from "@/lib/orbit/domain-transfer-page-content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const content = await getDomainTransferPageContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as {
    content?: CmsDomainTransferPageContent;
  };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveDomainTransferPageContent(body.content);
  const content = await getDomainTransferPageContent();
  return NextResponse.json({ ok: true, content });
}
