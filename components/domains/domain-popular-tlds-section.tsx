"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { routes } from "@/config/routes";
import type { DomainPopularPick } from "@/lib/domains/content";
import type { PopularPickPricing } from "@/lib/domains/domain-search-page-data";
import { formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

const CARD_MIN_W = 260;

export function DomainPopularTldsSection({
  heading,
  linkLabel,
  linkHref,
  picks,
  pricing,
}: {
  heading: string;
  linkLabel: string;
  linkHref: string;
  picks: DomainPopularPick[];
  pricing: PopularPickPricing[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const visible = picks.filter((p) => p.visible !== false);

  const scrollBy = useCallback((delta: number) => {
    scroller.current?.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollBy(-(CARD_MIN_W + 16));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollBy(CARD_MIN_W + 16);
      }
    },
    [scrollBy],
  );

  if (visible.length === 0) return null;

  const priceByTld = new Map(pricing.map((p) => [p.tld.toLowerCase(), p]));

  return (
    <section
      className="overflow-x-hidden bg-[#0c1229] py-14 sm:py-18 lg:py-20"
      aria-labelledby="popular-tlds-heading"
    >
      <div className="hb-shell min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 px-1 text-center sm:text-left">
            <h2
              id="popular-tlds-heading"
              className="font-heading text-[clamp(1.5rem,2.8vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-white"
            >
              {heading}
            </h2>
            <Link
              href={linkHref}
              className="mt-2 inline-block text-[14px] font-semibold text-[#a5b4fc] transition hover:text-white"
            >
              {linkLabel}
            </Link>
          </div>
          <div className="flex justify-center gap-2 sm:justify-end">
            <CarouselButton
              label="Show previous popular domains"
              onClick={() => scrollBy(-(CARD_MIN_W + 16))}
            >
              <ChevronLeft className="size-5" />
            </CarouselButton>
            <CarouselButton
              label="Show next popular domains"
              onClick={() => scrollBy(CARD_MIN_W + 16)}
            >
              <ChevronRight className="size-5" />
            </CarouselButton>
          </div>
        </div>

        <div
          ref={scroller}
          role="region"
          aria-label="Popular domain extensions"
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="mt-8 flex min-w-0 snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {visible.map((pick) => {
            const row = priceByTld.get(pick.tld.toLowerCase());
            const purchasable = row?.purchasable && row.register != null;
            const searchHref = `${routes.domainSearch}?q=${encodeURIComponent(`idea${pick.tld}`)}`;
            return (
              <article
                key={pick.id}
                className="flex w-[min(calc(100vw-2.5rem),280px)] shrink-0 snap-center flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)] sm:w-[280px]"
              >
                <div
                  className="relative flex h-[100px] shrink-0 items-end bg-gradient-to-br from-[#312e81] to-[#1e1b4b] px-5 pb-4"
                  aria-hidden
                >
                  <span className="text-[32px] font-extrabold tracking-tight text-white">
                    {pick.tld}
                  </span>
                </div>
                <div className="flex min-h-[200px] flex-1 flex-col p-5">
                  <p className="text-[13px] leading-snug text-slate-600">
                    {pick.tagline}
                  </p>
                  <div className="mt-4 flex-1">
                    {purchasable && row ? (
                      <>
                        <p className="text-[22px] font-extrabold tracking-tight text-[#0f172a]">
                          {formatPrice(row.register!)}
                          <span className="ml-1 text-[12px] font-semibold text-slate-500">
                            {row.priceCaption}
                          </span>
                        </p>
                        {row.renewCaption ? (
                          <p className="mt-1 text-[12px] text-slate-500">
                            {row.renewCaption}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-[14px] leading-snug font-semibold text-slate-600">
                        {row?.priceCaption ?? "Check search for live pricing"}
                      </p>
                    )}
                  </div>
                  <Link
                    href={searchHref}
                    className={cn(
                      "mt-4 inline-flex h-11 min-h-[44px] items-center justify-center rounded-xl text-[13px] font-bold transition",
                      purchasable
                        ? "bg-[#673de6] text-white hover:bg-[#5b2fd4]"
                        : "border border-slate-200 bg-slate-50 text-[#2f1c6a] hover:bg-slate-100",
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

function CarouselButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
    >
      {children}
    </button>
  );
}
