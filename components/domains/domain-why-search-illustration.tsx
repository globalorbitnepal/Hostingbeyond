"use client";

import Link from "next/link";
import { Globe2, Search } from "lucide-react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const EXAMPLE_EXTENSIONS = [
  { tld: ".com", note: "Example only" },
  { tld: ".io", note: "Example only" },
  { tld: ".shop", note: "Example only" },
  { tld: ".online", note: "Example only" },
];

/** Demonstrative browser UI — not a live availability check. */
export function DomainWhySearchIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-gradient-to-br from-[#f8f7ff] via-white to-[#eef2ff] shadow-[0_20px_50px_-32px_rgba(47,28,106,0.35)]",
        className,
      )}
      aria-hidden={false}
    >
      <div className="flex items-center gap-2 border-b border-slate-200/80 bg-slate-50/90 px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[10px] font-semibold text-slate-400">
          Illustration
        </span>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 rounded-xl border border-[#e0e7ff] bg-white px-3 py-2.5 shadow-sm">
          <Globe2 className="size-5 shrink-0 text-[#673de6]" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#2f1c6a]">
            yourbrand
          </span>
          <Link
            href={routes.domainSearch}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2563eb] to-[#673de6] px-3 text-[11px] font-bold text-white transition hover:brightness-105"
          >
            <Search className="size-3.5" aria-hidden />
            Search
          </Link>
        </div>
        <p className="mt-2 text-[10px] font-medium text-slate-500">
          Sample extensions — use search for live availability and pricing.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {EXAMPLE_EXTENSIONS.map((item) => (
            <li
              key={item.tld}
              className="rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"
            >
              <p className="text-[13px] font-extrabold text-[#2f1c6a]">
                yourbrand{item.tld}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                {item.note}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
