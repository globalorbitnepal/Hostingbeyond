"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { routes } from "@/config/routes";
import type { DomainPopularPick } from "@/lib/domains/content";
import { formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

type PriceRow = {
  tld: string;
  register: number;
  renew: number;
};

export function DomainPopularTldsSection({
  heading,
  linkLabel,
  linkHref,
  picks,
  prices,
}: {
  heading: string;
  linkLabel: string;
  linkHref: string;
  picks: DomainPopularPick[];
  prices: PriceRow[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const visible = picks.filter((p) => p.visible !== false);
  if (visible.length === 0) return null;

  function scrollBy(delta: number) {
    scroller.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="bg-[#0c1229] py-14 sm:py-16">
      <div className="hb-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading max-w-xl text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-white">
              {heading}
            </h2>
            <Link
              href={linkHref}
              className="mt-2 inline-block text-[14px] font-semibold text-[#a5b4fc] hover:text-white"
            >
              {linkLabel}
            </Link>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(-320)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(320)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="mt-8 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {visible.map((pick) => {
            const row = prices.find((p) => p.tld === pick.tld);
            const promo = row?.register ?? 0;
            const renew = row?.renew ?? 0;
            return (
              <article
                key={pick.id}
                className="flex w-[min(100%,280px)] shrink-0 snap-start flex-col rounded-[20px] bg-white p-5 shadow-lg sm:w-[260px]"
              >
                <p className="text-[28px] font-extrabold tracking-tight text-[#0f172a]">
                  {pick.tld}
                </p>
                <p className="mt-2 min-h-[40px] text-[13px] leading-snug text-slate-600">
                  {pick.tagline}
                </p>
                <div className="mt-4">
                  {renew > promo ? (
                    <p className="text-[13px] text-slate-400 line-through">
                      {formatPrice(renew)}
                    </p>
                  ) : null}
                  <p className="text-[15px] font-extrabold text-[#0f172a]">
                    {formatPrice(promo)}
                    <span className="text-[12px] font-semibold text-slate-500">
                      /1st yr
                    </span>
                  </p>
                </div>
                <Link
                  href={`${routes.domainSearch}?q=${encodeURIComponent(`idea${pick.tld}`)}`}
                  className={cn(
                    "mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#673de6] text-[13px] font-bold text-white transition hover:bg-[#5b2fd4]",
                  )}
                >
                  Check availability
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
