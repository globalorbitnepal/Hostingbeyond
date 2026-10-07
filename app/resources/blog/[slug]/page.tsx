import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Script from "next/script";

import { ArticleView } from "@/components/blog/article-view";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { adjacentPublishedPosts } from "@/lib/blog/adjacent";
import { blogPostPath } from "@/lib/blog/paths";
import {
  getPublishedPostBySlug,
  getSlugRedirect,
  incrementPostViews,
  relatedPosts,
} from "@/lib/blog/queries";
import { articleJsonLd, breadcrumbJsonLd, postMetadata } from "@/lib/blog/seo";
import { extractTocFromHtml, injectHeadingIds } from "@/lib/blog/toc";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return postMetadata(post);
}

export default async function BlogArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    const redirect = await getSlugRedirect(slug);
    if (redirect?.post.status === "PUBLISHED") {
      permanentRedirect(blogPostPath(redirect.post.slug));
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
    }),
    adjacentPublishedPosts(post.publishedAt, post.id),
  ]);

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/resources/blog" },
    ...(post.category
      ? [
          {
            name: post.category.name,
            path: `/resources/blog/category/${post.category.slug}`,
          },
        ]
      : []),
    { name: post.title, path: blogPostPath(post.slug) },
  ]);

  const jsonLd = articleJsonLd({
    ...post,
    authorName: post.author?.displayName || post.author?.name,
  });

  return (
    <BlogSiteShell>
      <Script
        id="blog-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="blog-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ArticleView
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
    </BlogSiteShell>
  );
}
