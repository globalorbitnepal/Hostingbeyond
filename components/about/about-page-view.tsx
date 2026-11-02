import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Cloud,
  Compass,
  Gauge,
  Globe2,
  Handshake,
  Headphones,
  Lock,
  Mail,
  MapPin,
  Server,
  Shield,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import type {
  CmsAboutPageContent,
  CmsAboutProduct,
  CmsAboutValue,
} from "@/lib/orbit/about-page-content";
import { cn } from "@/lib/utils";

const VALUE_ICONS: Record<NonNullable<CmsAboutValue["icon"]>, typeof Shield> = {
  shield: Shield,
  scale: Award,
  handshake: Handshake,
  spark: Sparkles,
  gauge: Gauge,
  compass: Compass,
};

const PRODUCT_ICONS: Record<
  NonNullable<CmsAboutProduct["icon"]>,
  typeof Server
> = {
  hosting: Server,
  domains: Globe2,
  email: Mail,
  cloud: Cloud,
  migration: TrendingUp,
  ai: Sparkles,
  ssl: Lock,
};

function SectionHead({
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-[11px] font-extrabold tracking-[0.26em] uppercase sm:text-[12px]",
            tone === "light" ? "text-[#c4b5fd]" : "text-[#5b21b6]/80",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.65rem)] leading-[1.12] font-extrabold tracking-[-0.04em]",
          tone === "light" ? "text-white" : "text-[#1e1b4b]",
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={cn(
            "mt-4 text-[15px] leading-relaxed sm:text-[16px]",
            align === "center" ? "mx-auto" : "",
            tone === "light" ? "text-white/75" : "text-slate-600",
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

export function AboutPageView({ content }: { content: CmsAboutPageContent }) {
  const heroFacts = content.heroCardFacts.filter((f) => f.visible !== false);
  const stats = content.stats.filter((s) => s.visible !== false);
  const usaFacts = content.usaFacts.filter((f) => f.visible !== false);
  const values = content.values.filter((v) => v.visible !== false);
  const products = content.products.filter((p) => p.visible !== false);
  const trustItems = content.trustItems.filter((t) => t.visible !== false);
  const governance = content.governanceItems.filter((g) => g.visible !== false);
  const milestones = content.milestones.filter(
    (m) => m.visible !== false && m.title.trim(),
  );
  const faqs = content.faqs.filter((f) => f.visible !== false);
  const team = content.team.filter((t) => t.visible !== false && t.name.trim());

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="hb-band-purple relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_14%_-10%,rgba(255,255,255,0.2),transparent_44%),radial-gradient(ellipse_at_88%_42%,rgba(56,189,248,0.22),transparent_44%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:56px_56px] opacity-[0.12]"
        />
        <div className="hb-shell relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.18em] uppercase">
              <Building2 className="size-3.5 text-[#a5f3fc]" aria-hidden />
              {content.heroEyebrow}
            </p>
            <h1 className="font-heading mt-5 text-[clamp(2.1rem,4.7vw,3.75rem)] leading-[1.03] font-extrabold tracking-[-0.045em]">
              {content.heroTitle}{" "}
              <span className="bg-gradient-to-r from-[#a5f3fc] via-[#ddd6fe] to-[#fbcfe8] bg-clip-text text-transparent">
                {content.heroTitleAccent}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/80 sm:text-[16.5px]">
              {content.heroDescription}
            </p>
            <ul className="mt-6 space-y-2.5">
              {content.heroBullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-2.5 text-[14.5px] leading-snug text-white/85"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-emerald-300"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={content.heroPrimaryHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-extrabold text-[#3b1d8f] shadow-[0_14px_34px_-16px_rgba(0,0,0,0.6)] transition hover:bg-violet-50"
              >
                {content.heroPrimaryLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={content.heroSecondaryHref}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/35 px-6 text-[15px] font-bold text-white transition hover:bg-white/10"
              >
                {content.heroSecondaryLabel}
              </Link>
            </div>
            <p className="mt-4 text-[12.5px] font-medium text-white/60">
              {content.heroGuarantee}
            </p>
          </div>

          {/* Company identity card — CSS only */}
          <div className="relative mx-auto w-full max-w-[430px]">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[36px] bg-[radial-gradient(circle_at_50%_30%,rgba(165,243,252,0.26),transparent_62%)] blur-2xl"
            />
            <div className="relative rounded-[24px] border border-white/25 bg-white/12 p-1.5 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.7)] backdrop-blur-md">
              <div className="rounded-[18px] bg-[linear-gradient(155deg,#f8fafc_0%,#eef2ff_100%)] p-5 text-[#1e1b4b]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10.5px] font-extrabold tracking-[0.18em] text-[#673de6] uppercase">
                      {content.heroCardTitle}
                    </p>
                    <p className="font-heading mt-1.5 text-[17px] leading-tight font-extrabold tracking-[-0.02em]">
                      {content.companyLegalName}
                    </p>
                    <p className="mt-0.5 text-[11.5px] font-semibold text-slate-500">
                      {content.companyEntityType}
                    </p>
                  </div>
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <BadgeCheck className="size-5" aria-hidden />
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#673de6]/10 px-2.5 py-1 text-[10.5px] font-bold text-[#4c1d95]">
                    <MapPin className="size-3" aria-hidden />
                    {content.headquartersLine}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d9488]/10 px-2.5 py-1 text-[10.5px] font-bold text-[#0f766e]">
                    <Globe2 className="size-3" aria-hidden />
                    {content.servingLine}
                  </span>
                </div>

                <dl className="mt-4 divide-y divide-slate-200/80 border-t border-slate-200/80">
                  {heroFacts.map((fact) => (
                    <div
                      key={fact.id}
                      className="flex items-start justify-between gap-3 py-2.5"
                    >
                      <dt className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                        {fact.label}
                      </dt>
                      <dd className="max-w-[58%] text-right text-[12.5px] font-extrabold text-[#1e1b4b]">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-3 border-t border-slate-200/80 pt-3 text-[10.5px] leading-relaxed font-medium text-slate-500">
                  {content.heroCardNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────── */}
      {stats.length > 0 ? (
        <section className="relative bg-white">
          <div className="hb-shell">
            <div className="mx-auto -mt-px grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-b-[26px] border-x border-b border-slate-200/80 bg-slate-200/70 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.id} className="bg-white px-4 py-6 text-center">
                  <p className="font-heading text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold tracking-tight text-[#2f1c6a]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug font-bold text-slate-600">
                    {stat.label}
                  </p>
                  {stat.hint ? (
                    <p className="mt-1 text-[10.5px] leading-snug font-medium text-slate-400">
                      {stat.hint}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mx-auto mt-8 max-w-2xl text-center">
              {content.statsHeading ? (
                <p className="text-[11px] font-extrabold tracking-[0.24em] text-[#5b21b6]/70 uppercase">
                  {content.statsHeading}
                </p>
              ) : null}
              {content.statsIntro ? (
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                  {content.statsIntro}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── Mission / Vision ─────────────────────────────────────── */}
      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell grid gap-5 lg:grid-cols-2">
          <article className="flex flex-col rounded-[24px] border border-white/90 bg-white/90 p-6 shadow-[0_16px_48px_-32px_rgba(47,28,106,0.5)] backdrop-blur-sm sm:p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#673de6] to-[#7c3aed] text-white">
              <Target className="size-5" aria-hidden />
            </span>
            <h2 className="font-heading mt-4 text-[clamp(1.35rem,2.4vw,1.75rem)] font-extrabold tracking-[-0.02em] text-[#1e1b4b]">
              {content.missionTitle}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              {content.missionBody}
            </p>
            <ul className="mt-5 space-y-2.5 border-t border-slate-200/80 pt-4">
              {content.missionPoints.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-[13.5px] leading-snug font-medium text-slate-700"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[#673de6]"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
          </article>

          <article className="flex flex-col rounded-[24px] border border-[#673de6]/20 bg-[linear-gradient(160deg,#f5f3ff_0%,#eef2ff_100%)] p-6 shadow-[0_16px_48px_-32px_rgba(47,28,106,0.5)] sm:p-8">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-[#673de6] shadow-sm">
              <Compass className="size-5" aria-hidden />
            </span>
            <h2 className="font-heading mt-4 text-[clamp(1.35rem,2.4vw,1.75rem)] font-extrabold tracking-[-0.02em] text-[#1e1b4b]">
              {content.visionTitle}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              {content.visionBody}
            </p>
            <ul className="mt-5 space-y-2.5 border-t border-[#673de6]/15 pt-4">
              {content.visionPoints.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-[13.5px] leading-snug font-medium text-slate-700"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-emerald-600"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ─── USA company ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(103,61,230,0.13),transparent_72%)]"
        />
        <div className="hb-shell relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.26em] text-[#5b21b6]/80 uppercase sm:text-[12px]">
              {content.usaEyebrow}
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.3vw,2.55rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#1e1b4b]">
              {content.usaTitle}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
              {content.usaBody}
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">
              {content.usaBodySecondary}
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {content.usaBullets.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-[13px] leading-snug font-semibold text-slate-700"
                >
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-emerald-600"
                    strokeWidth={3}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-[#673de6]/20 bg-[linear-gradient(160deg,#2f1c6a_0%,#4c1d95_58%,#1e3a8a_100%)] p-6 text-white shadow-[0_24px_64px_-34px_rgba(47,28,106,0.8)] sm:p-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-extrabold tracking-[0.16em] uppercase">
              <MapPin className="size-3.5 text-[#a5f3fc]" aria-hidden />
              Company registry
            </p>
            <dl className="mt-5 space-y-3.5">
              {usaFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="flex items-baseline justify-between gap-4 border-b border-white/12 pb-3 last:border-0 last:pb-0"
                >
                  <dt className="text-[11px] font-bold tracking-wide text-white/55 uppercase">
                    {fact.label}
                  </dt>
                  <dd className="text-right text-[13.5px] font-extrabold text-white">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-[11.5px] leading-relaxed font-medium text-white/65">
              {content.companyFoundedLine} · {content.servingLine}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Story ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eef2ff_0%,#f5f3ff_100%)] py-16 sm:py-20">
        <div className="hb-shell grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <SectionHead
              eyebrow="OUR STORY"
              title={content.storyTitle}
              intro={content.storyIntro}
              align="left"
            />
            <div className="mt-6 space-y-4">
              {content.storyParagraphs.map((paragraph, index) => (
                <div key={index} className="flex gap-4">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#673de6]/10 text-[11px] font-extrabold text-[#5b21b6]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[14.5px] leading-relaxed text-slate-600">
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[24px] border border-white/90 bg-white/90 p-6 shadow-[0_20px_54px_-36px_rgba(47,28,106,0.55)] backdrop-blur-sm">
              <p className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.2em] text-[#673de6] uppercase">
                <Sprout className="size-3.5" aria-hidden />
                What that means for you
              </p>
              <ul className="mt-4 space-y-3">
                {content.storyHighlights.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-[13.5px] leading-snug font-semibold text-slate-700"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      strokeWidth={3}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={content.supportCtaHref}
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-extrabold text-[#673de6] hover:underline"
              >
                {content.supportCtaLabel}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── Values ───────────────────────────────────────────────── */}
      {values.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="hb-shell">
            <SectionHead
              eyebrow={content.valuesEyebrow}
              title={content.valuesTitle}
              intro={content.valuesIntro}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value) => {
                const Icon = VALUE_ICONS[value.icon ?? "shield"] ?? Shield;
                return (
                  <article
                    key={value.id}
                    className="group rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#faf9ff_100%)] p-5 shadow-[0_14px_40px_-32px_rgba(47,28,106,0.5)] transition hover:border-[#673de6]/35"
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#673de6] to-[#7c3aed] text-white shadow-[0_10px_24px_-12px_rgba(103,61,230,0.85)]">
                      <Icon className="size-5" strokeWidth={2.2} aria-hidden />
                    </span>
                    <h3 className="mt-4 text-[16px] font-extrabold text-[#1e1b4b]">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">
                      {value.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── Products ─────────────────────────────────────────────── */}
      {products.length > 0 ? (
        <section className="hb-band-cream py-16 sm:py-20">
          <div className="hb-shell">
            <SectionHead
              eyebrow={content.productsEyebrow}
              title={content.productsTitle}
              intro={content.productsIntro}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const Icon = PRODUCT_ICONS[product.icon ?? "hosting"] ?? Server;
                return (
                  <Link
                    key={product.id}
                    href={product.href}
                    className="group flex h-full flex-col rounded-[20px] border border-white/90 bg-white/90 p-5 shadow-[0_14px_40px_-32px_rgba(47,28,106,0.5)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#673de6]/40 hover:shadow-[0_20px_50px_-30px_rgba(103,61,230,0.5)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#673de6]/10 text-[#673de6] transition group-hover:bg-[#673de6] group-hover:text-white">
                      <Icon className="size-[1.15rem]" aria-hidden />
                    </span>
                    <h3 className="mt-3.5 text-[15.5px] font-extrabold text-[#1e1b4b]">
                      {product.title}
                    </h3>
                    <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-slate-600">
                      {product.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#673de6]">
                      Learn more
                      <ArrowRight
                        className="size-3.5 transition group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── Why customers stay ───────────────────────────────────── */}
      {trustItems.length > 0 ? (
        <section className="relative overflow-hidden bg-white py-16 sm:py-20">
          <div className="hb-shell">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <SectionHead
                  eyebrow={content.trustEyebrow}
                  title={content.trustTitle}
                  intro={content.trustIntro}
                  align="left"
                />
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Security", "Performance", "Support", "Billing"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11.5px] font-bold text-slate-600"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {trustItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[18px] border border-slate-200 bg-[#faf9ff] p-5"
                  >
                    <h3 className="flex items-start gap-2 text-[14.5px] font-extrabold text-[#1e1b4b]">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                        strokeWidth={3}
                        aria-hidden
                      />
                      {item.title}
                    </h3>
                    <p className="mt-2 pl-6 text-[13px] leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── Governance ───────────────────────────────────────────── */}
      {governance.length > 0 ? (
        <section className="relative overflow-hidden bg-[linear-gradient(160deg,#241a52_0%,#3b1d8f_48%,#1e3a8a_100%)] py-16 text-white sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,255,255,0.14),transparent_58%)]"
          />
          <div className="hb-shell relative">
            <SectionHead
              eyebrow="GOVERNANCE"
              title={content.governanceTitle}
              intro={content.governanceIntro}
              tone="light"
            />
            <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {governance.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-white/15 bg-white/8 p-5 backdrop-blur-sm"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-white/15 text-white">
                    <Lock className="size-4" aria-hidden />
                  </span>
                  <h3 className="mt-3.5 text-[14.5px] font-extrabold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/70">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
            {content.governanceFootnote ? (
              <p className="mx-auto mt-8 max-w-3xl text-center text-[12px] leading-relaxed font-medium text-white/60">
                {content.governanceFootnote}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ─── Milestones ───────────────────────────────────────────── */}
      {milestones.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="hb-shell">
            <SectionHead
              eyebrow="TIMELINE"
              title={content.milestonesTitle}
              intro={content.milestonesIntro}
            />
            <ol className="relative mx-auto mt-12 max-w-3xl border-l-2 border-dashed border-[#673de6]/25 pl-8">
              {milestones.map((item) => (
                <li key={item.id} className="relative pb-8 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[calc(2rem+7px)] size-3.5 rounded-full border-2 border-white bg-[#673de6] shadow-[0_0_0_4px_rgba(103,61,230,0.14)]"
                  />
                  <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#5b21b6] uppercase">
                    {item.year}
                  </p>
                  <h3 className="mt-1 text-[16px] font-extrabold text-[#1e1b4b]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ─── Legal entity ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eef2ff_0%,#f5f3ff_100%)] py-16 sm:py-20">
        <div className="hb-shell">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <SectionHead
                eyebrow={content.legalEyebrow}
                title={content.legalTitle}
                intro={content.legalIntro}
                align="left"
              />
              <div className="mt-6 space-y-2.5">
                {content.legalNotes.map((note) => (
                  <p
                    key={note}
                    className="flex gap-2.5 text-[13px] leading-relaxed text-slate-600"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      strokeWidth={3}
                      aria-hidden
                    />
                    {note}
                  </p>
                ))}
              </div>
              <Link
                href={content.supportCtaHref}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#673de6] px-5 text-[13.5px] font-extrabold text-white transition hover:bg-[#5b21b6]"
              >
                Request company documentation
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_20px_54px_-38px_rgba(47,28,106,0.55)] sm:p-7">
              <p className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.2em] text-[#673de6] uppercase">
                <Building2 className="size-3.5" aria-hidden />
                Contracting entity
              </p>
              <p className="font-heading mt-3 text-[clamp(1.25rem,2.4vw,1.55rem)] leading-tight font-extrabold tracking-[-0.02em] text-[#1e1b4b]">
                {content.legalEntityName}
              </p>
              <p className="mt-1 text-[12.5px] font-bold text-slate-500">
                {content.legalEntityType} · {content.legalRegisteredLine}
              </p>

              <dl className="mt-5 space-y-0 divide-y divide-slate-200/80 border-t border-slate-200/80">
                <div className="py-3">
                  <dt className="text-[10.5px] font-extrabold tracking-wide text-slate-400 uppercase">
                    Registered address
                  </dt>
                  <dd className="mt-1 text-[13px] leading-relaxed font-semibold text-[#1e1b4b]">
                    {content.legalAddressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[10.5px] font-extrabold tracking-wide text-slate-400 uppercase">
                    Support email
                  </dt>
                  <dd className="text-right text-[12.5px] font-bold text-[#1e1b4b]">
                    {content.legalContactEmail}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[10.5px] font-extrabold tracking-wide text-slate-400 uppercase">
                    Phone support
                  </dt>
                  <dd className="text-right text-[12.5px] font-bold text-[#1e1b4b]">
                    {content.legalContactPhone}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[10.5px] font-extrabold tracking-wide text-slate-400 uppercase">
                    Website
                  </dt>
                  <dd className="text-right text-[12.5px] font-bold text-[#673de6]">
                    {content.legalWebsite}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed font-semibold text-emerald-800">
                Invoices and receipts are issued in the name of{" "}
                {content.legalEntityName}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Support promise ──────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="hb-shell">
          <div className="grid gap-8 rounded-[26px] border border-[#673de6]/20 bg-[linear-gradient(150deg,#f5f3ff_0%,#eef2ff_55%,#ffffff_100%)] p-6 sm:p-9 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
            <div>
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#673de6] to-[#7c3aed] text-white">
                <Headphones className="size-5" aria-hidden />
              </span>
              <h2 className="font-heading mt-4 text-[clamp(1.45rem,2.8vw,2.1rem)] leading-tight font-extrabold tracking-[-0.03em] text-[#1e1b4b]">
                {content.supportTitle}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">
                {content.supportBody}
              </p>
              <Link
                href={content.supportCtaHref}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#1e1b4b] px-5 text-[13.5px] font-extrabold text-white transition hover:bg-[#2f1c6a]"
              >
                {content.supportCtaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="grid gap-2.5">
              {content.supportBullets.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 rounded-xl border border-white bg-white/90 px-4 py-3 text-[13px] leading-snug font-semibold text-slate-700 shadow-[0_10px_30px_-26px_rgba(47,28,106,0.6)]"
                >
                  <Zap
                    className="mt-0.5 size-4 shrink-0 text-[#673de6]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Team (only when real profiles exist) ─────────────────── */}
      {team.length > 0 ? (
        <section className="hb-band-cream py-16 sm:py-20">
          <div className="hb-shell">
            <SectionHead
              eyebrow="TEAM"
              title={content.teamSectionTitle}
              intro={content.teamSectionIntro}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <article
                  key={member.id}
                  className="rounded-[22px] border border-white/90 bg-white/90 p-5 text-center shadow-[0_14px_40px_-32px_rgba(47,28,106,0.5)] backdrop-blur-sm"
                >
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#673de6] to-[#2563eb] text-lg font-extrabold text-white">
                    {member.name.slice(0, 1).toUpperCase()}
                  </div>
                  <h3 className="mt-3.5 text-[15.5px] font-extrabold text-[#1e1b4b]">
                    {member.name}
                  </h3>
                  <p className="text-[12.5px] font-bold text-[#673de6]">
                    {member.role}
                  </p>
                  {member.bio ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                      {member.bio}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── Commitment ───────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="hb-shell mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-extrabold tracking-[0.26em] text-[#5b21b6]/80 uppercase sm:text-[12px]">
            {content.commitmentEyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.14] font-extrabold tracking-[-0.04em] text-[#1e1b4b]">
            {content.commitmentTitle}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
            {content.commitmentBody}
          </p>
          <p className="mt-5 text-[13px] font-bold text-slate-500">
            {content.commitmentSignature}
          </p>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      {faqs.length > 0 ? (
        <section className="hb-band-cream py-16 sm:py-20">
          <div className="hb-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHead
                eyebrow={content.faqEyebrow}
                title={content.faqTitle}
                intro={content.faqIntro}
                align="left"
              />
              <Link
                href={content.supportCtaHref}
                className="mt-5 inline-flex items-center gap-2 text-[14px] font-extrabold text-[#673de6] hover:underline"
              >
                Ask something else
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="space-y-2.5">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition open:border-[#673de6]/40 open:shadow-[0_16px_40px_-32px_rgba(103,61,230,0.7)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 marker:content-none">
                    <span className="text-[14px] font-extrabold text-[#1e1b4b]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className="size-4 shrink-0 text-[#673de6] transition-transform duration-200 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="px-4 pb-4 text-[13.5px] leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#2f1c6a_0%,#673de6_58%,#3b82f6_100%)] py-16 text-white sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,255,255,0.22),transparent_52%)]"
        />
        <div className="hb-shell relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-extrabold tracking-[0.24em] text-[#c4b5fd] uppercase">
              {content.ctaEyebrow}
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.8rem,3.7vw,2.85rem)] leading-[1.1] font-extrabold tracking-[-0.04em]">
              {content.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85 sm:text-[16px]">
              {content.ctaDescription}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={content.ctaPrimaryHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-extrabold text-[#3b1d8f] shadow-[0_16px_38px_-18px_rgba(0,0,0,0.6)] transition hover:bg-violet-50"
              >
                {content.ctaPrimaryLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={content.ctaSecondaryHref}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 text-[15px] font-bold text-white transition hover:bg-white/10"
              >
                {content.ctaSecondaryLabel}
              </Link>
            </div>
            <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 text-[11.5px] font-semibold text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-3.5" aria-hidden />
                {content.companyLegalName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CircleDollarSign className="size-3.5" aria-hidden />
                Transparent renewals
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />
                Human support
              </span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
