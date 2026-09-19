"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export type DomainFaq = { question: string; answer: string };

export function DomainFaqList({ items }: { items: DomainFaq[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <ul className="grid gap-2.5 lg:grid-cols-2">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <li
            key={item.question}
            className={cn(
              "rounded-[22px] border bg-white transition",
              open ? "border-[#c7b8ff]" : "border-slate-200",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              aria-expanded={open}
              className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left sm:px-5"
            >
              <span className="text-[14.5px] leading-snug font-extrabold tracking-tight text-[#2f1c6a]">
                {item.question}
              </span>
              <span
                className={cn(
                  "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full transition",
                  open
                    ? "bg-[#673de6] text-white"
                    : "bg-[#f3f1ff] text-[#673de6]",
                )}
              >
                {open ? (
                  <Minus className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
              </span>
            </button>
            {open ? (
              <p className="px-4 pb-4 text-[13.5px] leading-relaxed text-slate-600 sm:px-5">
                {item.answer}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
