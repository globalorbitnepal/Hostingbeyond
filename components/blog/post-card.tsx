import Image from "next/image";
import Link from "next/link";

import type { BlogPostCard } from "@/lib/blog/queries";
import { blogPostPath, tipsPostPath } from "@/lib/blog/paths";
import { formatBlogDate } from "@/lib/blog/format";

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
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-[0_8px_32px_rgba(79,70,229,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-violet-200/90 hover:shadow-[0_14px_44px_rgba(79,70,229,0.14)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link
        href={href}
        className="relative block aspect-[16/10] overflow-hidden bg-violet-50"
      >
        {post.featuredImageUrl ? (
          <Image
            src={post.featuredImageUrl}
            alt={post.featuredImageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-50 text-sm font-semibold text-violet-700">
            HostingBeyond
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.category ? (
          <p className="text-xs font-bold tracking-wide text-[#673de6] uppercase">
            {post.category.name}
          </p>
        ) : null}
        <h2 className="text-lg leading-snug font-bold text-[#1a1035]">
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
          {authorName} · {formatBlogDate(post.publishedAt)} ·{" "}
          {post.readingTimeMinutes} min read
        </p>
        <Link
          href={href}
          className="inline-flex w-fit items-center text-sm font-semibold text-[#673de6] hover:underline"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
