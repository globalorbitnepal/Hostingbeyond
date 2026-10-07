import { NextResponse } from "next/server";

import {
  autosaveBlogPost,
  upsertBlogPost,
  type BlogPostWriteInput,
} from "@/lib/blog/queries";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { logActivity } from "@/lib/orbit/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
    },
  });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const { id } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as
    (BlogPostWriteInput & { autosave?: boolean }) | null;
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const post = body.autosave
    ? await autosaveBlogPost(id, body)
    : await upsertBlogPost(id, body, existing.slug);
  await logActivity({
    adminUserId: admin.id,
    action: "BLOG_UPDATE",
    resource: "blog_post",
    details: `${post.id} update`,
  });
  return NextResponse.json({ post });
}

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  await logActivity({
    adminUserId: admin.id,
    action: "BLOG_UPDATE",
    resource: "blog_post",
    details: `${id} delete`,
  });
  return NextResponse.json({ ok: true });
}
