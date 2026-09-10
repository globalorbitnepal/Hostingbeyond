"use client";

import { type FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Cloud, Globe2, Mail, Server } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { priceIdForProduct } from "@/config/products";
import { routes } from "@/config/routes";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { CmsProductOffer, CmsProductsContent } from "@/lib/orbit/defaults";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { DomainVisual, EmailVisual, HostingVisual } from "./product-visuals";

function HostingCardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.5 16.5a4 4 0 0 1 .4-8 5.2 5.2 0 0 1 10.1 1.4 3.3 3.3 0 0 1 1.5 6.1H7.5z" />
      <path d="M8.2 12.2h7.6M8.2 14.2h7.6M8.2 16.2h7.6" />
      <circle cx="9.1" cy="12.2" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="9.1" cy="14.2" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="9.1" cy="16.2" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  );
}

const icons = {
  domain: Globe2,
  email: Mail,
  hosting: Cloud,
} as const;

const accentStyles = {
  blue: {
    card: "border-[#0a84ff]/40 shadow-[0_0_0_1px_rgb(10_132_255_/_0.12),0_18px_48px_rgb(0_0_0_/_0.42)] hover:border-[#0a84ff]/70 hover:shadow-[0_0_0_1px_rgb(10_132_255_/_0.28),0_22px_56px_rgb(0_0_0_/_0.48),0_0_40px_rgb(10_132_255_/_0.12)]",
    iconWrap: "border-[#0a84ff]/45 bg-[#0a84ff]/12 text-[#7cc4ff]",
    badge: "border-[#0a84ff]/45 bg-[#0a84ff]/10 text-[#9ad0ff]",
    title: "text-white",
    price: "text-[#2f9bff]",
    chip: "border-[#0a84ff]/40 bg-[#071428] text-[#9ad0ff]",
    check: "text-[#2f9bff]",
    cta: "border-[#0a84ff]/55 text-[#7cc4ff] hover:bg-[#0a84ff]/10",
    search: "bg-[#0a84ff]",
  },
  purple: {
    card: "border-[#a855f7]/40 shadow-[0_0_0_1px_rgb(168_85_247_/_0.12),0_18px_48px_rgb(0_0_0_/_0.42)] hover:border-[#a855f7]/70 hover:shadow-[0_0_0_1px_rgb(168_85_247_/_0.28),0_22px_56px_rgb(0_0_0_/_0.48),0_0_40px_rgb(168_85_247_/_0.12)]",
    iconWrap: "border-[#a855f7]/45 bg-[#a855f7]/12 text-[#d8b4fe]",
    badge: "border-[#a855f7]/45 bg-[#a855f7]/10 text-[#d8b4fe]",
    title:
      "bg-gradient-to-r from-white to-[#c084fc] bg-clip-text text-transparent",
    price: "text-[#c084fc]",
    chip: "border-[#a855f7]/40 bg-[#140a22] text-[#d8b4fe]",
    check: "text-[#c084fc]",
    cta: "border-[#a855f7]/55 text-[#d8b4fe] hover:bg-[#a855f7]/10",
    search: "bg-[#a855f7]",
  },
  cyan: {
    card: "border-[#2f9bff]/45 shadow-[0_0_0_1px_rgb(47_155_255_/_0.14),0_18px_48px_rgb(0_0_0_/_0.42)] hover:border-[#2f9bff]/75 hover:shadow-[0_0_0_1px_rgb(47_155_255_/_0.3),0_22px_56px_rgb(0_0_0_/_0.48),0_0_40px_rgb(47_155_255_/_0.14)]",
    iconWrap:
      "border-[#2f9bff]/50 bg-[#2f9bff]/12 text-[#7cc4ff] shadow-[0_0_18px_rgb(47_155_255_/_0.25)]",
    badge: "border-[#2f9bff]/50 bg-[#2f9bff]/10 text-[#9ad0ff]",
    title: "text-white",
    price: "text-[#2f9bff]",
    chip: "border-[#2f9bff]/45 bg-[#071428] text-[#9ad0ff]",
    check: "text-[#2f9bff]",
    cta: "border-[#2f9bff]/55 text-[#7cc4ff] hover:bg-[#2f9bff]/10",
    search: "bg-[#2f9bff]",
  },
} as const;

function ProductCard({
  offer,
  index,
  priceLabel,
  searchLabel,
}: {
  offer: CmsProductOffer;
  index: number;
  priceLabel: string;
  searchLabel: string;
}) {
  const reduceMotion = useReducedMotion();
  const [domain, setDomain] = useState("");
  const styles = accentStyles[offer.accent] ?? accentStyles.blue;
  const Icon =
    offer.id === "hosting"
      ? HostingCardIcon
      : (icons[offer.id as keyof typeof icons] ??
        (offer.accent === "purple"
          ? Mail
          : offer.accent === "cyan"
            ? Server
            : Globe2));

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = domain.trim();
    window.location.href = query
      ? `${routes.domains}?q=${encodeURIComponent(query)}`
      : offer.ctaHref || routes.domains;
  };

  const titleParts = offer.title.trim().split(/\s+/);
  const splitHostingTitle =
    offer.id === "hosting" && titleParts.length >= 2
      ? {
          first: titleParts.slice(0, -1).join(" "),
          last: titleParts[titleParts.length - 1],
        }
      : null;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        delay: 0.06 + index * 0.08,
        duration: 0.48,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[22px] border bg-[rgba(12,20,40,0.55)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-[box-shadow,border-color,transform] duration-200 sm:p-6",
        styles.card,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border",
              styles.iconWrap,
            )}
          >
            {offer.iconUrl ? (
              <Image
                src={offer.iconUrl}
                alt=""
                width={28}
                height={28}
                unoptimized={isRuntimeMediaSrc(offer.iconUrl)}
                className="size-7 object-contain"
              />
            ) : (
              <Icon className="size-5" strokeWidth={1.8} />
            )}
          </span>
          <div className="min-w-0">
            <h3
              className={cn(
                "text-[15px] font-extrabold tracking-[0.1em] uppercase",
                styles.title,
              )}
            >
              {splitHostingTitle ? (
                <>
                  <span className="text-white">{splitHostingTitle.first} </span>
                  <span className="text-[#2f9bff] drop-shadow-[0_0_12px_rgb(47_155_255_/_0.55)]">
                    {splitHostingTitle.last}
                  </span>
                </>
              ) : (
                offer.title
              )}
            </h3>
            {offer.subtitle ? (
              <p className="mt-1 text-[11px] leading-snug text-[var(--hb-muted)]">
                {offer.subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {offer.badge ? (
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] uppercase",
              styles.badge,
            )}
          >
            {offer.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span
            className={cn(
              "text-[2.45rem] leading-none font-extrabold tracking-tight tabular-nums",
              styles.price,
            )}
          >
            {priceLabel}
          </span>
          {offer.priceSuffix ? (
            <span className="text-sm font-semibold text-white/55">
              {offer.priceSuffix}
            </span>
          ) : null}
        </p>
        {offer.highlight || offer.priceLabel ? (
          <span
            className={cn(
              "mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide uppercase",
              styles.chip,
            )}
          >
            {offer.highlight || offer.priceLabel}
          </span>
        ) : null}
      </div>

      <div className="relative mt-5 flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
        <ul className="min-w-0 flex-1 space-y-2.5">
          {offer.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-current/30 bg-current/10",
                  styles.check,
                )}
              >
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              <span className="text-[12.5px] leading-snug font-medium text-white/88">
                {feature}
              </span>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none relative mx-auto w-full max-w-[200px] shrink-0 sm:mx-0 sm:w-[46%] sm:max-w-none sm:self-center">
          {offer.illustrationUrl ? (
            <div className="relative mx-auto h-[170px] w-full max-w-[180px] sm:h-[190px]">
              <Image
                src={offer.illustrationUrl}
                alt=""
                fill
                unoptimized={isRuntimeMediaSrc(offer.illustrationUrl)}
                className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                sizes="200px"
              />
            </div>
          ) : (
            <div className="transition-transform duration-300 group-hover:scale-[1.04]">
              {offer.id === "domain" ? <DomainVisual /> : null}
              {offer.id === "email" ? <EmailVisual /> : null}
              {offer.id === "hosting" ? <HostingVisual /> : null}
              {!["domain", "email", "hosting"].includes(offer.id) ? (
                offer.accent === "purple" ? (
                  <EmailVisual />
                ) : offer.accent === "cyan" ? (
                  <HostingVisual />
                ) : (
                  <DomainVisual />
                )
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-3 pt-5">
        <Link
          href={offer.ctaHref}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center rounded-2xl border text-sm font-bold transition-all duration-200",
            styles.cta,
          )}
        >
          {offer.ctaLabel}
          <span aria-hidden className="ml-1">
            →
          </span>
        </Link>

        {offer.searchEnabled ? (
          <form
            onSubmit={onSearch}
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/45 p-1.5"
          >
            <label htmlFor={`product-domain-${offer.id}`} className="sr-only">
              {offer.searchPlaceholder || "Enter your domain name"}
            </label>
            <input
              id={`product-domain-${offer.id}`}
              type="text"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder={offer.searchPlaceholder || "Enter your domain name"}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35"
            />
            <button
              type="submit"
              className={cn(
                "inline-flex h-10 shrink-0 items-center rounded-xl px-4 text-sm font-bold text-white transition hover:brightness-110",
                styles.search,
              )}
            >
              {offer.searchButtonLabel || searchLabel}
            </button>
          </form>
        ) : null}
      </div>
    </motion.article>
  );
}

function localizeOffer(
  offer: CmsProductOffer,
  products: Dictionary["products"],
  useCms: boolean,
): CmsProductOffer {
  if (useCms) return offer;

  if (offer.id === "domain") {
    return {
      ...offer,
      title: products.domainTitle,
      badge: products.domainBadge,
      subtitle: "",
      priceSuffix: products.perYear,
      highlight: products.domainHighlight,
      priceLabel: "",
      ctaLabel: products.domainCta,
      searchPlaceholder: products.domainSearchPlaceholder,
      features: products.domainFeatures,
    };
  }

  if (offer.id === "email") {
    return {
      ...offer,
      title: products.emailTitle,
      badge: products.emailBadge,
      subtitle: products.emailSubtitle,
      priceSuffix: products.perMonth,
      highlight: "",
      priceLabel: products.perMailbox,
      ctaLabel: products.emailCta,
      features: products.emailFeatures,
    };
  }

  if (offer.id === "hosting") {
    return {
      ...offer,
      title: products.hostingTitle,
      badge: products.hostingBadge,
      subtitle: products.hostingSubtitle,
      priceSuffix: products.perMonth,
      highlight: "",
      priceLabel: products.startingPlan,
      ctaLabel: products.hostingCta,
      features: products.hostingFeatures,
    };
  }

  return offer;
}

export function ProductsSection({ content }: { content?: CmsProductsContent }) {
  const reduceMotion = useReducedMotion();
  const { t, formatPrice, preferences, isPending } = useLocale();
  const useCms = preferences.language === "en" && Boolean(content);

  const eyebrow = useCms
    ? (content?.eyebrow ?? t.products.eyebrow)
    : t.products.eyebrow;
  const title = useCms
    ? (content?.title ?? t.products.title)
    : t.products.title;
  const titleAccent = useCms
    ? (content?.titleAccent ?? t.products.titleAccent)
    : t.products.titleAccent;
  const description = useCms
    ? (content?.description ?? t.products.description)
    : t.products.description;

  const offers = useMemo(() => {
    const list = (content?.offers ?? []).filter(
      (offer) => offer.visible !== false,
    );
    return [...list]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((offer) => localizeOffer(offer, t.products, useCms));
  }, [content?.offers, t.products, useCms]);

  return (
    <section
      id="products"
      className="relative isolate overflow-hidden bg-[#07122a] px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-8"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-48 w-[70%] -translate-x-1/2 bg-[radial-gradient(ellipse,rgb(10_132_255_/_0.08),transparent_70%)] blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase backdrop-blur-md"
          >
            {eyebrow}
          </motion.div>

          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.04, duration: 0.45 }}
            className="font-heading mt-4 text-[2rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-white sm:text-[2.55rem] lg:text-[3.05rem]"
          >
            {title}
            <br />
            <span className="bg-gradient-to-r from-[#22d3ee] via-[#5b8cff] to-[#a855f7] bg-clip-text text-transparent">
              {titleAccent}
            </span>
          </motion.h2>

          {description ? (
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-[#aab2c5] sm:text-[15px]"
            >
              {description}
            </motion.p>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-8 grid grid-cols-1 items-stretch gap-5 transition-opacity duration-150 sm:mt-7 lg:mt-8 lg:grid-cols-3 lg:gap-5",
            isPending && "opacity-70",
          )}
        >
          {offers.map((offer, index) => {
            const priceId = priceIdForProduct(offer.id);
            const localized = formatPrice(priceId);
            const priceLabel =
              offer.priceOverride?.trim() && preferences.currency === "USD"
                ? offer.priceOverride.trim()
                : localized;
            return (
              <ProductCard
                key={offer.id}
                offer={offer}
                index={index}
                priceLabel={priceLabel}
                searchLabel={t.hero.search}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
