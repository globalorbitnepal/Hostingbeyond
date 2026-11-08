"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  Code2,
  Crown,
  Globe,
  Link2,
  Search,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CatalogPrice } from "@/components/i18n/localized-text";
import { heroTldOptions } from "@/config/domain-teasers";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { CmsHeroContent } from "@/lib/orbit/defaults";

const FALLBACK_TEASERS = [
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
    tld: ".dev",
    priceLabel: "$8.99/yr",
    usd: 8.99,
    originalUsd: 18.99,
    visible: true,
  },
] as const;

const OFFER_BY_TLD: Record<string, { usd: number; originalUsd: number }> = {
  ".com": { usd: 9.99, originalUsd: 17.99 },
  ".net": { usd: 11.99, originalUsd: 17.49 },
  ".org": { usd: 7.99, originalUsd: 17.99 },
  ".dev": { usd: 8.99, originalUsd: 18.99 },
};

function usdFromPriceLabel(label: string): number | undefined {
  if (!/\$|USD/i.test(label)) return undefined;
  const match = label.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : undefined;
}

const SCENE_FALLBACK = "/images/hero-speaker-v6.webp";
const TYPING_COPY = "Find the perfect domain for your brand";

function tldMark(tld: string) {
  const key = tld.replace(/^\./, "").toLowerCase();
  if (key === "com") return Globe;
  if (key === "net") return Link2;
  if (key === "org") return Users;
  if (key === "dev") return Code2;
  return Globe;
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

export function HeroSection({ content }: { content?: CmsHeroContent }) {
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
  const searchButtonLabel = content?.searchButtonLabel || "Search";

  const teasers = useMemo(() => {
    const fromCms = (content?.domainPricing ?? []).filter(
      (item) => item.visible !== false && item.tld.trim(),
    );
    if (fromCms.length) {
      return fromCms.map((item) => {
        const tld = item.tld.startsWith(".") ? item.tld : `.${item.tld}`;
        const offer = OFFER_BY_TLD[tld.toLowerCase()];
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
    return [...FALLBACK_TEASERS];
  }, [content?.domainPricing]);

  const tldChoices = useMemo(() => {
    const fromTeasers = teasers.map((item) =>
      item.tld.startsWith(".") ? item.tld : `.${item.tld}`,
    );
    const merged = [...fromTeasers];
    for (const option of heroTldOptions) {
      if (!merged.includes(option)) merged.push(option);
    }
    return merged;
  }, [teasers]);

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

  return (
    <section className="relative z-10 flex min-h-0 flex-1 flex-col">
      <link rel="preload" as="image" href={speakerSrc} fetchPriority="high" />

      {/* Soft left fade only — a hard 58% cutoff plus backdrop-filter
          painted a lighting seam through the search pill. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-r from-[#3c1178]/50 via-[#4c1d95]/12 via-42% to-transparent lg:block"
      />

      {/* Mobile speaker — a photo band under the search card, the desktop hero paints it as its background */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#4c1d95]/65 via-[#3b1780]/10 to-[#2f1c6a]/55" />
      </div>

      <div className="hb-shell relative z-20 grid w-full flex-1 grid-cols-1 overflow-visible pt-3 pb-3 sm:pt-2 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:items-center lg:gap-4 lg:pb-2 xl:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
        <div className="relative z-30 w-full min-w-0 self-center overflow-visible lg:max-w-none lg:pb-6">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase sm:text-[12px]"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="font-heading mt-2 text-[clamp(1.7rem,4.2vw,4.25rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-white"
          >
            <span className="block">{headline}</span>
            <span className="mt-0.5 block text-white/90">{accent}</span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-3 w-full text-[14px] leading-relaxed text-white/78 sm:text-[15.5px] xl:text-[16.5px]"
          >
            {description}
          </motion.p>

          <motion.form
            onSubmit={onSearch}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="hb-search-pill relative z-30 mt-3 flex w-full max-w-none flex-col gap-2 rounded-[28px] p-2.5 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-1.5 lg:mt-6 lg:w-[min(158%,54rem)] xl:w-[min(170%,58rem)]"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 sm:px-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
                <Search className="size-4" aria-hidden />
              </span>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={reduceMotion ? TYPING_COPY : `${typed}|`}
                aria-label={TYPING_COPY}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white outline-none placeholder:text-[#d7c6ff] sm:py-1 sm:text-[16px]"
              />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <label className="relative min-w-0 flex-none">
                <span className="sr-only">Domain extension</span>
                <select
                  value={tld}
                  onChange={(e) => setTld(e.target.value)}
                  className="h-12 w-full min-w-[92px] appearance-none rounded-full border border-white/20 bg-white py-0 pr-8 pl-3.5 text-[14px] font-semibold text-slate-800 outline-none sm:h-12 sm:w-auto sm:pr-9 sm:pl-4"
                >
                  {tldChoices.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
              </label>
              <button
                type="submit"
                className="hb-search-cta inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-extrabold whitespace-nowrap transition sm:flex-none sm:px-6 sm:text-[14.5px]"
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
            aria-label="Popular domain extensions"
            className="relative z-30 mt-7 grid w-full grid-cols-2 gap-x-2 gap-y-5 sm:mt-8 sm:flex sm:flex-nowrap sm:items-center sm:gap-3 lg:w-[min(158%,54rem)] xl:w-[min(170%,58rem)]"
          >
            {teasers.map((item, index) => {
              const value = item.tld.startsWith(".")
                ? item.tld
                : `.${item.tld}`;
              const active = value === tld;
              const popular =
                value.toLowerCase() === ".com" ||
                (index === 0 &&
                  !teasers.some((row) => {
                    const tldValue = row.tld.startsWith(".")
                      ? row.tld
                      : `.${row.tld}`;
                    return tldValue.toLowerCase() === ".com";
                  }));
              const Icon = tldMark(value);
              return (
                <button
                  key={item.tld}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTld(value)}
                  className={cn(
                    "hb-tld-chip group relative isolate flex h-auto min-h-[52px] w-full shrink-0 flex-col items-center justify-center gap-1 overflow-visible rounded-[22px] px-2.5 py-2 whitespace-nowrap transition-[transform,box-shadow] duration-200 ease-out outline-none sm:h-[52px] sm:w-auto sm:flex-none sm:flex-row sm:justify-start sm:gap-2 sm:rounded-full sm:px-4 sm:py-0",
                    "focus-visible:ring-2 focus-visible:ring-violet-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    popular
                      ? "hb-tld-chip--popular"
                      : active
                        ? "hb-tld-chip--glass hb-tld-chip--active"
                        : "hb-tld-chip--glass",
                  )}
                >
                  {popular ? (
                    <span className="hb-tld-chip-badge absolute -top-3.5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-extrabold tracking-[0.07em] text-[#faf5ff] uppercase antialiased sm:text-[11.5px]">
                      <Crown
                        className="size-3 shrink-0 text-[#faf5ff]"
                        fill="currentColor"
                        aria-hidden
                      />
                      Most Popular
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "hidden size-8 shrink-0 items-center justify-center rounded-full sm:flex",
                      popular
                        ? "hb-tld-chip-icon--popular"
                        : "bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span
                    className="text-[13px] leading-none font-extrabold tracking-[-0.03em] text-white sm:text-[15px]"
                    translate="no"
                  >
                    {value}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "hidden h-3.5 w-px shrink-0 sm:block",
                      popular ? "bg-violet-200/50" : "bg-white/22",
                    )}
                  />
                  <span
                    className={cn(
                      "inline-flex items-baseline gap-1 text-[11.5px] leading-none font-bold tracking-[-0.01em] tabular-nums sm:gap-1.5 sm:text-[13.5px]",
                      popular ? "text-[#ede9fe]" : "text-[#d7c6ff]",
                    )}
                    translate="no"
                  >
                    {"originalUsd" in item &&
                    typeof item.originalUsd === "number" ? (
                      <span
                        className={cn(
                          "text-[10px] font-semibold line-through decoration-[1.5px] sm:text-[11.5px]",
                          popular
                            ? "text-violet-100/55 decoration-violet-100/65"
                            : "text-white/45 decoration-white/50",
                        )}
                      >
                        <CatalogPrice usd={item.originalUsd} />
                      </span>
                    ) : null}
                    {"usd" in item && typeof item.usd === "number" ? (
                      <span>
                        <CatalogPrice usd={item.usd} />
                        <span className="ml-px hidden text-[0.88em] font-semibold tracking-normal opacity-70 sm:inline">
                          /yr
                        </span>
                      </span>
                    ) : (
                      item.priceLabel
                    )}
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
