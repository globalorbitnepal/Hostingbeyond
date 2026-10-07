"use client";

import { useState } from "react";

import type { TocItem } from "@/lib/blog/toc";
import { cn } from "@/lib/utils";

export function ArticleToc({
  items,
  className,
}: {
  items: TocItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;

  return (
    <nav
      aria-label="On this page"
      className={cn(
        "rounded-2xl border border-violet-100 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left text-sm font-bold text-[#1a1035] lg:cursor-default"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        On this page
        <span className="text-slate-400 lg:hidden">{open ? "−" : "+"}</span>
      </button>
      <ol
        className={cn(
          "mt-3 space-y-2 text-sm",
          open ? "block" : "hidden lg:block",
        )}
      >
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${item.id}`}
              className="text-slate-600 hover:text-[#673de6]"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
