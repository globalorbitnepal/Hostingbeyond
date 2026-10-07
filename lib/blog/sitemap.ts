import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";

import { BLOG_BASE, blogCategoryPath, blogPostPath } from "./paths";

export async function blogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const [posts, categories] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", noIndex: false },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogCategory.findMany({
        where: { noIndex: false },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const base = {
      url: new URL(BLOG_BASE, siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.85,
    };

    return [
      base,
      ...posts.map((post) => ({
        url: new URL(blogPostPath(post.slug), siteConfig.url).toString(),
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
      ...categories.map((cat) => ({
        url: new URL(blogCategoryPath(cat.slug), siteConfig.url).toString(),
        lastModified: cat.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      })),
    ];
  } catch {
    return [];
  }
}
