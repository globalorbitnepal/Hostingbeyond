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

type TldOfferTone = "featured" | "violet" | "mint" | "peach";

const TLD_OFFER_TONE: Record<string, TldOfferTone> = {
  ".com": "featured",
  ".net": "violet",
  ".org": "mint",
  ".shop": "peach",
};

const HERO_TLD_ORDER = [".com", ".net", ".org", ".shop"] as const;

function TldOfferWave({ tone }: { tone: TldOfferTone }) {
  const id = `hb-tld-wave-${tone}`;
  return (
    <svg
      className="hb-tld-card-wave"
      viewBox="0 0 320 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0.2" y1="0" x2="0.45" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="30%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M330 -6 C 268 22, 216 58, 150 74 S 58 96, -10 108 L -10 120 L 330 120 Z"
        fill={`url(#${id})`}
      />
      <path
        d="M330 34 C 258 56, 204 84, 140 96 S 52 108, -10 112 L -10 120 L 330 120 Z"
        fill={`url(#${id})`}
        opacity="0.6"
      />
    </svg>
  );
}

function TldOfferIcon({ tone }: { tone: TldOfferTone }) {
  if (tone === "featured") {
    return (
      <svg viewBox="0 0 120 120" aria-hidden>
        <defs>
          <radialGradient id="hb-globe-haze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d8bcff" stopOpacity="0.7" />
            <stop offset="48%" stopColor="#a875ff" stopOpacity="0.5" />
            <stop offset="78%" stopColor="#7c3aed" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hb-globe-tint" cx="40%" cy="26%" r="84%">
            <stop offset="0%" stopColor="#f3e6ff" stopOpacity="0.55" />
            <stop offset="42%" stopColor="#b98cff" stopOpacity="0.42" />
            <stop offset="72%" stopColor="#8b5cf6" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.4" />
          </radialGradient>
          <clipPath id="hb-globe-clip">
            <circle cx="60" cy="60" r="45" />
          </clipPath>
          <filter
            id="hb-globe-soft"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        {/* soft bloom behind the sphere */}
        <circle cx="60" cy="60" r="62" fill="url(#hb-globe-haze)" />
        {/* translucent glass sphere — never a solid disc */}
        <circle cx="60" cy="60" r="45" fill="url(#hb-globe-tint)" />
        <g clipPath="url(#hb-globe-clip)">
          {/* continents — a stylised world map, soft lavender washes */}
          <g
            fill="rgba(226,203,255,0.5)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.5"
          >
            {/* North America */}
            <path d="M27 33 33 28 39 27 43 31 41 35 44 37 42 42 38 44 36 50 33 52 31 47 28 44 26 39Z" />
            {/* Greenland */}
            <path d="M46 24 52 22 55 26 50 31 45 29Z" />
            {/* Central America */}
            <path d="M34 52 38 53 39 57 35 58 33 55Z" />
            {/* South America */}
            <path d="M42 60 49 58 53 63 51 70 47 78 43 84 39 80 38 71 39 64Z" />
            {/* Europe */}
            <path d="M60 28 66 26 70 29 68 34 63 36 59 33Z" />
            {/* Africa */}
            <path d="M60 38 68 36 73 41 72 50 68 60 64 68 59 64 57 54 56 45Z" />
            {/* Middle East / India */}
            <path d="M73 38 79 36 82 42 78 50 74 46Z" />
            {/* Asia */}
            <path d="M72 26 82 22 92 24 97 30 93 37 86 40 80 36 75 33Z" />
            {/* South-East Asia */}
            <path d="M86 42 92 43 94 49 88 51 84 46Z" />
            {/* Australia */}
            <path d="M88 62 96 60 100 65 96 71 89 70 86 66Z" />
            {/* New Zealand */}
            <path d="M101 72 104 74 102 79 99 76Z" />
          </g>
          {/* wireframe latitude / longitude */}
          <g
            fill="none"
            stroke="rgba(255,255,255,0.26)"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          >
            <ellipse cx="60" cy="60" rx="45" ry="11" />
            <ellipse cx="60" cy="60" rx="45" ry="22" />
            <ellipse cx="60" cy="60" rx="45" ry="33" />
            <ellipse cx="60" cy="60" rx="9" ry="45" />
            <ellipse cx="60" cy="60" rx="22" ry="45" />
            <ellipse cx="60" cy="60" rx="34" ry="45" />
          </g>
        </g>
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* soft top-left rim light (the mock's glass highlight) */}
        <circle
          cx="60"
          cy="60"
          r="43.8"
          fill="none"
          stroke="rgba(246,238,255,0.5)"
          strokeWidth="1.8"
          strokeDasharray="58 200"
          strokeDashoffset="118"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter="url(#hb-globe-soft)"
        />
      </svg>
    );
  }

  if (tone === "violet") {
    // Measured off the mock: the three isometric diamonds are 41px wide by
    // 41px tall in total, and each diamond is ~16px tall, so the layers sit
    // almost edge to edge — this is a square icon, not a wide one.
    return (
      <svg viewBox="0 0 34 34" aria-hidden>
        {/* top diamond — the only solid layer */}
        <path d="M17 0.8 33 6.3 17 11.8 1 6.3Z" fill="currentColor" />
        {/* middle diamond — outline only */}
        <path
          d="M17 11.3 33 16.8 17 22.3 1 16.8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinejoin="round"
          opacity="0.78"
        />
        {/* bottom diamond — faded outline */}
        <path
          d="M17 21.8 33 27.3 17 32.8 1 27.3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinejoin="round"
          opacity="0.32"
        />
      </svg>
    );
  }

  if (tone === "mint") {
    return (
      <svg
        viewBox="0 0 52 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="26" cy="17" r="6" />
        <path d="M15.6 39c.6-6 5-9.6 10.4-9.6S35.8 33 36.4 39" />
        <circle cx="10.6" cy="21.5" r="4.4" />
        <path d="M2.6 37.4c.6-4.4 3.6-7.2 7.2-7.2 1.6 0 3 .5 4.2 1.4" />
        <circle cx="41.4" cy="21.5" r="4.4" />
        <path d="M49.4 37.4c-.6-4.4-3.6-7.2-7.2-7.2-1.6 0-3 .5-4.2 1.4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Every centerline below was traced off the reference crop: the mock's
          stroke is ~3px on a 250px-wide card, i.e. 2.1 units here, and the
          basket tapers instead of stepping. Ink lands at 25.4 × 23.2 units
          (aspect ≈1.09). */}
      {/* handle stub, dipping into the rail's left corner */}
      <path d="M1.1 1.05H3.2L4.3 4.65" />
      {/* top rail → front wall → basket floor → back wall */}
      <path d="M4.3 4.65H24.5L21.9 16.6H7L4.3 4.65" />
      {/* lightning bolt centred in the basket */}
      <path
        d="M15 6.2 11.2 10.5h2.7l-1.1 3.1 5.9-4.4h-2.9z"
        fill="currentColor"
        stroke="none"
      />
      {/* wheels */}
      <circle cx="7.9" cy="20.9" r="2.3" fill="currentColor" stroke="none" />
      <circle cx="20.9" cy="20.9" r="2.3" fill="currentColor" stroke="none" />
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
    const order: string[] = [...HERO_TLD_ORDER];
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
      .filter((row) => order.includes(row.tld.toLowerCase()))
      .sort((a, b) => {
        const ai = order.indexOf(a.tld.toLowerCase());
        const bi = order.indexOf(b.tld.toLowerCase());
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .slice(0, 4);
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
            {displayTeasers.slice(0, 4).map((item) => {
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
            className="hb-hero-offer-scroll relative z-30 mt-5 hidden w-full gap-1.5 pt-3 md:mt-5 md:grid md:grid-cols-4 md:gap-2 md:pt-3 lg:mt-5 lg:gap-[2%]"
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
                    "hb-tld-card group shrink-0 snap-start outline-none",
                    `hb-tld-card--${tone}`,
                    active && "hb-tld-card--active",
                    "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  )}
                >
                  <span className="hb-tld-card-box">
                    {popular ? (
                      <span className="hb-tld-card-ribbon">
                        <Crown fill="currentColor" aria-hidden />
                        Most Popular
                      </span>
                    ) : saveLabel ? (
                      <span className="hb-tld-card-badge">{saveLabel}</span>
                    ) : null}
                    <span className="hb-tld-card-face">
                      <span className="hb-tld-card-head">
                        <span className="hb-tld-card-tld" translate="no">
                          {value}
                        </span>
                        <span className="hb-tld-card-art">
                          <TldOfferIcon tone={tone} />
                        </span>
                      </span>
                      <span className="hb-tld-card-price" translate="no">
                        {sale != null ? (
                          <>
                            <CatalogPrice usd={sale} />
                            <span className="hb-tld-card-per">/yr</span>
                          </>
                        ) : (
                          item.priceLabel
                        )}
                        {original != null ? (
                          <span className="hb-tld-card-was">
                            <CatalogPrice usd={original} />
                          </span>
                        ) : null}
                      </span>
                      <TldOfferWave tone={tone} />
                    </span>
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
