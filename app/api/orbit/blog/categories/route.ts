import { NextResponse } from "next/server";

import { slugifyTitle } from "@/lib/blog/slug";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
  } | null;
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const slug = slugifyTitle(body.slug?.trim() || body.name);
  try {
    const category = body.id
      ? await prisma.blogCategory.update({
          where: { id: body.id },
          data: {
            name: body.name.trim(),
            slug,
            description: body.description ?? "",
            imageUrl: body.imageUrl ?? null,
            seoTitle: body.seoTitle ?? null,
            seoDescription: body.seoDescription ?? null,
            canonicalUrl: body.canonicalUrl ?? null,
            noIndex: Boolean(body.noIndex),
          },
        })
      : await prisma.blogCategory.create({
          data: {
            name: body.name.trim(),
            slug,
            description: body.description ?? "",
            imageUrl: body.imageUrl ?? null,
            seoTitle: body.seoTitle ?? null,
            seoDescription: body.seoDescription ?? null,
            canonicalUrl: body.canonicalUrl ?? null,
            noIndex: Boolean(body.noIndex),
          },
        });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json(
      { error: "Category slug already exists." },
      { status: 409 },
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.blogCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
