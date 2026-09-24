"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is Beyond AI?",
    a: "Beyond AI is HostingBeyond’s AI workspace to generate websites, content, and code, then publish on included hosting with one account.",
  },
  {
    q: "How does AI credit work?",
    a: "Each plan includes a dollar balance for AI usage. Pay $20 on Pro and you get $20 of model usage per billing period. Estimates appear before you generate.",
  },
  {
    q: "Which AI models can I use?",
    a: "You can use leading models such as ChatGPT-class, Gemini, Claude, and Grok from one balance, plus more models over time — without switching platforms.",
  },
  {
    q: "Is hosting really included?",
    a: "Yes. Every plan includes Free Deploy on HostingBeyond with SSL. Limits depend on your plan tier.",
  },
  {
    q: "What happens when my credit runs out?",
    a: "You can enable on-demand usage. We show the estimated cost and ask you to confirm before any extra charge — never silent billing.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. Upgrade or downgrade from your account when billing integration is active; credits reset according to your new plan terms.",
  },
  {
    q: "Is the Free plan really $0?",
    a: "Yes. The former $10 entry tier is now free with starter AI credit so you can try the full builder and deploy flow.",
  },
  {
    q: "Do I need a separate hosting plan?",
    a: "No separate hosting product is required for sites you publish through Beyond AI on an active plan.",
  },
];

export function BeyondAiFaqs() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="hb-band-cream border-t border-[#e9e4ff]/80 py-16 sm:py-20">
      <div className="hb-shell mx-auto max-w-3xl">
        <h2 className="font-heading text-center text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
          Beyond AI{" "}
          <span className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">
            FAQs
          </span>
        </h2>
        <p className="mt-3 text-center text-[15px] text-[#64748b]">
          Quick answers about credits, models, hosting, and on-demand usage.
        </p>
        <ul className="mt-8 space-y-2">
          {faqs.map((item, index) => {
            const expanded = open === index;
            return (
              <li
                key={item.q}
                className="overflow-hidden rounded-2xl border border-[#e9e4ff] bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  <span className="text-[14px] font-extrabold text-[#1e1b4b]">
                    {item.q}
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
                  <div className="border-t border-[#eef2ff] px-4 pt-1 pb-4 text-[13px] leading-relaxed text-[#475569]">
                    {item.a}
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
