import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import type { BlogPostCard } from "@/lib/blog/queries";
import { blogPostPath, tipsPostPath } from "@/lib/blog/paths";
import { formatBlogDate } from "@/lib/blog/format";
import { guideTypeBadge } from "@/lib/blog/guide-type";
import { PostCoverFallback } from "@/components/blog/post-cover-fallback";

export function BlogPostCard({
  post,
  variant = "blog",
}: {
  post: BlogPostCard;
  variant?: "blog" | "tips";
}) {
  const authorName =
    post.author?.displayName || post.author?.name || "HostingBeyond";
  const href =
    variant === "tips" ? tipsPostPath(post.slug) : blogPostPath(post.slug);
  const cta = variant === "tips" ? "Read guide" : "Read article";
  const badge = guideTypeBadge(post.guideType);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-[0_8px_32px_rgba(79,70,229,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_18px_48px_rgba(79,70,229,0.16)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link
        href={href}
        tabIndex={-1}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        {post.featuredImageUrl ? (
          <Image
            src={post.featuredImageUrl}
            alt={post.featuredImageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <PostCoverFallback
            category={post.category?.name ?? null}
            title={post.title}
          />
        )}
        {badge ? (
          <span className="absolute top-3 left-3 rounded-md bg-[#1a1035]/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur">
            {badge}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase">
          {post.category ? (
            <span className="text-[#673de6]">{post.category.name}</span>
          ) : null}
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Clock className="size-3" />
            {post.readingTimeMinutes} min
          </span>
        </div>

        <h2 className="text-[1.0625rem] leading-snug font-bold text-[#1a1035]">
          <Link href={href} className="hover:text-[#673de6]">
            {post.title}
          </Link>
        </h2>

        {post.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
            {post.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="min-w-0 truncate text-xs text-slate-500">
            {authorName} · {formatBlogDate(post.publishedAt)}
          </p>
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#673de6] hover:underline"
          >
            {cta}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
