"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CatalogPrice } from "@/components/i18n/localized-text";
import { heroTldOptions } from "@/config/domain-teasers";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { CmsHeroContent } from "@/lib/orbit/defaults";

const FALLBACK_TEASERS = [
  { tld: ".com", priceLabel: "$7.99/yr", usd: 7.99, visible: true },
  { tld: ".net", priceLabel: "$6.99/yr", usd: 6.99, visible: true },
  { tld: ".org", priceLabel: "$5.99/yr", usd: 5.99, visible: true },
  { tld: ".dev", priceLabel: "$3.99/yr", usd: 3.99, visible: true },
] as const;

function usdFromPriceLabel(label: string): number | undefined {
  if (!/\$|USD/i.test(label)) return undefined;
  const match = label.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : undefined;
}

const SCENE_FALLBACK = "/images/hero-speaker-v6.webp";
const TYPING_COPY = "Find the perfect domain for your brand";

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
        const fallbackUsd = FALLBACK_TEASERS.find(
          (row) => row.tld === tld,
        )?.usd;
        return {
          ...item,
          tld,
          usd: usdFromPriceLabel(item.priceLabel) ?? fallbackUsd,
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
            className="hb-search-pill relative z-30 mt-3 flex w-full max-w-none flex-col gap-2 rounded-[28px] border border-white/35 p-2.5 shadow-[0_22px_60px_rgba(15,23,42,0.24)] sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-2 lg:mt-6 lg:w-[min(158%,54rem)] xl:w-[min(170%,58rem)]"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 sm:px-4">
              <Search className="size-5 shrink-0 text-white/80" aria-hidden />
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={reduceMotion ? TYPING_COPY : `${typed}|`}
                aria-label={TYPING_COPY}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white outline-none placeholder:text-white/70 sm:py-1 sm:text-[16px]"
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
                className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-[13px] font-bold whitespace-nowrap text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-white/90 sm:flex-none sm:px-6 sm:text-[14.5px]"
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
            className="relative z-30 mt-4 grid w-full grid-cols-4 gap-1.5 sm:flex sm:w-auto sm:flex-nowrap sm:items-center sm:gap-2.5"
          >
            {teasers.map((item) => {
              const value = item.tld.startsWith(".")
                ? item.tld
                : `.${item.tld}`;
              const active = value === tld;
              return (
                <button
                  key={item.tld}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTld(value)}
                  className={cn(
                    "group relative isolate flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[16px] border px-1.5 py-2 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out outline-none sm:h-10 sm:flex-row sm:gap-0 sm:rounded-full sm:px-4 sm:py-0",
                    "focus-visible:ring-2 focus-visible:ring-white/85 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    active
                      ? "border-white bg-white shadow-[0_12px_28px_rgba(49,16,107,0.32),inset_0_1px_0_#fff]"
                      : "border-white/20 bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:border-white/40 hover:bg-white/[0.18]",
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent sm:inset-x-4"
                  />
                  <span
                    className={cn(
                      "truncate text-[13px] leading-none font-extrabold tracking-[-0.03em] sm:text-[14px]",
                      active ? "text-[#4c1d95]" : "text-white",
                    )}
                    translate="no"
                  >
                    {value}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "mx-2.5 hidden h-3 w-px shrink-0 sm:block",
                      active ? "bg-[#4c1d95]/18" : "bg-white/25",
                    )}
                  />
                  <span
                    className={cn(
                      "truncate text-[11px] leading-none font-semibold tracking-[-0.01em] tabular-nums sm:text-[12.5px]",
                      active ? "text-slate-500" : "text-white/78",
                    )}
                    translate="no"
                  >
                    {"usd" in item && typeof item.usd === "number" ? (
                      <>
                        <CatalogPrice usd={item.usd} />
                        <span className="ml-px text-[0.88em] font-medium tracking-normal opacity-65">
                          /yr
                        </span>
                      </>
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
