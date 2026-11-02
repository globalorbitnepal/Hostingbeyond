import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";

import type { BlogPostCard } from "@/lib/blog/queries";
import { blogPostPath } from "@/lib/blog/paths";
import { formatBlogDate } from "@/lib/blog/format";
import { guideTypeBadge } from "@/lib/blog/guide-type";

export function FeaturedBlogPost({
  post,
  showFeaturedLabel = true,
}: {
  post: BlogPostCard;
  showFeaturedLabel?: boolean;
}) {
  const authorName =
    post.author?.displayName || post.author?.name || "HostingBeyond";
  const badge = guideTypeBadge(post.guideType);

  return (
    <section className="overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_24px_70px_-36px_rgba(79,70,229,0.4)]">
      <div className="grid lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
        <Link
          href={blogPostPath(post.slug)}
          tabIndex={-1}
          className="relative block min-h-[240px] overflow-hidden bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-50 lg:min-h-[360px]"
        >
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-violet-500/80">
              <span className="text-3xl font-extrabold tracking-tight">
                Hosting<span className="text-violet-400">Beyond</span>
              </span>
              <span className="text-[11px] font-semibold tracking-[0.26em] uppercase">
                {post.category?.name ?? "Editorial"}
              </span>
            </div>
          )}
        </Link>

        <div className="flex flex-col justify-center gap-4 px-6 py-8 sm:px-9 lg:py-10">
          {showFeaturedLabel ? (
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-amber-700 uppercase">
              <Sparkles className="size-3" />
              Editor&apos;s pick
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wide uppercase">
            {post.category ? (
              <span className="text-[#673de6]">{post.category.name}</span>
            ) : null}
            {badge ? (
              <span className="rounded-md bg-[#1a1035] px-2 py-0.5 text-[10px] text-white">
                {badge}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Clock className="size-3" />
              {post.readingTimeMinutes} min read
            </span>
          </div>

          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] font-extrabold tracking-tight text-[#1a1035]">
            <Link
              href={blogPostPath(post.slug)}
              className="hover:text-[#673de6]"
            >
              {post.title}
            </Link>
          </h2>

          {post.excerpt ? (
            <p className="text-base leading-relaxed text-slate-600">
              {post.excerpt}
            </p>
          ) : null}

          <p className="text-sm text-slate-500">
            {authorName} · {formatBlogDate(post.publishedAt)}
          </p>

          <Link
            href={blogPostPath(post.slug)}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(124,58,237,0.32)] transition hover:brightness-105"
          >
            Read the article
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
