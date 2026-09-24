"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import type { CmsBeyondAiPageContent } from "@/lib/orbit/beyond-ai-page-content";
import { cn } from "@/lib/utils";

export function BeyondAiFaqs({ content }: { content: CmsBeyondAiPageContent }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = content.faqs.filter((f) => f.visible);

  return (
    <section className="hb-band-cream border-t border-[#e9e4ff]/80 py-14 sm:py-16">
      <div className="hb-shell mx-auto max-w-3xl px-1">
        <h2 className="font-heading text-center text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
          {content.faqTitle}{" "}
          <span className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">
            {content.faqTitleAccent}
          </span>
        </h2>
        <p className="mt-3 text-center text-[15px] text-[#64748b]">
          {content.faqDescription}
        </p>
        <ul className="mt-8 space-y-2">
          {items.map((item, index) => {
            const expanded = open === index;
            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#e9e4ff] bg-white shadow-sm"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left sm:px-5"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  <span className="text-[14px] font-extrabold text-[#1e1b4b]">
                    {item.question}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                      expanded
                        ? "bg-[#673de6] text-white"
                        : "bg-[#f4f0ff] text-[#673de6]",
                    )}
                  >
                    {expanded ? (
                      <Minus className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </span>
                </button>
                {expanded ? (
                  <div className="border-t border-[#eef2ff] px-4 pt-1 pb-4 text-[13px] leading-relaxed text-[#475569] sm:px-5">
                    {item.answer}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
