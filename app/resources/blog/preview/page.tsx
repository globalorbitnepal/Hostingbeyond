import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleView } from "@/components/blog/article-view";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { getPostByPreviewToken } from "@/lib/blog/queries";
import { extractTocFromHtml, injectHeadingIds } from "@/lib/blog/toc";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default async function BlogPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token?.trim();
  if (!token) notFound();
  const post = await getPostByPreviewToken(token);
  if (!post) notFound();

  const toc = extractTocFromHtml(post.contentHtml);
  const contentHtml = injectHeadingIds(post.contentHtml, toc);

  return (
    <BlogSiteShell>
      <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
        Draft preview — not indexed.
      </p>
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
        related={[]}
        prev={null}
        next={null}
      />
    </BlogSiteShell>
  );
}
