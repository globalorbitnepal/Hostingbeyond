import type { BlogContentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { promoteScheduledPosts } from "./queries";

export async function adjacentPublishedPosts(
  publishedAt: Date | null,
  currentId: string,
  contentType: BlogContentType = "BLOG",
) {
  await promoteScheduledPosts();
  if (!publishedAt) return { prev: null, next: null };

  const base = {
    status: "PUBLISHED" as const,
    contentType,
    noIndex: false,
  };

  const [prev, next] = await Promise.all([
    prisma.blogPost.findFirst({
      where: {
        ...base,
        publishedAt: { lt: publishedAt },
        id: { not: currentId },
      },
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true },
    }),
    prisma.blogPost.findFirst({
      where: {
        ...base,
        publishedAt: { gt: publishedAt },
        id: { not: currentId },
      },
      orderBy: { publishedAt: "asc" },
      select: { title: true, slug: true },
    }),
  ]);

  return { prev, next };
}
