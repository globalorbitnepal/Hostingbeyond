import Link from "next/link";

import { routes } from "@/config/routes";
import { tipsHubPath } from "@/lib/blog/paths";

export function TipsEmptyState({
  search,
  hasAnyTips,
}: {
  search?: string;
  hasAnyTips: boolean;
}) {
  if (search) {
    return (
      <div className="rounded-2xl border border-violet-100 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-[#1a1035]">
          No guides found for &ldquo;{search}&rdquo;
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Try another keyword or browse categories below.
        </p>
        <Link
          href={tipsHubPath()}
          className="mt-4 inline-block text-sm font-semibold text-[#673de6]"
        >
          Clear search
        </Link>
      </div>
    );
  }

  if (!hasAnyTips) {
    return (
      <div className="rounded-3xl border border-dashed border-violet-200 bg-white/90 p-10 text-center">
        <h2 className="text-xl font-bold text-[#1a1035]">
          Tips &amp; Guides are coming soon
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
          We&apos;re preparing practical guides to help you build, manage and
          grow your online presence.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={routes.hosting}
            className="rounded-full bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Explore Hosting
          </Link>
          <Link
            href={routes.domains}
            className="rounded-full border border-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#673de6]"
          >
            Explore Domains
          </Link>
          <Link
            href={routes.businessEmail}
            className="rounded-full border border-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#673de6]"
          >
            Business Email
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
