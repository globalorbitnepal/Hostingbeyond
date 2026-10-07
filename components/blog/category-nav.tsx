import Link from "next/link";

import { BLOG_BASE, blogCategoryPath } from "@/lib/blog/paths";
import { cn } from "@/lib/utils";

export function BlogCategoryNav({
  categories,
  activeSlug,
}: {
  categories: { name: string; slug: string }[];
  activeSlug?: string | null;
}) {
  return (
    <nav
      aria-label="Blog categories"
      className="-mx-1 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
    >
      <Link
        href={BLOG_BASE}
        className={cn(
          "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
          !activeSlug
            ? "border-[#673de6] bg-[#673de6] text-white"
            : "border-slate-200 bg-white text-slate-700 hover:border-violet-200",
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={blogCategoryPath(cat.slug)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
            activeSlug === cat.slug
              ? "border-[#673de6] bg-[#673de6] text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-violet-200",
          )}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
