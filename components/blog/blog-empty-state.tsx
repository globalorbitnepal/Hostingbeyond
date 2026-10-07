import Link from "next/link";

import { BLOG_BASE } from "@/lib/blog/paths";

export function BlogEmptyState({ search }: { search?: string }) {
  if (search) {
    return (
      <div className="mt-8 rounded-2xl border border-violet-100 bg-white p-8 text-center">
        <h3 className="text-lg font-bold text-[#1a1035]">No results found</h3>
        <p className="mt-2 text-sm text-slate-600">
          Try another keyword or browse categories below.
        </p>
        <Link
          href={BLOG_BASE}
          className="mt-4 inline-block text-sm font-semibold text-[#673de6]"
        >
          View all articles
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-dashed border-violet-200 bg-white/80 p-10 text-center">
      <h3 className="text-lg font-bold text-[#1a1035]">
        Fresh guides coming soon
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        We are preparing hosting, domain, and WordPress tutorials for you.
      </p>
    </div>
  );
}
