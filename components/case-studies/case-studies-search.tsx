"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

import { caseStudiesHubPath } from "@/lib/case-studies/paths";

export function CaseStudiesSearch({
  initialQuery = "",
  industry,
}: {
  initialQuery?: string;
  industry?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(
      caseStudiesHubPath({
        search: q.trim() || undefined,
        industry,
      }),
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <label className="sr-only" htmlFor="case-studies-search">
        Search case studies
      </label>
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          id="case-studies-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by client, industry or keyword…"
          className="h-11 w-full rounded-xl border border-violet-100 bg-white pr-3 pl-10 text-sm text-slate-900 shadow-sm outline-none focus:border-[#673de6] focus:ring-2 focus:ring-[#673de6]/20"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#673de6] px-5 text-sm font-bold text-white hover:bg-[#5b2fd4]"
      >
        Search
      </button>
    </form>
  );
}
