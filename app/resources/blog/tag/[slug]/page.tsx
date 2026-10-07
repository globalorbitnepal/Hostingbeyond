import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogSiteShell } from "@/components/blog/blog-shell";
import { BlogPostCard } from "@/components/blog/post-card";
import { listPublishedPosts } from "@/lib/blog/queries";
import { tagMetadata } from "@/lib/blog/seo";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.blogTag.findUnique({ where: { slug } });
  if (!tag) return { title: "Tag" };
  return tagMetadata(tag);
}

export default async function BlogTagPage({
  params,
  searchParams,
}: Params & { searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const page = Number((await searchParams).page) || 1;
  const tag = await prisma.blogTag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const listing = await listPublishedPosts({ page, tagSlug: slug });

  return (
    <BlogSiteShell>
      <div className="mx-auto max-w-[1240px] space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-[#1a1035]">
            #{tag.name}
          </h1>
          {tag.description ? (
            <p className="mt-3 text-slate-600">{tag.description}</p>
          ) : null}
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listing.posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </BlogSiteShell>
  );
}
