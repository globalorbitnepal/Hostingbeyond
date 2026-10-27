import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getHomeSections,
  listPages,
  saveHomeSections,
} from "@/lib/orbit/content";
import { logActivity } from "@/lib/orbit/session";
import type { CmsHomeSections } from "@/lib/orbit/defaults";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const [sections, pages] = await Promise.all([getHomeSections(), listPages()]);

  return NextResponse.json({ sections, pages });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { sections?: CmsHomeSections };
  if (!body.sections) {
    return NextResponse.json({ error: "Missing sections" }, { status: 400 });
  }

  const sections = await saveHomeSections(body.sections);
  await logActivity({
    adminUserId: admin.id,
    action: "CONTENT_UPDATE",
    resource: "home",
    details: "Updated home page sections",
  });

  return NextResponse.json({ ok: true, sections });
}
