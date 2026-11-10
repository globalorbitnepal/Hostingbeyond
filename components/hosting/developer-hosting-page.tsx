"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Database,
  GitBranch,
  Globe2,
  Lock,
  Minus,
  Plus,
  Server,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { HostingPlansCream } from "@/components/hosting/hosting-plans-cream";
import { HostingProductPremiumHero } from "@/components/hosting/hosting-product-premium-hero";
import type {
  CmsDeveloperHostingContent,
  DeveloperFeatureIcon,
} from "@/lib/orbit/developer-hosting-content";
import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

const ICONS: Record<DeveloperFeatureIcon, typeof Zap> = {
  zap: Zap,
  shield: Shield,
  globe: Globe2,
  server: Server,
  terminal: Terminal,
  database: Database,
  git: GitBranch,
  lock: Lock,
};

function SectionHeading({
  eyebrow,
  heading,
  description,
  tone = "light",
}: {
  eyebrow: string;
  heading: string;
  description: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p
          className={cn(
            "text-[11px] font-extrabold tracking-[0.28em] uppercase",
            tone === "dark" ? "text-white/70" : "text-[#5b21b6]/80",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-heading mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.14] font-extrabold tracking-[-0.035em]",
          tone === "dark" ? "text-white" : "text-[#2f1c6a]",
        )}
      >
        {heading}
      </h2>
      {description ? (
        <p
          className={cn(
            "mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed font-medium sm:text-[16px]",
            tone === "dark" ? "text-white/80" : "text-slate-600",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function DeveloperHostingPageView({
  content,
  plans,
  productCheckoutSlug,
  stackLabel,
}: {
  content: CmsDeveloperHostingContent;
  plans: CmsHostingPlansContent;
  productCheckoutSlug: string;
  stackLabel: string;
}) {
  const reduce = useReducedMotion();
  const [openFaq, setOpenFaq] = useState(0);

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: {
            duration: 0.45,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  const benefits = content.benefits.filter((item) => item.visible !== false);
  const features = content.features.filter((item) => item.visible !== false);
  const available = features.filter((item) => item.available !== false);
  const unavailable = features.filter((item) => item.available === false);
  const useCases = content.useCases.filter((item) => item.visible !== false);
  const faqs = content.faqs.filter((item) => item.visible !== false);

  return (
    <>
      <HostingProductPremiumHero
        eyebrow={content.heroEyebrow}
        title={content.heroTitle}
        titleAccent={content.heroTitleAccent}
        description={content.heroDescription}
        promo={content.heroPromo}
        primaryLabel={content.heroPrimaryLabel}
        primaryHref={content.heroPrimaryHref}
        secondaryLabel={content.heroSecondaryLabel}
        secondaryHref={content.heroSecondaryHref}
        cardEyebrow={`${stackLabel} on HostingBeyond`}
        highlights={content.heroHighlights}
        cardSubline="Capabilities reflect the current platform — anything not available yet is listed openly below."
      />

      <HostingPlansCream
        plansContent={plans}
        eyebrow={content.pricingEyebrow}
        title={content.pricingTitle}
        titleAccent={content.pricingTitleAccent}
        description={content.pricingDescription}
        footnote={content.pricingNote}
        className="!pt-6 sm:!pt-8"
        productCheckoutSlug={productCheckoutSlug}
      />

      {/* Technology-specific benefits */}
      {benefits.length > 0 ? (
        <section className="hb-band-cream py-14 sm:py-18">
          <div className="hb-shell">
            <motion.div {...fade(0)}>
              <SectionHeading
                eyebrow={content.benefitsEyebrow}
                heading={content.benefitsHeading}
                description={content.benefitsDescription}
              />
            </motion.div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {benefits.map((item, index) => (
                <motion.article
                  key={item.id}
                  {...fade(0.04 * index)}
                  className="rounded-[22px] border border-white/90 bg-white/85 p-5 shadow-[0_14px_34px_-22px_rgba(47,28,106,0.28)]"
                >
                  <h3 className="text-[16px] font-extrabold text-[#2f1c6a]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* C. Verified features */}
      <section
        id="features"
        className="hb-band-purple scroll-mt-24 py-14 sm:py-18"
      >
        <div className="hb-shell">
          <motion.div {...fade(0)}>
            <SectionHeading
              eyebrow={content.featuresEyebrow}
              heading={content.featuresHeading}
              description={content.featuresDescription}
              tone="dark"
            />
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((item, index) => {
              const Icon = ICONS[item.icon] ?? Zap;
              return (
                <motion.article
                  key={item.id}
                  {...fade(0.03 * index)}
                  className="rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <Icon className="size-6 text-[#c4b5fd]" aria-hidden />
                  <h3 className="mt-3 text-[15.5px] font-extrabold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">
                    {item.description}
                  </p>
                </motion.article>
              );
            })}
          </div>

          {unavailable.length > 0 ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-[22px] border border-amber-300/30 bg-amber-400/10 p-5">
              <p className="text-[11px] font-extrabold tracking-[0.2em] text-amber-200 uppercase">
                Not available yet
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">
                We would rather tell you now than have you find out after
                ordering. These are not part of the current platform.
              </p>
              <ul className="mt-4 space-y-3">
                {unavailable.map((item) => (
                  <li key={item.id}>
                    <p className="text-[14px] font-bold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/75">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* D. Suitable use cases */}
      {useCases.length > 0 ? (
        <section className="hb-band-cream py-14 sm:py-18">
          <div className="hb-shell">
            <motion.div {...fade(0)}>
              <SectionHeading
                eyebrow={content.useCasesEyebrow}
                heading={content.useCasesHeading}
                description={content.useCasesDescription}
              />
            </motion.div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map((item, index) => (
                <motion.article
                  key={item.id}
                  {...fade(0.04 * index)}
                  className="rounded-[20px] border border-[#e9e4ff] bg-white p-5 shadow-[0_12px_30px_-22px_rgba(47,28,106,0.3)]"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#673de6] to-[#7c3aed] text-white">
                    <Check className="size-4" strokeWidth={3} aria-hidden />
                  </span>
                  <h3 className="mt-3 text-[15px] font-extrabold text-[#2f1c6a]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Plan selection guidance */}
      <section className="hb-band-cream py-14 sm:py-16">
        <div className="hb-shell mx-auto max-w-4xl">
          <motion.div {...fade(0)}>
            <SectionHeading
              eyebrow={content.comparisonEyebrow}
              heading={content.comparisonHeading}
              description={content.comparisonDescription}
            />
          </motion.div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {content.comparisonBullets.map((line, index) => (
              <motion.li
                key={line}
                {...fade(0.03 * index)}
                className="flex items-start gap-2.5 rounded-2xl border border-[#e9e4ff] bg-white px-4 py-3 text-[14px] leading-relaxed text-slate-700"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                {line}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* G. FAQ */}
      {faqs.length > 0 ? (
        <section id="faq" className="hb-band-cream scroll-mt-24 pb-16 sm:pb-20">
          <div className="hb-shell mx-auto max-w-3xl">
            <h2 className="font-heading text-center text-[clamp(1.6rem,3vw,2.3rem)] font-extrabold text-[#2f1c6a]">
              {content.faqHeading}
            </h2>
            <p className="mt-2 text-center text-[15px] text-slate-600">
              {content.faqDescription}
            </p>
            <div className="mt-8 space-y-2">
              {faqs.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "overflow-hidden rounded-[18px] border bg-white",
                      open ? "border-[#c7b8ff]" : "border-slate-200",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : index)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-[15px] font-bold text-[#2f1c6a]"
                    >
                      {item.question}
                      {open ? (
                        <Minus className="size-4 shrink-0" />
                      ) : (
                        <Plus className="size-4 shrink-0" />
                      )}
                    </button>
                    {open ? (
                      <p className="px-4 pb-4 text-[14px] leading-relaxed text-slate-600">
                        {item.answer}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* H. Final CTA */}
      <section className="hb-band-purple py-16 text-center text-white sm:py-20">
        <div className="hb-shell">
          <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold">
            {content.closingHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/85 sm:text-[16px]">
            {content.closingDescription}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={content.closingCtaHref}
              className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-extrabold text-[#2f1c6a]"
            >
              {content.closingCtaLabel}
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/35 px-6 text-[15px] font-bold text-white hover:bg-white/10"
            >
              Ask a question
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/** Re-exported for the JSON-LD component. */
export function developerFaqJsonLd(content: CmsDeveloperHostingContent) {
  const faqs = content.faqs.filter((item) => item.visible !== false);
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export { ChevronDown };
