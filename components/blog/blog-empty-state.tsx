import Link from "next/link";
import { BookOpen, Compass } from "lucide-react";

import { BLOG_BASE } from "@/lib/blog/paths";

export function BlogEmptyState({ search }: { search?: string }) {
  if (search) {
    return (
      <div className="mt-8 rounded-2xl border border-violet-100 bg-white p-8 text-center">
        <h3 className="text-lg font-bold text-[#1a1035]">No results found</h3>
        <p className="mt-2 text-sm text-slate-600">
          Try another keyword or browse categories above.
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
    <div className="rounded-3xl border border-dashed border-violet-200 bg-white/80 p-10 text-center">
      <Compass className="mx-auto size-8 text-violet-300" />
      <h3 className="mt-3 text-lg font-bold text-[#1a1035]">
        The first articles are being written
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
        Detailed hosting, domain and WordPress guides are on the way. In the
        meantime, the tips library already has step-by-step walkthroughs.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/resources/tips"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <BookOpen className="size-4" /> Browse tips &amp; guides
        </Link>
        <Link
          href="/web-hosting"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
        >
          Explore hosting plans
        </Link>
      </div>
    </div>
  );
}
