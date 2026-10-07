"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { tipsHubPath } from "@/lib/blog/paths";
import { cn } from "@/lib/utils";

export function TipsCategoryNav({
  categories,
  search,
}: {
  categories: { name: string; slug: string; count: number }[];
  search?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = search ? "" : (params.get("category") ?? "");

  if (pathname !== "/resources/tips") return null;

  const items = [
    { name: "All", slug: "", count: 0 },
    ...categories.filter((c) => c.count > 0),
  ];

  return (
    <nav
      id="categories"
      aria-label="Tip categories"
      className="-mx-1 flex [scrollbar-width:thin] gap-2 overflow-x-auto px-1 pb-1"
    >
      <div className="mx-auto flex min-w-max gap-2">
        {items.map((cat) => {
          const isActive = cat.slug === active;
          const href = tipsHubPath({
            category: cat.slug || undefined,
            search: search || undefined,
          });
          return (
            <Link
              key={cat.slug || "all"}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-[#673de6] text-white shadow-sm"
                  : "border border-violet-100 bg-white text-slate-700 hover:border-violet-200 hover:text-[#673de6]",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
