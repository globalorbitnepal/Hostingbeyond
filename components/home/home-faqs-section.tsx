"use client";

import { useMemo, useState } from "react";
import { BarChart3, Layers, Minus, Plus } from "lucide-react";

import type { CmsHomeFaqsContent } from "@/lib/orbit/defaults";
import { defaultHomeFaqsSection } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

export function HomeFaqsSection({ content }: { content?: CmsHomeFaqsContent }) {
  const data = content ?? defaultHomeFaqsSection();
  const groups = (data.groups ?? [])
    .filter((group) => group.visible !== false)
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      items: (group.items ?? [])
        .filter((item) => item.visible !== false)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.items.length > 0);

  const preview = Math.max(1, data.previewCount || 5);
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(
    groups[0]?.items[0] ? `${groups[0].id}:${groups[0].items[0].id}` : null,
  );

  const schema = useMemo(() => {
    const entities = groups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    );
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entities,
    };
  }, [groups]);

  if (!data.visible || groups.length === 0) return null;

  return (
    <section className="hb-home-section hb-home-section--lavender">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-18%] right-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.32),transparent_68%)] blur-2xl"
      />
      <div className="hb-shell relative z-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
            {data.eyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.75rem,3.6vw,3.15rem)] leading-[1.12] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
            {data.title}{" "}
            <span className="bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              {data.titleAccent}
            </span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
            {data.description}
          </p>
          {data.handwrittenNote ? (
            <p className="font-hand mt-3 text-[15px] leading-tight font-semibold whitespace-pre-line text-[#4f46e5] xl:hidden">
              {data.handwrittenNote}
            </p>
          ) : null}
          {data.handwrittenNote ? (
            <p className="font-hand absolute top-0 -right-4 hidden max-w-[9rem] rotate-6 text-left text-[15px] leading-tight font-semibold whitespace-pre-line text-[#4f46e5] xl:block">
              {data.handwrittenNote}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-5">
          {groups.map((group) => {
            const Icon = group.icon === "chart" ? BarChart3 : Layers;
            const visibleItems = expanded
              ? group.items
              : group.items.slice(0, preview);
            return (
              <div
                key={group.id}
                className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_22px_60px_-36px_rgba(37,80,130,0.45)] sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2563eb]">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="text-[16px] font-extrabold tracking-tight text-slate-950">
                      {group.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                    {group.items.length} Questions
                  </span>
                </div>
                <div className="space-y-2">
                  {visibleItems.map((item, index) => {
                    const key = `${group.id}:${item.id}`;
                    const open = openId === key;
                    const number = String(index + 1).padStart(2, "0");
                    return (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
                      >
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenId(open ? null : key)}
                          className="flex w-full items-start gap-3 px-3.5 py-3.5 text-left sm:px-4"
                        >
                          <span className="mt-0.5 text-[12px] font-extrabold text-[#4f46e5]">
                            {number}
                          </span>
                          <span className="min-w-0 flex-1 text-[14px] leading-snug font-bold text-slate-900 sm:text-[15px]">
                            {item.question}
                          </span>
                          <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                            {open ? (
                              <Minus className="size-3.5" />
                            ) : (
                              <Plus className="size-3.5" />
                            )}
                          </span>
                        </button>
                        <div
                          className={cn(
                            "grid transition-[grid-template-rows] duration-300 ease-out",
                            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                          )}
                        >
                          <div className="overflow-hidden">
                            <p className="px-3.5 pb-4 text-[13.5px] leading-relaxed text-slate-600 sm:px-4 sm:pl-[3.25rem] sm:text-[14px]">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {groups.some((group) => group.items.length > preview) ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
            >
              {expanded ? "Show fewer FAQs" : data.ctaLabel}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
