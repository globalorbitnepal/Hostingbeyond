import { randomBytes } from "crypto";

import type {
  BlogContentType,
  BlogGuideType,
  BlogPostStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { estimateReadingTimeMinutes } from "./reading-time";
import { sanitizeBlogHtml } from "./sanitize";
import { slugifyTitle } from "./slug";

const POSTS_PER_PAGE = 12;

const postInclude = {
  author: true,
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.BlogPostInclude;

export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  readingTimeMinutes: number;
  viewCount: number;
  contentType: BlogContentType;
  guideType: BlogGuideType | null;
  category: { name: string; slug: string } | null;
  author: { name: string; displayName: string | null } | null;
};

function toCard(
  post: Prisma.BlogPostGetPayload<{ include: typeof postInclude }>,
): BlogPostCard {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    featuredImageUrl: post.featuredImageUrl,
    featuredImageAlt: post.featuredImageAlt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingTimeMinutes: post.readingTimeMinutes,
    viewCount: post.viewCount,
    contentType: post.contentType,
    guideType: post.guideType,
    category: post.category
      ? { name: post.category.name, slug: post.category.slug }
      : null,
    author: post.author
      ? {
          name: post.author.name,
          displayName: post.author.displayName,
        }
      : null,
  };
}

export async function promoteScheduledPosts() {
  const now = new Date();
  await prisma.blogPost.updateMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    data: {
      status: "PUBLISHED",
      publishedAt: now,
    },
  });
}

function publishedWhere(
  contentType?: BlogContentType,
): Prisma.BlogPostWhereInput {
  return {
    status: "PUBLISHED",
    noIndex: false,
    ...(contentType ? { contentType } : {}),
    OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
  };
}

export async function listPublishedCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getFeaturedPost(): Promise<BlogPostCard | null> {
  const { post } = await getBlogHomeFeatured();
  return post;
}

export async function getBlogHomeFeatured(): Promise<{
  post: BlogPostCard | null;
  isMarkedFeatured: boolean;
}> {
  await promoteScheduledPosts();
  const marked = await prisma.blogPost.findFirst({
    where: { ...publishedWhere("BLOG"), featured: true },
    orderBy: { publishedAt: "desc" },
    include: postInclude,
  });
  if (marked) {
    return { post: toCard(marked), isMarkedFeatured: true };
  }
  const latest = await prisma.blogPost.findFirst({
    where: publishedWhere("BLOG"),
    orderBy: { publishedAt: "desc" },
    include: postInclude,
  });
  return {
    post: latest ? toCard(latest) : null,
    isMarkedFeatured: false,
  };
}

export async function getTipsHomeFeatured(): Promise<BlogPostCard | null> {
  await promoteScheduledPosts();
  const marked = await prisma.blogPost.findFirst({
    where: { ...publishedWhere("TIP"), featured: true },
    orderBy: { publishedAt: "desc" },
    include: postInclude,
  });
  return marked ? toCard(marked) : null;
}

export async function listPublishedPosts(options: {
  page?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  excludeId?: string;
  contentType?: BlogContentType;
  guideTypes?: BlogGuideType[];
  orderBy?: "published" | "views";
}) {
  await promoteScheduledPosts();
  const page = Math.max(1, options.page ?? 1);
  const skip = (page - 1) * POSTS_PER_PAGE;

  const contentType = options.contentType ?? "BLOG";
  const where: Prisma.BlogPostWhereInput = {
    ...publishedWhere(contentType),
  };

  if (options.guideTypes?.length) {
    where.guideType = { in: options.guideTypes };
  }

  if (options.excludeId) {
    where.id = { not: options.excludeId };
  }

  if (options.categorySlug) {
    where.category = { slug: options.categorySlug };
  }

  if (options.tagSlug) {
    where.tags = { some: { tag: { slug: options.tagSlug } } };
  }

  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { contentHtml: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
      {
        tags: {
          some: { tag: { name: { contains: q, mode: "insensitive" } } },
        },
      },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy:
        options.orderBy === "views"
          ? [{ viewCount: "desc" }, { publishedAt: "desc" }]
          : { publishedAt: "desc" },
      skip,
      take: POSTS_PER_PAGE,
      include: postInclude,
    }),
  ]);

  return {
    posts: rows.map(toCard),
    page,
    pageSize: POSTS_PER_PAGE,
    total,
    pageCount: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
  };
}

export async function getPublishedPostBySlug(
  slug: string,
  contentType: BlogContentType = "BLOG",
) {
  await promoteScheduledPosts();
  return prisma.blogPost.findFirst({
    where: { slug, ...publishedWhere(contentType) },
    include: postInclude,
  });
}

export async function getPublishedTipBySlug(slug: string) {
  return getPublishedPostBySlug(slug, "TIP");
}

export async function getSlugRedirect(fromSlug: string) {
  return prisma.blogPostSlugRedirect.findUnique({
    where: { fromSlug },
    include: { post: { select: { slug: true, status: true } } },
  });
}

export async function getPostByPreviewToken(token: string) {
  return prisma.blogPost.findFirst({
    where: { previewToken: token },
    include: postInclude,
  });
}

export async function incrementPostViews(id: string) {
  await prisma.blogPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function relatedPosts(post: {
  id: string;
  categoryId: string | null;
  tagIds: string[];
  contentType?: BlogContentType;
}) {
  await promoteScheduledPosts();
  const contentType = post.contentType ?? "BLOG";
  const or: Prisma.BlogPostWhereInput[] = [];
  if (post.categoryId) or.push({ categoryId: post.categoryId });
  if (post.tagIds.length > 0) {
    or.push({ tags: { some: { tagId: { in: post.tagIds } } } });
  }

  const rows =
    or.length > 0
      ? await prisma.blogPost.findMany({
          where: {
            ...publishedWhere(contentType),
            id: { not: post.id },
            OR: or,
          },
          orderBy: { publishedAt: "desc" },
          take: 4,
          include: postInclude,
        })
      : [];

  if (rows.length >= 3) return rows.map(toCard);

  const fill = await prisma.blogPost.findMany({
    where: {
      ...publishedWhere(contentType),
      id: { notIn: [post.id, ...rows.map((r) => r.id)] },
    },
    orderBy: { publishedAt: "desc" },
    take: 4 - rows.length,
    include: postInclude,
  });

  return [...rows, ...fill].map(toCard);
}

export async function ensureUniqueSlug(base: string, excludeId?: string) {
  const slug = slugifyTitle(base) || "post";
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    n += 1;
  }
}

export function newPreviewToken() {
  return randomBytes(24).toString("hex");
}

export async function listTipCategoriesWithPublishedPosts() {
  await promoteScheduledPosts();
  const rows = await prisma.blogCategory.findMany({
    where: {
      posts: {
        some: publishedWhere("TIP"),
      },
    },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          posts: {
            where: publishedWhere("TIP"),
          },
        },
      },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: c._count.posts,
  }));
}

export async function countPublishedTips() {
  await promoteScheduledPosts();
  return prisma.blogPost.count({ where: publishedWhere("TIP") });
}

export type BlogPostWriteInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  contentHtml?: string;
  status?: BlogPostStatus;
  contentType?: BlogContentType;
  guideType?: BlogGuideType | null;
  featured?: boolean;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  authorId?: string | null;
  categoryId?: string | null;
  tagIds?: string[];
  scheduledAt?: string | null;
  readingTimeOverride?: number | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  seoKeywords?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImageUrl?: string | null;
  schemaType?: string;
};

export async function autosaveBlogPost(
  id: string,
  input: Partial<BlogPostWriteInput>,
) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw new Error("Post not found");

  const title = (input.title ?? existing.title).trim();
  const slugBase = input.slug?.trim() || title;
  const slug =
    slugBase === existing.slug
      ? existing.slug
      : await ensureUniqueSlug(slugBase, id);

  const contentHtml = sanitizeBlogHtml(
    input.contentHtml ?? existing.contentHtml,
  );
  const readingTimeMinutes = estimateReadingTimeMinutes(
    contentHtml,
    input.readingTimeOverride ?? existing.readingTimeOverride,
  );

  return prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: (input.excerpt ?? existing.excerpt).trim(),
      contentHtml,
      readingTimeMinutes,
      seoTitle: input.seoTitle ?? existing.seoTitle,
      seoDescription: input.seoDescription ?? existing.seoDescription,
      focusKeyword: input.focusKeyword ?? existing.focusKeyword,
      featuredImageUrl: input.featuredImageUrl ?? existing.featuredImageUrl,
      featuredImageAlt: input.featuredImageAlt ?? existing.featuredImageAlt,
      categoryId: input.categoryId ?? existing.categoryId,
      authorId: input.authorId ?? existing.authorId,
    },
    include: postInclude,
  });
}

export async function upsertBlogPost(
  id: string | null,
  input: BlogPostWriteInput,
  previousSlug?: string,
) {
  const contentHtml = sanitizeBlogHtml(input.contentHtml ?? "");
  const readingTimeMinutes = estimateReadingTimeMinutes(
    contentHtml,
    input.readingTimeOverride,
  );
  const slugBase = input.slug?.trim() || input.title;
  const slug = await ensureUniqueSlug(slugBase, id ?? undefined);

  const tagIds = input.tagIds ?? [];
  const status = input.status ?? "DRAFT";
  const now = new Date();
  let resolvedContentType: BlogContentType = input.contentType ?? "BLOG";
  if (id) {
    const peek = await prisma.blogPost.findUnique({
      where: { id },
      select: { contentType: true },
    });
    if (peek && !input.contentType) resolvedContentType = peek.contentType;
  }

  let publishedAt: Date | null = null;
  let scheduledAt: Date | null = null;
  if (status === "PUBLISHED") {
    publishedAt = now;
  } else if (status === "SCHEDULED" && input.scheduledAt) {
    scheduledAt = new Date(input.scheduledAt);
    publishedAt = null;
  } else if (status === "DRAFT" || status === "ARCHIVED") {
    publishedAt = null;
    scheduledAt = null;
  }

  const data: Prisma.BlogPostUncheckedCreateInput = {
    title: input.title.trim(),
    slug,
    excerpt: (input.excerpt ?? "").trim(),
    contentHtml,
    status,
    contentType: resolvedContentType,
    ...(input.guideType !== undefined ? { guideType: input.guideType } : {}),
    featured: Boolean(input.featured),
    featuredImageUrl: input.featuredImageUrl ?? null,
    featuredImageAlt: input.featuredImageAlt ?? null,
    authorId: input.authorId ?? null,
    categoryId: input.categoryId ?? null,
    readingTimeMinutes,
    readingTimeOverride: input.readingTimeOverride ?? null,
    canonicalUrl: input.canonicalUrl ?? null,
    noIndex: Boolean(input.noIndex),
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    focusKeyword: input.focusKeyword ?? null,
    seoKeywords: input.seoKeywords ?? [],
    ogTitle: input.ogTitle ?? null,
    ogDescription: input.ogDescription ?? null,
    ogImageUrl: input.ogImageUrl ?? null,
    twitterTitle: input.twitterTitle ?? null,
    twitterDescription: input.twitterDescription ?? null,
    twitterImageUrl: input.twitterImageUrl ?? null,
    schemaType: input.schemaType ?? "BlogPosting",
    publishedAt,
    scheduledAt,
  };

  const contentTypeForFeatured = resolvedContentType;
  if (input.featured) {
    await prisma.blogPost.updateMany({
      where: {
        featured: true,
        contentType: contentTypeForFeatured,
        ...(id ? { id: { not: id } } : {}),
      },
      data: { featured: false },
    });
  }

  let post;
  if (id) {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new Error("Post not found");
    if (existing.slug !== slug && previousSlug) {
      await prisma.blogPostSlugRedirect.upsert({
        where: { fromSlug: previousSlug },
        create: { postId: id, fromSlug: previousSlug },
        update: { postId: id },
      });
    }
    if (status === "PUBLISHED" && existing.publishedAt) {
      data.publishedAt = existing.publishedAt;
    }
    if (!existing.previewToken) {
      data.previewToken = newPreviewToken();
    }
    post = await prisma.blogPost.update({
      where: { id },
      data,
      include: postInclude,
    });
    await prisma.blogPostTag.deleteMany({ where: { postId: id } });
  } else {
    post = await prisma.blogPost.create({
      data: { ...data, previewToken: newPreviewToken() },
      include: postInclude,
    });
  }

  if (tagIds.length) {
    await prisma.blogPostTag.createMany({
      data: tagIds.map((tagId) => ({ postId: post.id, tagId })),
      skipDuplicates: true,
    });
  }

  return prisma.blogPost.findUniqueOrThrow({
    where: { id: post.id },
    include: postInclude,
  });
}

export async function seedBlogTaxonomyIfEmpty() {
  const count = await prisma.blogCategory.count();
  if (count > 0) return;

  const categories = [
    ["Hosting", "hosting"],
    ["Domains", "domains"],
    ["WordPress", "wordpress"],
    ["Website", "website"],
    ["Business Email", "business-email"],
    ["Security", "security"],
    ["VPS", "vps"],
    ["Cloud", "cloud"],
    ["AI", "ai"],
    ["Performance", "performance"],
    ["How-To Guides", "how-to-guides"],
    ["Business", "business"],
    ["Technology", "technology"],
  ] as const;

  await prisma.blogCategory.createMany({
    data: categories.map(([name, slug]) => ({
      name,
      slug,
      description: `${name} articles from HostingBeyond.`,
    })),
  });
}

export { POSTS_PER_PAGE };
