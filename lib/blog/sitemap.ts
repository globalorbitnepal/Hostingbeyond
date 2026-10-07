import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";

import {
  BLOG_BASE,
  TIPS_BASE,
  blogCategoryPath,
  blogPostPath,
  tipsPostPath,
} from "./paths";

export async function blogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const [posts, categories] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", noIndex: false, contentType: "BLOG" },
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

export async function tipsSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", noIndex: false, contentType: "TIP" },
      select: { slug: true, updatedAt: true },
    });

    const hub = {
      url: new URL(TIPS_BASE, siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.88,
    };

    return [
      hub,
      ...posts.map((post) => ({
        url: new URL(tipsPostPath(post.slug), siteConfig.url).toString(),
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.78,
      })),
    ];
  } catch {
    return [];
  }
}
