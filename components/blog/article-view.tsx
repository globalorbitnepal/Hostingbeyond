import Image from "next/image";
import Link from "next/link";

import { BlogPostCard } from "@/components/blog/post-card";
import { ArticleProse } from "@/components/blog/article-prose";
import { ArticleShare } from "@/components/blog/article-share";
import { ArticleToc } from "@/components/blog/article-toc";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { BlogCta } from "@/components/blog/blog-cta";
import type { BlogPostCard as Card } from "@/lib/blog/queries";
import { BLOG_BASE, blogCategoryPath, blogPostPath } from "@/lib/blog/paths";
import { formatBlogDate } from "@/lib/blog/format";
import type { TocItem } from "@/lib/blog/toc";

type Author = {
  name: string;
  displayName: string | null;
  bio: string;
  avatarUrl: string | null;
  role: string | null;
};

export function ArticleView({
  post,
  contentHtml,
  toc,
  related,
  prev,
  next,
}: {
  post: {
    title: string;
    slug: string;
    excerpt: string;
    featuredImageUrl: string | null;
    featuredImageAlt: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
    readingTimeMinutes: number;
    category: { name: string; slug: string } | null;
    author: Author | null;
  };
  contentHtml: string;
  toc: TocItem[];
  related: Card[];
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}) {
  const authorName =
    post.author?.displayName || post.author?.name || "HostingBeyond";

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-[1240px]">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#673de6]">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={BLOG_BASE} className="hover:text-[#673de6]">
                Blog
              </Link>
            </li>
            {post.category ? (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={blogCategoryPath(post.category.slug)}
                    className="hover:text-[#673de6]"
                  >
                    {post.category.name}
                  </Link>
                </li>
              </>
            ) : null}
            <li aria-hidden>/</li>
            <li className="text-slate-700">{post.title}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <article className="min-w-0">
            {post.category ? (
              <Link
                href={blogCategoryPath(post.category.slug)}
                className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#673de6]"
              >
                {post.category.name}
              </Link>
            ) : null}
            <h1 className="mt-4 text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.12] font-extrabold tracking-tight text-[#1a1035]">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-4 text-lg leading-relaxed text-slate-600 sm:text-xl">
                {post.excerpt}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {post.author?.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <span
                  className="flex size-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-[#673de6]"
                  aria-hidden
                >
                  {authorName.slice(0, 1)}
                </span>
              )}
              <p>
                <span className="font-semibold text-slate-700">
                  {authorName}
                </span>
                <span className="mx-2" aria-hidden>
                  ·
                </span>
                Published {formatBlogDate(post.publishedAt)}
                {post.updatedAt
                  ? ` · Updated ${formatBlogDate(post.updatedAt)}`
                  : ""}
                <span className="mx-2" aria-hidden>
                  ·
                </span>
                {post.readingTimeMinutes} min read
              </p>
            </div>

            {post.featuredImageUrl ? (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-violet-50">
                <Image
                  src={post.featuredImageUrl}
                  alt={post.featuredImageAlt || post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 820px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <ArticleToc items={toc} className="mt-8 lg:hidden" />

            <ArticleProse html={contentHtml} className="mt-8 max-w-[820px]" />

            <ArticleShare
              title={post.title}
              slug={post.slug}
              className="mt-10"
            />

            {post.author ? (
              <section className="mt-10 rounded-2xl border border-violet-100 bg-white p-6">
                <h2 className="text-lg font-bold text-[#1a1035]">
                  About the author
                </h2>
                <p className="mt-2 font-semibold text-slate-800">
                  {authorName}
                </p>
                {post.author.role ? (
                  <p className="text-sm text-slate-500">{post.author.role}</p>
                ) : null}
                {post.author.bio ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {post.author.bio}
                  </p>
                ) : null}
              </section>
            ) : null}

            {related.length ? (
              <section className="mt-12">
                <h2 className="text-xl font-bold text-[#1a1035]">
                  Related articles
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {related.map((item) => (
                    <BlogPostCard key={item.id} post={item} />
                  ))}
                </div>
              </section>
            ) : null}

            <BlogCta categorySlug={post.category?.slug} className="mt-12" />

            {(prev || next) && (
              <nav className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:justify-between">
                {prev ? (
                  <Link
                    href={blogPostPath(prev.slug)}
                    className="text-sm font-semibold text-[#673de6]"
                  >
                    ← {prev.title}
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={blogPostPath(next.slug)}
                    className="text-sm font-semibold text-[#673de6] sm:text-right"
                  >
                    {next.title} →
                  </Link>
                ) : null}
              </nav>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <ArticleToc items={toc} />
              <BlogCta categorySlug={post.category?.slug} compact />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
