import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { BlogPostCard } from "@/lib/blog/queries";
import { guideTypeBadge } from "@/lib/blog/guide-type";
import { formatBlogDate } from "@/lib/blog/format";
import { tipsPostPath } from "@/lib/blog/paths";

export function TipsGuideCard({ post }: { post: BlogPostCard }) {
  const badge = guideTypeBadge(post.guideType);
  const href = tipsPostPath(post.slug);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-[0_6px_28px_rgba(79,70,229,0.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(79,70,229,0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link
        href={href}
        className="relative block aspect-video overflow-hidden bg-violet-50"
      >
        {post.featuredImageUrl ? (
          <Image
            src={post.featuredImageUrl}
            alt={post.featuredImageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 text-xs font-bold tracking-wide text-violet-700 uppercase">
            Guide
          </div>
        )}
        {badge ? (
          <span className="absolute top-3 left-3 rounded-md bg-[#1a1035]/85 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
            {badge}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.category ? (
          <p className="text-[11px] font-bold tracking-wide text-[#673de6] uppercase">
            {post.category.name}
          </p>
        ) : null}
        <h2 className="line-clamp-2 text-lg leading-snug font-bold text-[#1a1035]">
          <Link href={href} className="hover:text-[#673de6]">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
            {post.excerpt}
          </p>
        ) : null}
        <p className="mt-auto text-xs text-slate-500">
          Updated {formatBlogDate(post.updatedAt)} · {post.readingTimeMinutes}{" "}
          min read
        </p>
        <Link
          href={href}
          className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-[#673de6] hover:underline"
        >
          Read guide
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
