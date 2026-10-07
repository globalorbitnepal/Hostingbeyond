import { NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const authors = await prisma.blogAuthor.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ authors });
}

export async function POST(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    name?: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    role?: string;
    websiteUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
  } | null;
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const data = {
    name: body.name.trim(),
    displayName: body.displayName?.trim() || null,
    bio: body.bio ?? "",
    avatarUrl: body.avatarUrl ?? null,
    role: body.role ?? null,
    websiteUrl: body.websiteUrl ?? null,
    twitterUrl: body.twitterUrl ?? null,
    linkedinUrl: body.linkedinUrl ?? null,
  };
  const author = body.id
    ? await prisma.blogAuthor.update({ where: { id: body.id }, data })
    : await prisma.blogAuthor.create({ data });
  return NextResponse.json({ author });
}

export async function DELETE(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.blogAuthor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
