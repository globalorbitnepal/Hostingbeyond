import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { BlogPostCard } from "@/lib/blog/queries";
import { guideTypeBadge } from "@/lib/blog/guide-type";
import { formatBlogDate } from "@/lib/blog/format";
import { tipsPostPath } from "@/lib/blog/paths";

export function TipsFeaturedGuide({ post }: { post: BlogPostCard }) {
  const authorName =
    post.author?.displayName || post.author?.name || "HostingBeyond";
  const badge = guideTypeBadge(post.guideType);
  const href = tipsPostPath(post.slug);

  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-4 shadow-[0_12px_40px_rgba(79,70,229,0.08)] sm:p-6 lg:p-8">
      <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#673de6] uppercase">
        Featured Guide
      </p>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
        <Link
          href={href}
          className="relative block aspect-video overflow-hidden rounded-2xl bg-violet-50"
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
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#7c3aed]/90 to-[#2563eb]/90 text-sm font-semibold text-white">
              HostingBeyond Guide
            </div>
          )}
        </Link>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {post.category ? (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#673de6]">
                {post.category.name}
              </span>
            ) : null}
            {badge ? (
              <span className="rounded-md bg-[#1a1035] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                {badge}
              </span>
            ) : null}
          </div>
          <h2 className="text-2xl leading-tight font-extrabold text-[#1a1035] sm:text-3xl">
            <Link href={href} className="hover:text-[#673de6]">
              {post.title}
            </Link>
          </h2>
          {post.excerpt ? (
            <p className="text-base leading-relaxed text-slate-600">
              {post.excerpt}
            </p>
          ) : null}
          <p className="text-sm text-slate-500">
            {authorName} · Updated {formatBlogDate(post.updatedAt)} ·{" "}
            {post.readingTimeMinutes} min read
          </p>
          <Link
            href={href}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#673de6] px-6 text-sm font-semibold text-white shadow-md hover:bg-[#5b32d6]"
          >
            Read Guide
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
