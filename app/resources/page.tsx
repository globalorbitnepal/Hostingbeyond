import type { Metadata } from "next";
import Link from "next/link";

import { BlogSiteShell } from "@/components/blog/blog-shell";
import { buildMetadata } from "@/lib/metadata";
import { BLOG_BASE, TIPS_BASE } from "@/lib/blog/paths";
import { UPDATES_BASE } from "@/lib/updates/paths";

export const metadata: Metadata = buildMetadata({
  title: "Resources",
  description:
    "HostingBeyond blog, tips, product updates and learning resources for hosting, domains and websites.",
  path: "/resources",
});

export default function ResourcesIndexPage() {
  return (
    <BlogSiteShell>
      <div className="mx-auto max-w-3xl space-y-8 py-4">
        <h1 className="text-3xl font-extrabold text-[#1a1035]">Resources</h1>
        <p className="text-slate-600">
          Editorial insights and practical guides from HostingBeyond.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href={UPDATES_BASE}
            className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm hover:border-violet-200"
          >
            <h2 className="text-lg font-bold text-[#1a1035]">Updates</h2>
            <p className="mt-2 text-sm text-slate-600">
              Product release notes and platform news.
            </p>
          </Link>
          <Link
            href={TIPS_BASE}
            className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm hover:border-violet-200"
          >
            <h2 className="text-lg font-bold text-[#1a1035]">
              Tips &amp; Guides
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              How-tos, troubleshooting and learning hub.
            </p>
          </Link>
          <Link
            href={BLOG_BASE}
            className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm hover:border-violet-200"
          >
            <h2 className="text-lg font-bold text-[#1a1035]">Blog</h2>
            <p className="mt-2 text-sm text-slate-600">
              News, insights and company updates.
            </p>
          </Link>
        </div>
      </div>
    </BlogSiteShell>
  );
}
