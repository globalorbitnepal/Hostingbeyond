import { NextRequest, NextResponse } from "next/server";

import {
  getDeveloperHostingContent,
  saveDeveloperHostingContent,
} from "@/lib/orbit/content";
import { DEVELOPER_STACK_KEYS } from "@/lib/orbit/developer-hosting-content";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { logActivity } from "@/lib/orbit/session";
import type { DeveloperStackKey } from "@/lib/orbit/developer-hosting-content";

export const runtime = "nodejs";

function parseStack(value: string | null): DeveloperStackKey | null {
  if (!value) return null;
  return (DEVELOPER_STACK_KEYS as string[]).includes(value)
    ? (value as DeveloperStackKey)
    : null;
}

export async function GET(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const stack = parseStack(request.nextUrl.searchParams.get("stack"));
  if (!stack) {
    return NextResponse.json({ error: "Unknown stack" }, { status: 400 });
  }

  const content = await getDeveloperHostingContent(stack);
  return NextResponse.json({ stack, content });
}

export async function PUT(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json().catch(() => null)) as {
    stack?: string;
    content?: Record<string, unknown>;
  } | null;

  const stack = parseStack(body?.stack ?? null);
  if (!stack || !body?.content) {
    return NextResponse.json(
      { error: "A valid stack and content are required." },
      { status: 400 },
    );
  }

  try {
    const content = await saveDeveloperHostingContent(stack, body.content);
    await logActivity({
      adminUserId: admin.id,
      action: "CONTENT_UPDATE",
      resource: `developer-hosting:${stack}`,
      details: `Updated ${stack} page content`,
    });
    return NextResponse.json({ ok: true, stack, content });
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 502 });
  }
}
