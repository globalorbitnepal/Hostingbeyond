"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { routes } from "@/config/routes";
import type { DomainPopularPick } from "@/lib/domains/content";
import type { PopularPickPricing } from "@/lib/domains/domain-search-page-data";
import { formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

const CARD_MIN_W = 272;

function reveal(delay: number, reduce: boolean | null) {
  if (reduce) {
    return { initial: false as const, animate: { opacity: 1, y: 0 } };
  }
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-20px" },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function DomainPopularTldsSection({
  heading,
  linkLabel,
  linkHref,
  picks,
  pricing,
  transferMode = false,
}: {
  heading: string;
  linkLabel: string;
  linkHref: string;
  picks: DomainPopularPick[];
  pricing: PopularPickPricing[];
  /** Use transfer deep-links and CTA copy on /domain-transfer. */
  transferMode?: boolean;
}) {
  const reduce = useReducedMotion();
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
      className="relative overflow-x-hidden bg-[#060a18] py-16 sm:py-20 lg:py-24"
      aria-labelledby="popular-tlds-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.35), transparent 50%), radial-gradient(circle at 70% 60%, rgba(37,99,235,0.2), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23a5b4fc' stroke-opacity='0.35' stroke-width='0.5'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3C/g%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%23c4b5fd' fill-opacity='0.4'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="hb-shell relative z-10 min-w-0">
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          {...reveal(0, reduce)}
        >
          <div className="min-w-0 px-1 text-center sm:text-left">
            <h2
              id="popular-tlds-heading"
              className="font-heading text-[clamp(1.55rem,2.9vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-white"
            >
              {heading}
            </h2>
            <Link
              href={linkHref}
              className="mt-2 inline-block text-[14px] font-semibold text-[#a5b4fc] underline-offset-4 transition hover:text-white hover:underline"
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
        </motion.div>

        <div
          ref={scroller}
          role="region"
          aria-label="Popular domain extensions"
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="mt-10 flex min-w-0 snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] sm:mt-12 sm:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {visible.map((pick, index) => {
            const row = priceByTld.get(pick.tld.toLowerCase());
            const purchasable = row?.purchasable && row.register != null;
            const searchHref = transferMode
              ? `${routes.domainTransfer}?domain=${encodeURIComponent(`idea${pick.tld}`)}#transfer-check`
              : `${routes.domainSearch}?q=${encodeURIComponent(`idea${pick.tld}`)}`;
            return (
              <motion.article
                key={pick.id}
                className="group flex w-[min(calc(100vw-2rem),288px)] shrink-0 snap-center flex-col overflow-hidden rounded-[22px] border border-white/15 bg-white/[0.06] shadow-[0_28px_70px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl transition duration-300 hover:border-white/25 hover:bg-white/[0.09] sm:w-[288px]"
                {...reveal(0.06 + index * 0.05, reduce)}
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <div
                  className="relative flex h-[108px] shrink-0 items-end overflow-hidden px-5 pb-4"
                  aria-hidden
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4338ca]/80 via-[#312e81]/90 to-[#1e1b4b]" />
                  {!reduce ? (
                    <motion.div
                      className="absolute -top-8 left-1/2 h-24 w-[120%] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-white/50 via-[#a5b4fc]/30 to-transparent blur-md"
                      animate={{ opacity: [0.55, 0.85, 0.55] }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <div className="absolute -top-8 left-1/2 h-24 w-[120%] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-white/40 to-transparent blur-md" />
                  )}
                  <span className="relative text-[34px] font-extrabold tracking-tight text-white drop-shadow-sm">
                    {pick.tld}
                  </span>
                </div>
                <div className="flex min-h-[210px] flex-1 flex-col p-5">
                  <p className="text-[13px] leading-snug text-white/75">
                    {pick.tagline}
                  </p>
                  <div className="mt-4 flex-1">
                    {purchasable && row ? (
                      <>
                        <p className="text-[24px] font-extrabold tracking-tight text-white">
                          {formatPrice(row.register!)}
                          <span className="ml-1.5 text-[12px] font-semibold text-white/55">
                            {row.priceCaption}
                          </span>
                        </p>
                        {row.renewCaption ? (
                          <p className="mt-1.5 text-[12px] text-white/50">
                            {row.renewCaption}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-[14px] leading-snug font-semibold text-white/70">
                        {row?.priceCaption ?? "Check search for live pricing"}
                      </p>
                    )}
                  </div>
                  <Link
                    href={searchHref}
                    className={cn(
                      "mt-4 inline-flex h-11 min-h-[44px] items-center justify-center rounded-full text-[13px] font-bold transition",
                      purchasable
                        ? "bg-[#673de6] text-white shadow-[0_12px_28px_-12px_rgba(103,61,230,0.9)] hover:bg-[#5b2fd4] hover:shadow-[0_16px_32px_-10px_rgba(103,61,230,1)]"
                        : "border border-white/20 bg-white/10 text-white hover:bg-white/15",
                    )}
                  >
                    {transferMode ? "Check transfer" : "Check availability"}
                  </Link>
                </div>
              </motion.article>
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
      className="inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-white/20 active:scale-95 motion-reduce:transform-none"
    >
      {children}
    </button>
  );
}
