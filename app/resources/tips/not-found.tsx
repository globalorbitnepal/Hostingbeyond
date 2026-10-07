import Link from "next/link";

import { BlogSiteShell } from "@/components/blog/blog-shell";
import { TIPS_BASE } from "@/lib/blog/paths";

export default function TipsNotFound() {
  return (
    <BlogSiteShell>
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold text-[#1a1035]">Guide not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This guide may have moved or is not published yet.
        </p>
        <Link
          href={TIPS_BASE}
          className="mt-6 inline-block text-sm font-semibold text-[#673de6]"
        >
          Back to Tips &amp; Guides
        </Link>
      </div>
    </BlogSiteShell>
  );
}
