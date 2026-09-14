"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { heroTldOptions } from "@/config/domain-teasers";
import { routes } from "@/config/routes";
import { HeroFeatureBar } from "@/components/home/hero-feature-bar";
import { cn } from "@/lib/utils";
import type { CmsHeroContent } from "@/lib/orbit/defaults";

const FALLBACK_TEASERS = [
  { tld: ".com", priceLabel: "$7.99/yr", visible: true },
  { tld: ".net", priceLabel: "$6.99/yr", visible: true },
  { tld: ".org", priceLabel: "$5.99/yr", visible: true },
  { tld: ".dev", priceLabel: "$3.99/yr", visible: true },
] as const;

const SCENE_SRC = "/images/hero-speaker-scene-v3.png";
const TYPING_COPY = "Find the perfect domain for your brand";

function SceneImage({ src, className }: { src?: string; className?: string }) {
  const imageSrc = src?.trim() || SCENE_SRC;
  return (
    <Image
      src={imageSrc}
      alt=""
      fill
      priority
      unoptimized
      sizes="(max-width: 1024px) 100vw, 72vw"
      className={cn(
        "scale-[1.1] object-cover object-[48%_10%] contrast-[1.06] saturate-[1.12]",
        className,
      )}
    />
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
      return fromCms.map((item) => ({
        ...item,
        tld: item.tld.startsWith(".") ? item.tld : `.${item.tld}`,
      }));
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

  const sceneSrc =
    content?.speakerImage?.trim() ||
    content?.backgroundImage?.trim() ||
    SCENE_SRC;

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = domain.trim().replace(/^\.+/, "");
    const query = raw ? (raw.includes(".") ? raw : `${raw}${tld}`) : "";
    window.location.href = query
      ? `${routes.domains}?q=${encodeURIComponent(query)}`
      : routes.domains;
  };

  return (
    <section className="relative z-10 flex min-h-0 flex-1 flex-col">
      {/* Desktop scene — zoom locked */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] hidden overflow-hidden lg:inset-y-0 lg:top-0 lg:right-0 lg:bottom-0 lg:left-[22%] lg:block xl:left-[20%]"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, #000 22%, #000 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, #000 22%, #000 100%)",
          }}
        >
          <SceneImage src={sceneSrc} />
        </motion.div>
        <div
          className="absolute inset-y-0 left-0 z-[2] w-[38%]"
          style={{
            background:
              "linear-gradient(90deg, #673de6 0%, rgba(103,61,230,0.72) 28%, rgba(103,61,230,0) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 z-[2] h-[8%] bg-gradient-to-b from-[#6d28d9]/50 to-transparent" />
        <div className="absolute top-0 right-0 z-[2] h-[20%] w-[24%] bg-gradient-to-bl from-[#6d28d9]/70 to-transparent" />
        <div className="absolute inset-y-0 right-0 z-[2] w-[5%] bg-gradient-to-l from-[#6d28d9]/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-[14%] bg-gradient-to-t from-[#4c1d95] via-[#673de6]/70 to-transparent" />
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
            className="relative z-30 mt-6 flex w-full max-w-none flex-col gap-2 rounded-[28px] border border-white/40 bg-white/22 p-2.5 shadow-[0_22px_60px_rgba(15,23,42,0.24)] backdrop-blur-2xl sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-2 lg:w-[min(158%,54rem)] xl:w-[min(170%,58rem)]"
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
            <div className="flex items-center gap-2">
              <label className="relative min-w-0 flex-1 sm:flex-none">
                <span className="sr-only">Domain extension</span>
                <select
                  value={tld}
                  onChange={(e) => setTld(e.target.value)}
                  className="h-12 w-full appearance-none rounded-full border border-white/20 bg-white py-0 pr-9 pl-4 text-[14px] font-semibold text-slate-800 outline-none sm:h-12 sm:w-auto"
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
                className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-5 text-[14.5px] font-bold text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-white/90 sm:flex-none sm:px-6"
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
            className="mt-3 flex w-full [scrollbar-width:none] flex-nowrap items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
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
                  onClick={() => setTld(value)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition sm:px-3.5 sm:text-[13px]",
                    active
                      ? "border-white bg-white"
                      : "border-white/25 bg-white/10 hover:bg-white/20",
                  )}
                >
                  <span
                    className={cn(
                      "font-extrabold",
                      active ? "text-[#673de6]" : "text-white",
                    )}
                  >
                    {value}
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      active ? "text-slate-700" : "text-white/80",
                    )}
                  >
                    {item.priceLabel}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile speaker — clear, uncropped, below copy */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="relative mt-5 w-full lg:hidden"
          aria-hidden
        >
          <div className="relative aspect-[5/4] w-full overflow-hidden">
            <SceneImage src={sceneSrc} />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[#673de6] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[#673de6] to-transparent" />
          </div>
        </motion.div>

        <div className="hidden lg:block" aria-hidden />
      </div>

      {/* Slim feature glass bar */}
      <div className="relative z-30 mt-auto shrink-0 pt-1 pb-4 sm:pb-4">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#4c1d95] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-b from-transparent to-[#673de6]/25" />
        <div className="hb-shell">
          <div className="relative w-full overflow-hidden rounded-[22px] border border-white/25 bg-white/92 shadow-[0_8px_24px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:rounded-full">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(103,61,230,0.08),transparent_58%)] lg:rounded-full"
            />
            <div className="relative">
              <HeroFeatureBar bar={content?.featureBar} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
