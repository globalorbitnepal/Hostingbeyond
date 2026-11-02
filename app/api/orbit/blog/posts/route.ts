import { NextRequest, NextResponse } from "next/server";
import { BlogContentType, BlogPostStatus } from "@prisma/client";

import { upsertBlogPost, type BlogPostWriteInput } from "@/lib/blog/queries";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { logActivity } from "@/lib/orbit/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Optional enum query param: absent means "no filter", unknown means 400 so a
 * typo cannot silently return an unfiltered list.
 */
function parseOptionalEnum<T extends string>(
  raw: string | null,
  allowed: readonly T[],
): { ok: true; value: T | undefined } | { ok: false } {
  const value = raw?.trim() ?? "";
  if (!value) return { ok: true, value: undefined };
  return (allowed as readonly string[]).includes(value)
    ? { ok: true, value: value as T }
    : { ok: false };
}

export async function GET(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const status = parseOptionalEnum(
    request.nextUrl.searchParams.get("status"),
    Object.values(BlogPostStatus),
  );
  const contentType = parseOptionalEnum(
    request.nextUrl.searchParams.get("contentType"),
    Object.values(BlogContentType),
  );
  if (!status.ok) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  if (!contentType.ok) {
    return NextResponse.json(
      { error: "Invalid contentType." },
      { status: 400 },
    );
  }
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const categoryId = request.nextUrl.searchParams.get("categoryId")?.trim();

  const posts = await prisma.blogPost.findMany({
    where: {
      ...(status.value ? { status: status.value } : {}),
      ...(contentType.value ? { contentType: contentType.value } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
    },
    take: 200,
  });

  const stats = await prisma.blogPost.groupBy({
    by: ["status"],
    _count: true,
  });

  return NextResponse.json({ posts, stats });
}

export async function POST(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json().catch(() => null)) as
    (BlogPostWriteInput & { duplicateFromId?: string }) | null;
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  let input = body;
  if (body.duplicateFromId) {
    const source = await prisma.blogPost.findUnique({
      where: { id: body.duplicateFromId },
      include: { tags: true },
    });
    if (!source) {
      return NextResponse.json(
        { error: "Source post not found." },
        { status: 404 },
      );
    }
    input = {
      ...body,
      title: `${source.title} (copy)`,
      contentHtml: source.contentHtml,
      excerpt: source.excerpt,
      categoryId: source.categoryId,
      tagIds: source.tags.map((t) => t.tagId),
      status: "DRAFT",
      featured: false,
      contentType: source.contentType,
      guideType: source.guideType,
    };
  }

  const post = await upsertBlogPost(null, input);
  await logActivity({
    adminUserId: admin.id,
    action: "BLOG_UPDATE",
    resource: "blog_post",
    details: `${post.id} create`,
  });

  return NextResponse.json({ post });
}
