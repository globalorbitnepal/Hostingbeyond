"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Headphones, Lock, Search, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import { useLocale } from "@/components/locale/locale-provider";
import type { CmsHeroContent } from "@/lib/orbit/defaults";
import { translatePhrase } from "@/lib/i18n/phrases";

const trustIcons = {
  shield: ShieldCheck,
  lock: Lock,
  support: Headphones,
} as const;

export function HeroContent({ content }: { content?: CmsHeroContent }) {
  const reduceMotion = useReducedMotion();
  const { t, preferences } = useLocale();
  const [domain, setDomain] = useState("");

  const lang = preferences.language;
  const tx = (text: string) =>
    lang === "en" ? text : translatePhrase(lang, text);

  const eyebrow = content?.eyebrow
    ? tx(content.eyebrow)
    : lang === "en"
      ? ""
      : "";
  const headline = content?.headline ? tx(content.headline) : t.hero.headline;
  const accent = content?.headlineAccent
    ? tx(content.headlineAccent)
    : t.hero.headlineAccent;
  const description = content?.description
    ? tx(content.description)
    : t.hero.description;
  const placeholder = content?.searchPlaceholder
    ? tx(content.searchPlaceholder)
    : t.hero.searchPlaceholder;
  const bulkLabel = content?.bulkSearchLabel
    ? tx(content.bulkSearchLabel)
    : t.hero.bulkSearch;
  const searchLabel = content?.searchButtonLabel
    ? tx(content.searchButtonLabel)
    : t.hero.search;

  const trustItems =
    content?.trustItems && lang === "en"
      ? content.trustItems
      : content?.trustItems && lang !== "en"
        ? content.trustItems.map((item) => ({
            ...item,
            title: tx(item.title),
            subtitle: tx(item.subtitle),
          }))
        : [
            {
              title: t.hero.trustUptime,
              subtitle: t.hero.trustUptimeSub,
              icon: "shield",
            },
            {
              title: t.hero.trustSecure,
              subtitle: t.hero.trustSecureSub,
              icon: "lock",
            },
            {
              title: t.hero.trustSupport,
              subtitle: t.hero.trustSupportSub,
              icon: "support",
            },
          ];

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = domain.trim();
    window.location.href = query
      ? `${routes.domains}?q=${encodeURIComponent(query)}`
      : routes.domains;
  };

  return (
    <div className="relative z-20 w-full">
      {eyebrow ? (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-2 text-[11px] font-bold tracking-[0.22em] text-white/55 uppercase sm:mb-3"
        >
          {eyebrow}
        </motion.p>
      ) : null}

      <h1 className="text-[clamp(1.65rem,3.4vw+0.5rem,3.15rem)] leading-[1.06] tracking-[-0.04em] text-white">
        <motion.span
          initial={
            reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(6px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading block font-extrabold text-white drop-shadow-[0_2px_24px_rgb(0_0_0_/_0.35)] sm:whitespace-nowrap"
        >
          {headline}
        </motion.span>
        <motion.span
          initial={
            reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(6px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.16, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={
            reduceMotion
              ? "font-heading mt-0.5 block bg-gradient-to-r from-[#5BA8FF] via-[#8B7CFF] to-[#B06CFF] bg-clip-text font-extrabold text-transparent sm:whitespace-nowrap"
              : "hb-hero-gradient font-heading mt-0.5 block bg-clip-text font-extrabold text-transparent sm:whitespace-nowrap"
          }
        >
          {accent}
        </motion.span>
      </h1>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        className="mt-2.5 max-w-[34rem] text-[13px] leading-[1.5] font-medium tracking-[-0.01em] text-[#b7bfcf] sm:mt-3 sm:text-[14px] lg:text-[15px]"
      >
        {description}
      </motion.p>

      <motion.form
        onSubmit={onSearch}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.45 }}
        className="mt-4 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-white/12 bg-[rgba(8,12,28,0.78)] p-1.5 shadow-[0_12px_36px_rgb(0_0_0_/_0.35),inset_0_1px_0_rgb(255_255_255_/_0.06)] backdrop-blur-xl sm:mt-5"
      >
        <label htmlFor="domain-search" className="sr-only">
          {placeholder}
        </label>
        <input
          id="domain-search"
          type="text"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm tracking-[-0.01em] text-white outline-none placeholder:text-white/40 sm:py-3"
        />
        <Link
          href={routes.domains}
          className="hidden shrink-0 px-2 text-sm font-medium text-white/55 transition-colors duration-150 hover:text-white sm:inline"
        >
          {bulkLabel}
        </Link>
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 text-sm font-bold text-white transition duration-150 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hb-blue)] sm:h-11 sm:px-5"
        >
          <Search className="size-4" aria-hidden />
          {searchLabel}
        </button>
      </motion.form>

      <motion.ul
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.45 }}
        className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-4 sm:grid-cols-3 sm:gap-3"
      >
        {trustItems.map((item) => {
          const Icon =
            trustIcons[item.icon as keyof typeof trustIcons] ?? ShieldCheck;
          return (
            <li key={item.title} className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[#8ec5ff] sm:size-8">
                <Icon className="size-3.5" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block text-[12px] font-bold tracking-[-0.01em] text-white sm:text-[13px]">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-white/50">
                  {item.subtitle}
                </span>
              </span>
            </li>
          );
        })}
      </motion.ul>
    </div>
  );
}
