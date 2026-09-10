import { NextRequest, NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  ensureHomeSeeded,
  getLoginPage,
  saveLoginPage,
} from "@/lib/orbit/content";
import { logActivity } from "@/lib/orbit/session";
import type { CmsLoginPage } from "@/lib/orbit/defaults";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const login = await getLoginPage();

  return NextResponse.json({ login });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as { login?: CmsLoginPage };
  if (!body.login) {
    return NextResponse.json(
      { error: "Missing login content" },
      { status: 400 },
    );
  }

  await saveLoginPage(body.login);
  const login = await getLoginPage();
  await logActivity({
    adminUserId: admin.id,
    action: "CONTENT_UPDATE",
    resource: "login",
    details: "Updated login page content",
  });

  return NextResponse.json({ ok: true, login });
}
