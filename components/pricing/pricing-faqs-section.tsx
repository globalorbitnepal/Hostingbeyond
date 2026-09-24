"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";

import type {
  CmsPricingCategoryContent,
  CmsPricingPageContent,
  PricingCategoryId,
} from "@/lib/orbit/pricing-content";
import { cn } from "@/lib/utils";

export function PricingFaqsSection({
  content,
  activeCategoryId,
  categories,
}: {
  content: CmsPricingPageContent;
  activeCategoryId: PricingCategoryId;
  categories: CmsPricingCategoryContent[];
}) {
  const [faqCategory, setFaqCategory] =
    useState<PricingCategoryId>(activeCategoryId);

  useEffect(() => {
    setFaqCategory(activeCategoryId);
  }, [activeCategoryId]);
  const preview = Math.max(1, content.faqPreviewCount || 5);
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const category =
    categories.find((c) => c.id === faqCategory) ?? categories[0];
  const items = (category?.faqs ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);
  const visibleItems = expanded ? items : items.slice(0, preview);

  const schema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }),
    [items],
  );

  if (!items.length) return null;

  return (
    <section
      id="pricing-faqs"
      className="hb-band-cream relative scroll-mt-28 overflow-hidden pt-12 pb-16 sm:pb-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,181,253,0.2),transparent_55%)]"
      />
      <div className="hb-shell relative z-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
            {content.faqEyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.75rem,3.4vw,2.85rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
            {content.faqTitle}{" "}
            <span className="bg-gradient-to-r from-[#2563eb] via-[#673de6] to-[#7c3aed] bg-clip-text text-transparent">
              {content.faqTitleAccent}
            </span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            {content.faqDescription}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div
            className="inline-flex max-w-full flex-wrap justify-center gap-2 rounded-[22px] border border-[#e9e4ff] bg-white/90 p-2 shadow-[0_16px_40px_-24px_rgba(47,28,106,0.35)] backdrop-blur-md"
            role="tablist"
            aria-label="FAQ categories"
          >
            {categories
              .filter((c) => c.visible !== false)
              .sort((a, b) => a.order - b.order)
              .map((cat) => {
                const selected = faqCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setFaqCategory(cat.id);
                      setExpanded(false);
                      setOpenId(null);
                    }}
                    className={cn(
                      "rounded-full px-4 py-2 text-[12px] font-bold transition sm:text-[13px]",
                      selected
                        ? "bg-[#2f1c6a] text-white shadow-md"
                        : "text-[#64748b] hover:bg-[#f4f0ff] hover:text-[#2f1c6a]",
                    )}
                  >
                    {cat.shortLabel}
                  </button>
                );
              })}
          </div>
        </div>

        <div
          className="mx-auto mt-8 max-w-3xl rounded-[28px] border border-white/80 bg-white/75 p-4 shadow-[0_22px_60px_-36px_rgba(37,80,130,0.4)] backdrop-blur-xl sm:p-6"
          role="tabpanel"
        >
          <p className="mb-4 text-center text-[13px] font-bold tracking-wide text-[#673de6] uppercase">
            {category?.label} — {items.length} questions
          </p>
          <ul className="space-y-2">
            {visibleItems.map((item) => {
              const key = `${category?.id}:${item.id}`;
              const open = openId === key;
              return (
                <li
                  key={key}
                  className="overflow-hidden rounded-2xl border border-[#eef2ff] bg-white"
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : key)}
                  >
                    <span className="text-[14px] font-bold text-[#1e1b4b]">
                      {item.question}
                    </span>
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f4f0ff] text-[#673de6]">
                      {open ? (
                        <Minus className="size-3.5" aria-hidden />
                      ) : (
                        <Plus className="size-3.5" aria-hidden />
                      )}
                    </span>
                  </button>
                  {open ? (
                    <div className="border-t border-[#eef2ff] px-4 pt-1 pb-4 text-[13px] leading-relaxed text-[#475569]">
                      {item.answer}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {items.length > preview ? (
            <button
              type="button"
              className="mt-4 w-full rounded-full border border-[#e9e4ff] py-2.5 text-[13px] font-bold text-[#673de6] hover:bg-[#f8f5ff]"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? "Show fewer questions"
                : `View all ${items.length} questions`}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
