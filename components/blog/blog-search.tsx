"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BLOG_BASE } from "@/lib/blog/paths";

export function BlogSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) {
      router.push(BLOG_BASE);
      return;
    }
    router.push(`${BLOG_BASE}?search=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={submit} className="relative max-w-xl">
      <label className="sr-only" htmlFor="blog-search">
        Search articles
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
      <input
        id="blog-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles"
        className="h-11 w-full rounded-full border border-slate-200 bg-white pr-10 pl-10 text-sm text-slate-800 ring-[#673de6]/30 outline-none focus:ring-2"
      />
      {q ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
          onClick={() => {
            setQ("");
            router.push(BLOG_BASE);
          }}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </form>
  );
}
