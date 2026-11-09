"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronDown, Crown, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CatalogPrice } from "@/components/i18n/localized-text";
import { heroTldOptions } from "@/config/domain-teasers";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { CmsHeroContent } from "@/lib/orbit/defaults";

type HeroDomainTeaser = {
  tld: string;
  priceLabel: string;
  usd?: number;
  originalUsd?: number;
  visible?: boolean;
};

const FALLBACK_TEASERS: HeroDomainTeaser[] = [
  {
    tld: ".com",
    priceLabel: "$9.99/yr",
    usd: 9.99,
    originalUsd: 17.99,
    visible: true,
  },
  {
    tld: ".net",
    priceLabel: "$11.99/yr",
    usd: 11.99,
    originalUsd: 17.49,
    visible: true,
  },
  {
    tld: ".org",
    priceLabel: "$7.99/yr",
    usd: 7.99,
    originalUsd: 17.99,
    visible: true,
  },
  {
    tld: ".online",
    priceLabel: "$2.99/yr",
    usd: 2.99,
    originalUsd: 49.99,
    visible: true,
  },
  {
    tld: ".shop",
    priceLabel: "$2.99/yr",
    usd: 2.99,
    originalUsd: 49.99,
    visible: true,
  },
];

const OFFER_BY_TLD: Record<string, { usd: number; originalUsd: number }> = {
  ".com": { usd: 9.99, originalUsd: 17.99 },
  ".net": { usd: 11.99, originalUsd: 17.49 },
  ".org": { usd: 7.99, originalUsd: 17.99 },
  ".online": { usd: 2.99, originalUsd: 49.99 },
  ".shop": { usd: 2.99, originalUsd: 49.99 },
};

export type HeroOrbitTldRate = {
  tld: string;
  /** Orbit 1st-year register (promo when active). */
  register: number;
  /** Orbit renewal — shown as the cut price. */
  renew: number;
};

type TldOfferTone = "featured" | "violet" | "azure";

const TLD_OFFER_TONE: Record<string, TldOfferTone> = {
  ".com": "featured",
  ".net": "violet",
  ".org": "azure",
  ".online": "violet",
  ".shop": "azure",
};

function TldOfferWave() {
  return (
    <svg
      className="hb-tld-offer-wave"
      viewBox="0 0 220 72"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 30 C 36 12, 72 50, 112 28 S 176 8, 220 32 L 220 72 L 0 72 Z"
        fill="currentColor"
        opacity="0.38"
      />
      <path
        d="M0 44 C 48 26, 88 58, 136 40 S 188 24, 220 46 L 220 72 L 0 72 Z"
        fill="currentColor"
        opacity="0.28"
      />
    </svg>
  );
}

function usdFromPriceLabel(label: string): number | undefined {
  if (!/\$|USD/i.test(label)) return undefined;
  const match = label.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : undefined;
}

function savePercent(original: number, sale: number) {
  if (original <= 0) return 0;
  return Math.max(1, Math.round(((original - sale) / original) * 100));
}

const SCENE_FALLBACK = "/images/hero-speaker-v6.webp";
const TYPING_COPY = "Find the perfect domain for your brand";

function AccentGoldSwoosh({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 14"
      className={cn(
        "mt-1 block h-[10px] w-[min(100%,18rem)] min-[375px]:w-[min(100%,21.5rem)] sm:mt-1.5 sm:h-[11px] sm:w-[min(100%,24.5rem)] lg:w-[min(100%,27.5rem)]",
        className,
      )}
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="hb-accent-swoosh" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e8b84a" stopOpacity="0.35" />
          <stop offset="12%" stopColor="#f0cc5c" />
          <stop offset="50%" stopColor="#f7dc6e" />
          <stop offset="88%" stopColor="#f2c24a" />
          <stop offset="100%" stopColor="#dea035" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <path
        d="M4 11.5 C 56 3, 118 12.5, 178 5.5 S 246 2.5, 296 9.5"
        fill="none"
        stroke="url(#hb-accent-swoosh)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function useTypedPlaceholder(active: boolean, reduce: boolean | null) {
  const [text, setText] = useState(reduce ? TYPING_COPY : "");

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setText(TYPING_COPY);
      return;
    }
    let i = 0;
    let direction: "type" | "hold" | "delete" = "type";
    let hold = 0;
    const tick = window.setInterval(() => {
      if (direction === "type") {
        i += 1;
        setText(TYPING_COPY.slice(0, i));
        if (i >= TYPING_COPY.length) direction = "hold";
        return;
      }
      if (direction === "hold") {
        hold += 1;
        if (hold > 18) {
          hold = 0;
          direction = "delete";
        }
        return;
      }
      i = Math.max(0, i - 2);
      setText(TYPING_COPY.slice(0, i));
      if (i === 0) direction = "type";
    }, 55);
    return () => window.clearInterval(tick);
  }, [active, reduce]);

  return text;
}

export function HeroSection({
  content,
  orbitTlds = [],
}: {
  content?: CmsHeroContent;
  orbitTlds?: HeroOrbitTldRate[];
}) {
  const reduceMotion = useReducedMotion();
  const [domain, setDomain] = useState("");
  const typed = useTypedPlaceholder(!domain.trim(), reduceMotion);

  const eyebrow = content?.eyebrow || "SIMPLE • SECURE • SCALABLE";
  const headline = content?.headline || "Host Your Ideas";
  const accent = (content?.headlineAccent || "Beyond Limits").replace(
    /\.$/,
    "",
  );
  const description =
    content?.description ||
    "Reliable hosting, powerful infrastructure and the freedom to build what's next.";
  const searchButtonLabel = content?.searchButtonLabel || "Search Domain";

  const teasers = useMemo((): HeroDomainTeaser[] => {
    const liveByTld = new Map(
      orbitTlds.map((row) => {
        const tld = row.tld.startsWith(".")
          ? row.tld.toLowerCase()
          : `.${row.tld.toLowerCase()}`;
        return [tld, row] as const;
      }),
    );
    const offerFor = (tld: string) => {
      const live = liveByTld.get(tld.toLowerCase());
      if (live && live.register > 0 && live.renew > 0) {
        return { usd: live.register, originalUsd: live.renew };
      }
      return OFFER_BY_TLD[tld.toLowerCase()];
    };
    const fromCms = (content?.domainPricing ?? []).filter(
      (item) => item.visible !== false && item.tld.trim(),
    );
    if (fromCms.length) {
      return fromCms.map((item) => {
        const tld = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
        const offer = offerFor(tld);
        const fallbackUsd = FALLBACK_TEASERS.find(
          (row) => row.tld === tld,
        )?.usd;
        return {
          ...item,
          tld,
          usd: offer?.usd ?? usdFromPriceLabel(item.priceLabel) ?? fallbackUsd,
          originalUsd: offer?.originalUsd,
          priceLabel: offer ? `$${offer.usd}/yr` : item.priceLabel,
        };
      });
    }
    return FALLBACK_TEASERS.map((row) => {
      const offer = offerFor(row.tld);
      return offer ? { ...row, ...offer, priceLabel: `$${offer.usd}/yr` } : row;
    });
  }, [content?.domainPricing, orbitTlds]);

  const displayTeasers = useMemo(() => {
    const order = [".com", ".net", ".org", ".online", ".shop"];
    const rows = [...teasers];
    for (const tld of order) {
      if (!rows.some((r) => r.tld.toLowerCase() === tld)) {
        const fallback = FALLBACK_TEASERS.find((f) => f.tld === tld);
        if (fallback) rows.push(fallback);
      }
    }
    return rows
      .filter((row, index, list) => {
        const key = row.tld.toLowerCase();
        return list.findIndex((x) => x.tld.toLowerCase() === key) === index;
      })
      .sort((a, b) => {
        const ai = order.indexOf(a.tld.toLowerCase());
        const bi = order.indexOf(b.tld.toLowerCase());
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .slice(0, 5);
  }, [teasers]);

  const tldChoices = useMemo(() => {
    const fromTeasers = displayTeasers.map((item) =>
      item.tld.startsWith(".") ? item.tld : `.${item.tld}`,
    );
    const merged = [...fromTeasers];
    for (const option of heroTldOptions) {
      if (!merged.includes(option)) merged.push(option);
    }
    return merged;
  }, [displayTeasers]);

  const [tld, setTld] = useState(tldChoices[0] || ".com");

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = domain.trim().replace(/^\.+/, "");
    const query = raw ? (raw.includes(".") ? raw : `${raw}${tld}`) : "";
    window.location.href = query
      ? `${routes.domains}?q=${encodeURIComponent(query)}`
      : routes.domains;
  };

  const speakerSrc =
    content?.speakerImage?.trim() ||
    content?.backgroundImage?.trim() ||
    SCENE_FALLBACK;

  const accentParts = useMemo(() => {
    const trimmed = accent.trim();
    const match = trimmed.match(/^(\S+)\s+(.+)$/);
    if (!match)
      return { split: false as const, leading: "", trailing: trimmed };
    const [first, rest] = [match[1], match[2]];
    if (first.toLowerCase() === "beyond") {
      return { split: true as const, leading: first, trailing: rest };
    }
    return { split: false as const, leading: "", trailing: trimmed };
  }, [accent]);

  return (
    <section className="relative z-10 flex min-h-0 flex-1 flex-col">
      <link rel="preload" as="image" href={speakerSrc} fetchPriority="high" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-r from-[#5b21b6]/55 via-[#5b21b6]/12 via-38% to-transparent lg:block"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[44%] overflow-hidden lg:hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 24%, #000 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 24%, #000 100%)",
        }}
      >
        <Image
          src={speakerSrc}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[84%_6%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#5b21b6]/70 via-[#4c1d95]/15 to-[#2f1c6a]/50" />
      </div>

      <div className="hb-shell relative z-20 grid w-full flex-1 grid-cols-1 overflow-visible pt-4 pb-7 sm:pt-3 sm:pb-8 lg:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)] lg:items-center lg:gap-4 lg:pb-9">
        <div className="relative z-30 w-full min-w-0 self-center overflow-visible lg:max-w-[50rem] xl:max-w-[54rem]">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-bold tracking-[0.22em] text-white/75 uppercase sm:text-[12px]"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="font-heading mt-2 text-[clamp(2rem,4.75vw,4.05rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-white"
          >
            <span className="block">{headline}</span>
            <span className="mt-1.5 block max-w-full sm:mt-2">
              {accentParts.split ? (
                <span className="inline-block max-w-full">
                  <span className="inline-block max-w-full">
                    <span className="hb-hero-accent-beyond">
                      {accentParts.leading}
                    </span>
                    <span className="hb-hero-accent-gold">
                      {" "}
                      {accentParts.trailing}
                    </span>
                  </span>
                  <AccentGoldSwoosh className="max-w-full" />
                </span>
              ) : (
                <span className="text-white">{accentParts.trailing}</span>
              )}
            </span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-2.5 max-w-[46ch] text-[14px] leading-relaxed text-white/88 sm:text-[15px] lg:text-[16px]"
          >
            {description}
          </motion.p>

          <motion.form
            onSubmit={onSearch}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="hb-search-pill relative z-30 mt-4 flex w-full max-w-full flex-col gap-2 rounded-[26px] p-2 sm:mt-5 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-1.5 sm:pr-1.5 lg:mt-6 lg:min-h-[56px] lg:py-1.5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:gap-2.5 sm:px-3 lg:px-3.5">
              <span className="hb-search-pill-icon flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11 lg:size-12">
                <Search
                  className="size-[18px] text-[#6d28d9] sm:size-5"
                  aria-hidden
                />
              </span>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={reduceMotion ? TYPING_COPY : `${typed}|`}
                aria-label={TYPING_COPY}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 sm:py-2 sm:text-[15px] lg:min-w-[12rem] lg:py-2.5 lg:text-[16px] xl:min-w-[16rem]"
              />
            </div>
            <span
              aria-hidden
              className="hb-search-pill-divider mx-1 hidden h-9 w-px shrink-0 sm:block lg:h-10"
            />
            <div className="flex items-center gap-1.5 sm:gap-2 sm:pr-0.5">
              <label className="relative hidden min-w-0 flex-1 sm:block sm:flex-none">
                <span className="sr-only">Domain extension</span>
                <select
                  value={tld}
                  onChange={(e) => setTld(e.target.value)}
                  className="h-11 w-full min-w-0 appearance-none rounded-full border border-slate-200 bg-white py-0 pr-8 pl-3.5 text-[14px] font-bold text-slate-800 outline-none sm:h-12 sm:min-w-[96px] sm:pl-4 sm:text-[15px]"
                >
                  {tldChoices.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
              </label>
              <button
                type="submit"
                className="hb-search-cta inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-extrabold tracking-[-0.01em] whitespace-nowrap sm:h-12 sm:flex-none sm:px-5 sm:text-[14px] lg:px-6 lg:text-[15px]"
              >
                {searchButtonLabel}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            role="group"
            aria-label="Popular domain extension prices"
            className="relative z-30 mt-4 grid w-full grid-cols-1 gap-1.5 md:hidden"
          >
            {displayTeasers.slice(0, 5).map((item) => {
              const value = item.tld.startsWith(".")
                ? item.tld
                : `.${item.tld}`;
              const active = value === tld;
              return (
                <button
                  key={`m-${item.tld}`}
                  type="button"
                  onClick={() => setTld(value)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition",
                    active
                      ? "border-white/45 bg-white/20"
                      : "border-white/20 bg-white/10",
                  )}
                >
                  <span className="text-[13.5px] font-extrabold text-white">
                    {value}
                    {value === ".com" ? " · Most Popular" : ""}
                  </span>
                  <span className="flex items-baseline gap-1.5">
                    {typeof item.originalUsd === "number" ? (
                      <span className="text-[11.5px] font-semibold text-white/55 line-through">
                        <CatalogPrice usd={item.originalUsd} />
                      </span>
                    ) : null}
                    <span className="text-[13.5px] font-extrabold whitespace-nowrap text-white">
                      {typeof item.usd === "number" ? (
                        <>
                          <CatalogPrice usd={item.usd} />
                          <span className="text-[0.8em]">/yr</span>
                        </>
                      ) : (
                        item.priceLabel
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            role="group"
            aria-label="Popular domain extensions"
            className="hb-hero-offer-scroll relative z-30 mt-5 hidden w-full snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain pt-4 pb-1 [-webkit-overflow-scrolling:touch] md:mt-5 md:grid md:grid-cols-3 md:gap-2.5 md:overflow-visible md:pt-4 lg:mt-5 lg:grid-cols-5 lg:gap-2.5"
          >
            {displayTeasers.map((item) => {
              const value = item.tld.startsWith(".")
                ? item.tld
                : `.${item.tld}`;
              const active = value === tld;
              const popular = value.toLowerCase() === ".com";
              const tone = TLD_OFFER_TONE[value.toLowerCase()] ?? "violet";
              const sale = typeof item.usd === "number" ? item.usd : undefined;
              const original =
                typeof item.originalUsd === "number"
                  ? item.originalUsd
                  : undefined;
              const saveLabel =
                !popular && sale != null && original != null
                  ? `Save ${savePercent(original, sale)}%`
                  : null;

              return (
                <button
                  key={item.tld}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTld(value)}
                  className={cn(
                    "hb-tld-offer group relative flex h-[7.15rem] w-[9.6rem] shrink-0 snap-start flex-col overflow-visible rounded-[18px] text-left transition duration-200 outline-none",
                    "sm:h-[7.35rem] sm:w-auto sm:min-w-0",
                    "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    `hb-tld-offer--${tone}`,
                    active && "hb-tld-offer--active",
                  )}
                >
                  {popular ? (
                    <span className="hb-tld-offer-popular-badge absolute -top-2.5 left-1.5 z-20 inline-flex items-center gap-0.5 rounded-full px-2 py-[3px] text-[8.5px] font-extrabold tracking-[0.04em] whitespace-nowrap uppercase sm:px-2.5 sm:text-[9.5px]">
                      <Crown
                        className="size-2.5 shrink-0"
                        fill="currentColor"
                        aria-hidden
                      />
                      Most Popular
                    </span>
                  ) : saveLabel ? (
                    <span
                      className={cn(
                        "hb-tld-offer-save absolute -top-2.5 right-1.5 z-20 rounded-full px-2 py-[3px] text-[8.5px] font-extrabold whitespace-nowrap sm:px-2.5 sm:text-[9.5px]",
                        `hb-tld-offer-save--${tone}`,
                      )}
                    >
                      {saveLabel}
                    </span>
                  ) : null}
                  <span className="hb-tld-offer-face relative flex h-full w-full flex-col items-start overflow-hidden rounded-[18px] pt-3.5 pr-3 pb-2.5 pl-3">
                    <span
                      className="hb-tld-offer-tld relative z-[2] text-[1.12rem] leading-none font-extrabold tracking-[-0.04em] sm:text-[1.18rem]"
                      translate="no"
                    >
                      {value}
                    </span>
                    {original != null ? (
                      <span
                        className="hb-tld-offer-was relative z-[2] mt-1.5 text-[12px] font-bold line-through sm:text-[13px]"
                        translate="no"
                      >
                        <CatalogPrice usd={original} />
                      </span>
                    ) : null}
                    {sale != null ? (
                      <span
                        className="hb-tld-offer-price relative z-[2] mt-0.5 text-[1.22rem] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap sm:text-[1.28rem]"
                        translate="no"
                      >
                        <CatalogPrice usd={sale} />
                        <span className="ml-0.5 align-baseline text-[0.52em] font-extrabold">
                          /yr
                        </span>
                      </span>
                    ) : (
                      <span className="hb-tld-offer-price relative z-[2] text-[1.15rem] font-extrabold">
                        {item.priceLabel}
                      </span>
                    )}
                    <TldOfferWave />
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
