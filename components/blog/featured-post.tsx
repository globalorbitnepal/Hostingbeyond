import Image from "next/image";
import Link from "next/link";

import type { BlogPostCard } from "@/lib/blog/queries";
import { blogPostPath } from "@/lib/blog/paths";
import { formatBlogDate } from "@/lib/blog/format";

export function FeaturedBlogPost({ post }: { post: BlogPostCard }) {
  const authorName =
    post.author?.displayName || post.author?.name || "HostingBeyond";
  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-4 shadow-[0_16px_48px_rgba(79,70,229,0.1)] sm:p-6 lg:p-8">
      <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#673de6] uppercase">
        Featured
      </p>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
        <Link
          href={blogPostPath(post.slug)}
          className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-violet-50"
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
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-white">
              HostingBeyond Blog
            </div>
          )}
        </Link>
        <div className="space-y-4">
          {post.category ? (
            <p className="text-sm font-semibold text-[#673de6]">
              {post.category.name}
            </p>
          ) : null}
          <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-[#1a1035] sm:text-3xl lg:text-4xl">
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
            {authorName} · {formatBlogDate(post.publishedAt)} ·{" "}
            {post.readingTimeMinutes} min read
          </p>
          <Link
            href={blogPostPath(post.slug)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.28)]"
          >
            Read article
          </Link>
        </div>
      </div>
    </section>
  );
}
