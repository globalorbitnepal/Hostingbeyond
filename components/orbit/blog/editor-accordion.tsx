"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function EditorAccordion({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <ChevronDown
          className={cn(
            "size-4 text-slate-400 transition",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-slate-100 px-4 py-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}
