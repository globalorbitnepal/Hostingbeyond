import { prisma } from "@/lib/prisma";

import { promoteScheduledPosts } from "./queries";

export async function adjacentPublishedPosts(
  publishedAt: Date | null,
  currentId: string,
) {
  await promoteScheduledPosts();
  if (!publishedAt) return { prev: null, next: null };

  const [prev, next] = await Promise.all([
    prisma.blogPost.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { lt: publishedAt },
        id: { not: currentId },
      },
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true },
    }),
    prisma.blogPost.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { gt: publishedAt },
        id: { not: currentId },
      },
      orderBy: { publishedAt: "asc" },
      select: { title: true, slug: true },
    }),
  ]);

  return { prev, next };
}
