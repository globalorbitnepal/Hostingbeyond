import Link from "next/link";

import { TipsSearch } from "@/components/tips/tips-search";
import { TIPS_BASE } from "@/lib/blog/paths";

export function TipsHero({
  initialQuery = "",
  category,
  compact = false,
}: {
  initialQuery?: string;
  category?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-violet-100/80 bg-gradient-to-br from-[#f8f5ff] via-white to-[#eef6ff] px-5 py-8 sm:px-8 sm:py-10 ${
        compact ? "py-6 sm:py-7" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-[#673de6]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#c4b5fd_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.35]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center lg:text-left">
        <p className="text-[11px] font-bold tracking-[0.24em] text-[#673de6] uppercase">
          HostingBeyond Learning Hub
        </p>
        <h1
          className={`mt-2 font-extrabold tracking-tight text-[#1a1035] ${
            compact
              ? "text-2xl sm:text-3xl"
              : "text-[clamp(1.75rem,4vw,2.75rem)]"
          }`}
        >
          {compact && initialQuery
            ? "Search results"
            : "Tips, Guides & How-To Resources"}
        </h1>
        {!compact ? (
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Practical guides to help you build, manage, secure and grow your
            website with confidence.
          </p>
        ) : null}
        <div className="mt-6 flex justify-center lg:justify-start">
          <TipsSearch initialQuery={initialQuery} category={category} />
        </div>
        {!compact && !initialQuery ? (
          <div className="mt-5 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href={`${TIPS_BASE}#latest-guides`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#673de6] px-6 text-sm font-semibold text-white shadow-md hover:bg-[#5b32d6]"
            >
              Explore Guides
            </Link>
            <Link
              href={`${TIPS_BASE}#categories`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-violet-200 bg-white px-6 text-sm font-semibold text-[#673de6] hover:bg-violet-50"
            >
              Browse Categories
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
