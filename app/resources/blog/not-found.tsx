import Link from "next/link";

import { BlogSearch } from "@/components/blog/blog-search";
import { BlogSiteShell } from "@/components/blog/blog-shell";
import { BLOG_BASE } from "@/lib/blog/paths";

export default function BlogNotFound() {
  return (
    <BlogSiteShell>
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold text-[#1a1035]">Article not found</h1>
        <p className="mt-3 text-slate-600">
          Search the HostingBeyond blog or explore categories.
        </p>
        <div className="mt-6 text-left">
          <BlogSearch />
        </div>
        <Link
          href={BLOG_BASE}
          className="mt-6 inline-block text-sm font-semibold text-[#673de6]"
        >
          Back to blog
        </Link>
      </div>
    </BlogSiteShell>
  );
}
