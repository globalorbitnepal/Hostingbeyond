"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { tipsHubPath } from "@/lib/blog/paths";

export function TipsSearch({
  initialQuery = "",
  category,
  variant = "default",
}: {
  initialQuery?: string;
  category?: string;
  variant?: "default" | "hero";
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(
      tipsHubPath({
        search: trimmed || undefined,
        category: trimmed ? undefined : category,
      }),
    );
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-2xl">
      <label className="sr-only" htmlFor="tips-search">
        Search tips and guides
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        id="tips-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search tips, guides and tutorials…"
        className={
          variant === "hero"
            ? "h-12 w-full rounded-xl border-0 bg-white pr-12 pl-11 text-sm text-slate-800 shadow-none ring-2 ring-transparent outline-none focus:ring-[#673de6]/40"
            : "h-12 w-full rounded-2xl border border-violet-100/90 bg-white pr-12 pl-11 text-sm text-slate-800 shadow-sm ring-[#673de6]/25 outline-none focus:ring-2"
        }
      />
      {q || initialQuery ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:bg-violet-50"
          onClick={() => {
            setQ("");
            router.push(tipsHubPath({ category }));
          }}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </form>
  );
}
