"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { DomainFrameImage } from "@/components/domains/domain-frame-image";
import { routes } from "@/config/routes";
import type { DomainPopularPick } from "@/lib/domains/content";
import { formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

type PriceRow = {
  tld: string;
  register: number;
  renew: number;
};

const CARD_W = 272;

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
    <section className="bg-[#0c1229] py-16 sm:py-20">
      <div className="hb-shell">
        <div className="relative mx-auto max-w-4xl px-2 text-center sm:px-0">
          <h2 className="font-heading text-[clamp(1.55rem,2.9vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-white">
            {heading}
          </h2>
          <Link
            href={linkHref}
            className="mt-3 inline-block text-[14px] font-semibold text-[#a5b4fc] transition hover:text-white"
          >
            {linkLabel}
          </Link>
          <div className="absolute top-0 right-0 hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(-(CARD_W + 20))}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(CARD_W + 20)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-2 sm:hidden">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-(CARD_W + 20))}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(CARD_W + 20)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div
          ref={scroller}
          className="mt-6 flex snap-x snap-mandatory [scrollbar-width:none] justify-center gap-5 overflow-x-auto pb-3 [-ms-overflow-style:none] sm:mt-8 [&::-webkit-scrollbar]:hidden"
        >
          {visible.map((pick) => {
            const row = prices.find((p) => p.tld === pick.tld);
            const promo = row?.register ?? 0;
            const renew = row?.renew ?? 0;
            const banner =
              pick.image?.trim() || "/images/domains/frames/popular-tld.svg";
            return (
              <article
                key={pick.id}
                className="flex w-[min(100%,272px)] shrink-0 snap-center flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] sm:w-[272px]"
              >
                <div className="relative h-[140px] w-full shrink-0 bg-[#1e1b4b]">
                  <DomainFrameImage
                    src={banner}
                    alt=""
                    overlay="none"
                    priority={pick.order === 0}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <p className="text-[26px] font-extrabold tracking-tight text-[#0f172a]">
                    {pick.tld}
                  </p>
                  <p className="mt-2 min-h-[44px] text-[13px] leading-snug text-slate-600">
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
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
