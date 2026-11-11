import { NextResponse } from "next/server";

import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  getEditorialPageContent,
  saveEditorialPageContent,
} from "@/lib/orbit/content";
import {
  isEditorialSlug,
  type CmsEditorialPageContent,
} from "@/lib/orbit/editorial-page-content";

export const runtime = "nodejs";

function slugFrom(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  return isEditorialSlug(slug) ? slug : null;
}

export async function GET(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  const slug = slugFrom(request);
  if (!slug)
    return NextResponse.json({ error: "Unknown page." }, { status: 400 });
  const content = await getEditorialPageContent(slug);
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  const slug = slugFrom(request);
  if (!slug)
    return NextResponse.json({ error: "Unknown page." }, { status: 400 });
  const body = (await request.json()) as { content?: CmsEditorialPageContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content." }, { status: 400 });
  }
  const content = await saveEditorialPageContent(slug, body.content);
  return NextResponse.json({ content });
}
