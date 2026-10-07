import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Script from "next/script";

import { ArticleView } from "@/components/blog/article-view";
import { BlogNewsletter } from "@/components/blog/blog-newsletter";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { adjacentPublishedPosts } from "@/lib/blog/adjacent";
import {
  getPublishedTipBySlug,
  getSlugRedirect,
  incrementPostViews,
  relatedPosts,
} from "@/lib/blog/queries";
import { TIPS_BASE, tipsPostPath } from "@/lib/blog/paths";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  tipPostMetadata,
} from "@/lib/blog/seo";
import { extractTocFromHtml, injectHeadingIds } from "@/lib/blog/toc";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedTipBySlug(slug);
  if (!post) return { title: "Guide not found" };
  return tipPostMetadata(post);
}

export default async function TipGuidePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPublishedTipBySlug(slug);

  if (!post) {
    const redirect = await getSlugRedirect(slug);
    if (redirect?.post.status === "PUBLISHED") {
      const target = await getPublishedTipBySlug(redirect.post.slug);
      if (target?.contentType === "TIP") {
        permanentRedirect(tipsPostPath(redirect.post.slug));
      }
    }
    notFound();
  }

  void incrementPostViews(post.id);

  const toc = extractTocFromHtml(post.contentHtml);
  const contentHtml = injectHeadingIds(post.contentHtml, toc);

  const tagIds = post.tags.map((t) => t.tagId);
  const [related, adjacent] = await Promise.all([
    relatedPosts({
      id: post.id,
      categoryId: post.categoryId,
      tagIds,
      contentType: "TIP",
    }),
    adjacentPublishedPosts(post.publishedAt, post.id, "TIP"),
  ]);

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Tips", path: TIPS_BASE },
    ...(post.category
      ? [
          {
            name: post.category.name,
            path: `${TIPS_BASE}?category=${post.category.slug}`,
          },
        ]
      : []),
    { name: post.title, path: tipsPostPath(post.slug) },
  ]);

  const jsonLd = articleJsonLd(
    {
      ...post,
      authorName: post.author?.displayName || post.author?.name,
      schemaType: post.schemaType || "Article",
    },
    tipsPostPath(post.slug),
  );

  return (
    <BlogSiteShell>
      <Script
        id="tip-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="tip-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ArticleView
        hub="tips"
        guideType={post.guideType}
        post={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          featuredImageUrl: post.featuredImageUrl,
          featuredImageAlt: post.featuredImageAlt,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          readingTimeMinutes: post.readingTimeMinutes,
          category: post.category
            ? { name: post.category.name, slug: post.category.slug }
            : null,
          author: post.author,
        }}
        contentHtml={contentHtml}
        toc={toc}
        related={related}
        prev={adjacent.prev}
        next={adjacent.next}
      />
      <div className="mx-auto mt-12 max-w-[1240px] px-4">
        <BlogNewsletter />
      </div>
    </BlogSiteShell>
  );
}
