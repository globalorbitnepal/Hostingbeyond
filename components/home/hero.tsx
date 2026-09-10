"use client";

import { type FormEvent, useMemo, useState } from "react";
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

function SceneImage({ className }: { className?: string }) {
  return (
    <Image
      src={`${SCENE_SRC}?v=mix16`}
      alt=""
      fill
      priority
      unoptimized
      sizes="(max-width: 1024px) 100vw, 70vw"
      className={cn("scale-[1.04] object-cover object-[50%_6%]", className)}
    />
  );
}

export function HeroSection({ content }: { content?: CmsHeroContent }) {
  const reduceMotion = useReducedMotion();
  const [domain, setDomain] = useState("");

  const eyebrow = content?.eyebrow || "SIMPLE • SECURE • SCALABLE";
  const headline = content?.headline || "Host Your Ideas";
  const accent = (content?.headlineAccent || "Beyond Limits").replace(
    /\.$/,
    "",
  );
  const description =
    content?.description ||
    "Reliable hosting, powerful infrastructure and the freedom to build what's next.";
  const searchPlaceholder =
    content?.searchPlaceholder || "Find your perfect domain name...";
  const searchButtonLabel = content?.searchButtonLabel || "Search";

  const teasers = useMemo(() => {
    const fromCms = (content?.domainPricing ?? []).filter(
      (item) => item.visible !== false && item.tld.trim(),
    );
    const preferred = [".com", ".net", ".org", ".dev"];
    if (fromCms.length) {
      const normalized = fromCms.map((item) => ({
        ...item,
        tld: item.tld.startsWith(".") ? item.tld : `.${item.tld}`,
      }));
      const picked = preferred
        .map((tld) => normalized.find((item) => item.tld === tld))
        .filter(Boolean) as typeof normalized;
      if (picked.length >= 4) return picked.slice(0, 4);
      return normalized.slice(0, 4);
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

  return (
    <section className="relative z-10 flex min-h-0 flex-1 flex-col">
      {/* Desktop scene — zoom locked */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 bottom-[58px] z-[1] hidden overflow-hidden lg:left-[36%] lg:block lg:w-auto"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, #000 5.5%, #000 93%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 6%, #000 100%)",
            WebkitMaskComposite: "source-in",
            maskImage:
              "linear-gradient(to right, transparent 0%, #000 5.5%, #000 93%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 6%, #000 100%)",
            maskComposite: "intersect",
          }}
        >
          <SceneImage />
        </motion.div>
        <div className="absolute inset-y-0 left-0 z-[2] w-[2.2%] bg-gradient-to-r from-[#b5d3f2] from-[40%] to-transparent" />
        <div className="absolute inset-x-0 top-0 z-[2] h-[4%] bg-gradient-to-b from-[#b5d3f2] from-[35%] to-transparent" />
        <div className="absolute inset-y-0 right-0 z-[2] w-[2.8%] bg-gradient-to-l from-[#b5d3f2] from-[40%] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-[5%] bg-gradient-to-t from-[#b5d3f2] via-[#b5d3f2]/30 to-transparent" />
      </div>

      <div className="relative z-20 mx-auto grid w-full max-w-[1360px] flex-1 grid-cols-1 px-[4%] pt-3 pb-3 sm:px-[3%] sm:pt-2 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:pb-2">
        <div className="relative max-w-[520px] self-center lg:pb-6">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase sm:text-[12px]"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="font-heading mt-2 text-[clamp(1.85rem,7.2vw,3.55rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-slate-950"
          >
            <span className="block">{headline}</span>
            <span className="mt-0.5 block bg-gradient-to-r from-[#7c3aed] via-[#4f46e5] to-[#2563eb] bg-clip-text text-transparent">
              {accent}
            </span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-3 max-w-[430px] text-[14px] leading-relaxed text-slate-600 sm:text-[15.5px]"
          >
            {description}
          </motion.p>

          <motion.form
            onSubmit={onSearch}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 flex w-full max-w-[500px] flex-col gap-1.5 rounded-[22px] border border-white/80 bg-white/90 p-2 shadow-[0_14px_40px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-1.5 sm:rounded-full sm:p-1.5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-3">
              <Search
                className="size-[18px] shrink-0 text-slate-400"
                aria-hidden
              />
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent py-2 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 sm:py-0 sm:text-[15px]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="relative min-w-0 flex-1 sm:flex-none">
                <span className="sr-only">Domain extension</span>
                <select
                  value={tld}
                  onChange={(e) => setTld(e.target.value)}
                  className="h-11 w-full appearance-none rounded-full border border-slate-200/80 bg-slate-50/90 py-0 pr-8 pl-3 text-[13px] font-semibold text-slate-700 outline-none sm:h-10 sm:w-auto"
                >
                  {tldChoices.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-4 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition hover:brightness-105 sm:h-10 sm:flex-none sm:px-5"
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
            className="mt-3 flex max-w-[500px] [scrollbar-width:none] flex-nowrap items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
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
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200/90 bg-white hover:border-sky-200",
                  )}
                >
                  <span className="font-extrabold text-[#2563eb]">{value}</span>
                  <span className="font-bold text-slate-600">
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
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px] overflow-hidden rounded-[28px]">
            <SceneImage />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-[#b5d3f2] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[10%] bg-gradient-to-l from-[#b5d3f2] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-[#b5d3f2] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-t from-[#b5d3f2] to-transparent" />
          </div>
        </motion.div>

        <div className="hidden lg:block" aria-hidden />
      </div>

      {/* Slim feature glass bar */}
      <div className="relative z-30 mt-auto shrink-0 bg-[#b5d3f2] px-[3%] pt-1 pb-4 sm:px-[2.5%] sm:pb-4">
        <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-b from-transparent to-[#b5d3f2]" />
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[22px] border border-[#7aadd8]/70 bg-[linear-gradient(180deg,rgba(165,200,232,0.92)_0%,rgba(181,211,242,0.82)_48%,rgba(170,205,236,0.88)_100%)] shadow-[0_8px_24px_rgba(60,120,170,0.16)] backdrop-blur-xl lg:rounded-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(140,195,235,0.4),transparent_58%)] lg:rounded-full"
          />
          <div className="relative">
            <HeroFeatureBar />
          </div>
        </div>
      </div>
    </section>
  );
}
