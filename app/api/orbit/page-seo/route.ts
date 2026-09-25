import { NextResponse } from "next/server";

import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import {
  PUBLIC_PAGE_SEO_REGISTRY,
  mergeStoredPageSeo,
  type StoredPageSeo,
} from "@/lib/orbit/page-seo";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const rows = await prisma.pageContent.findMany({
    select: { slug: true, seo: true },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row.seo]));

  const pages = PUBLIC_PAGE_SEO_REGISTRY.map((entry) => ({
    ...entry,
    seo: mergeStoredPageSeo(bySlug.get(entry.slug)),
  }));

  return NextResponse.json({ pages });
}

export async function PUT(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json()) as {
    slug?: string;
    seo?: StoredPageSeo;
  };
  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const entry = PUBLIC_PAGE_SEO_REGISTRY.find((item) => item.slug === slug);
  if (!entry) {
    return NextResponse.json({ error: "Unknown page slug" }, { status: 400 });
  }

  const seo = mergeStoredPageSeo(body.seo);
  const existing = await prisma.pageContent.findUnique({ where: { slug } });

  if (existing) {
    await prisma.pageContent.update({
      where: { slug },
      data: { seo },
    });
  } else {
    await prisma.pageContent.create({
      data: {
        slug,
        title: entry.label,
        isPublished: true,
        isVisible: true,
        sections: {},
        seo,
      },
    });
  }

  revalidatePath(entry.path);
  return NextResponse.json({ ok: true, seo });
}
