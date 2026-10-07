import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogCategoryNav } from "@/components/blog/category-nav";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { BlogPostCard } from "@/components/blog/post-card";
import {
  listPublishedCategories,
  listPublishedPosts,
} from "@/lib/blog/queries";
import { categoryMetadata } from "@/lib/blog/seo";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.blogCategory.findUnique({ where: { slug } });
  if (!category) return { title: "Category" };
  return categoryMetadata(category);
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: Params & { searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const page = Number((await searchParams).page) || 1;
  const category = await prisma.blogCategory.findUnique({ where: { slug } });
  if (!category) notFound();

  const [categories, listing] = await Promise.all([
    listPublishedCategories(),
    listPublishedPosts({ page, categorySlug: slug }),
  ]);

  return (
    <BlogSiteShell>
      <div className="mx-auto max-w-[1240px] space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-[#1a1035]">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-3 max-w-2xl text-slate-600">
              {category.description}
            </p>
          ) : null}
        </header>
        <BlogCategoryNav
          categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
          activeSlug={slug}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listing.posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </BlogSiteShell>
  );
}
