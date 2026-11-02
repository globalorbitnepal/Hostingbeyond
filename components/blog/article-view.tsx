import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Tag } from "lucide-react";

import { BlogPostCard } from "@/components/blog/post-card";
import { ArticleProse } from "@/components/blog/article-prose";
import { ArticleShare } from "@/components/blog/article-share";
import { ArticleToc } from "@/components/blog/article-toc";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { BlogCta } from "@/components/blog/blog-cta";
import type { BlogPostCard as Card } from "@/lib/blog/queries";
import {
  BLOG_BASE,
  TIPS_BASE,
  blogCategoryPath,
  blogPostPath,
  blogTagPath,
  tipsHubPath,
  tipsPostPath,
} from "@/lib/blog/paths";
import { guideTypeBadge, guideTypeLabel } from "@/lib/blog/guide-type";
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
  hub = "blog",
  guideType = null,
  tags = [],
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
  hub?: "blog" | "tips";
  guideType?: import("@prisma/client").BlogGuideType | null;
  tags?: { name: string; slug: string }[];
}) {
  const authorName =
    post.author?.displayName || post.author?.name || "HostingBeyond Editorial";
  const isTips = hub === "tips";
  const hubLabel = isTips ? "Tips & Guides" : "Blog";
  const hubBase = isTips ? TIPS_BASE : BLOG_BASE;
  const postPath = (slug: string) =>
    isTips ? tipsPostPath(slug) : blogPostPath(slug);
  const categoryPath = (slug: string) =>
    isTips ? tipsHubPath({ category: slug }) : blogCategoryPath(slug);
  const typeBadge = guideTypeBadge(guideType);
  const typeLabel = guideTypeLabel(guideType);

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
              <Link href="/resources" className="hover:text-[#673de6]">
                Resources
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={hubBase} className="hover:text-[#673de6]">
                {hubLabel}
              </Link>
            </li>
            {post.category ? (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={categoryPath(post.category.slug)}
                    className="hover:text-[#673de6]"
                  >
                    {post.category.name}
                  </Link>
                </li>
              </>
            ) : null}
            <li aria-hidden>/</li>
            <li className="max-w-[280px] truncate text-slate-700">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {post.category ? (
                <Link
                  href={categoryPath(post.category.slug)}
                  className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#673de6] hover:bg-violet-200/70"
                >
                  {post.category.name}
                </Link>
              ) : null}
              {typeBadge ? (
                <span
                  className="rounded-md bg-[#1a1035] px-2 py-0.5 text-[10px] font-bold text-white uppercase"
                  title={typeLabel ?? undefined}
                >
                  {typeBadge}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-[clamp(1.875rem,4vw,2.85rem)] leading-[1.1] font-extrabold tracking-tight text-[#1a1035]">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-4 text-lg leading-relaxed text-slate-600 sm:text-xl">
                {post.excerpt}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-slate-200/80 py-4 text-sm text-slate-500">
              <div className="flex items-center gap-2.5">
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
                    className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white"
                    aria-hidden
                  >
                    {authorName.slice(0, 1)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {authorName}
                  </p>
                  {post.author?.role ? (
                    <p className="text-xs text-slate-500">{post.author.role}</p>
                  ) : null}
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatBlogDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {post.readingTimeMinutes} min read
              </span>
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

            {tags.length ? (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  <Tag className="size-3.5" /> Tags
                </span>
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={blogTagPath(tag.slug)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-[#673de6]"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <ArticleShare
              title={post.title}
              slug={post.slug}
              className="mt-10"
            />

            {post.author?.bio ? (
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
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {post.author.bio}
                </p>
              </section>
            ) : null}

            {related.length ? (
              <section className="mt-12">
                <h2 className="text-xl font-bold text-[#1a1035]">
                  {isTips ? "You may also like" : "Keep reading"}
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {related.map((item) => (
                    <BlogPostCard
                      key={item.id}
                      post={item}
                      variant={isTips ? "tips" : "blog"}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <BlogCta categorySlug={post.category?.slug} className="mt-12" />

            {(prev || next) && (
              <nav
                aria-label="More articles"
                className="mt-10 grid gap-3 border-t border-slate-200 pt-8 sm:grid-cols-2"
              >
                {prev ? (
                  <Link
                    href={postPath(prev.slug)}
                    className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-violet-200"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                      <ArrowLeft className="size-3.5" /> Previous
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-[#1a1035] group-hover:text-[#673de6]">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={postPath(next.slug)}
                    className="group rounded-xl border border-slate-200 bg-white p-4 text-right hover:border-violet-200"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                      Next <ArrowRight className="size-3.5" />
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-[#1a1035] group-hover:text-[#673de6]">
                      {next.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <ArticleToc items={toc} />
              <ArticleShare title={post.title} slug={post.slug} compact />
              <BlogCta categorySlug={post.category?.slug} compact />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
