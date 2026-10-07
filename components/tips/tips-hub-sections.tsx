import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Globe2,
  Layers,
  Mail,
  Server,
  Shield,
  Zap,
} from "lucide-react";

import type { CmsTipsHubPageContent } from "@/lib/orbit/tips-hub-page-content";
import { tipsHubPath } from "@/lib/blog/paths";
import { routes } from "@/config/routes";

const PILLAR_ICONS = [Server, Globe2, Zap, Layers, Mail, Shield];

export function TipsStatsBand({ content }: { content: CmsTipsHubPageContent }) {
  return (
    <section
      className="rounded-2xl border border-violet-100/80 bg-gradient-to-r from-[#f5f3ff] via-white to-[#eff6ff] p-6 shadow-[0_8px_32px_rgba(103,61,230,0.08)] sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
      aria-label="Hub highlights"
    >
      {content.stats.map((stat) => (
        <div key={stat.id} className="py-2 text-center sm:py-0">
          <p className="text-2xl font-extrabold text-[#673de6]">{stat.value}</p>
          <p className="mt-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}

export function TipsIntroSection({
  content,
}: {
  content: CmsTipsHubPageContent;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#1a1035] sm:text-3xl">
          {content.introTitle}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {content.introBody}
        </p>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-slate-600">
          {content.introBodySecondary}
        </p>
        <ul className="mt-5 space-y-2 text-sm font-semibold text-[#673de6]">
          <li>
            <Link href={routes.hosting} className="hover:underline">
              Web hosting →
            </Link>
          </li>
          <li>
            <Link href={routes.domains} className="hover:underline">
              Domain search →
            </Link>
          </li>
          <li>
            <Link href={routes.businessEmail} className="hover:underline">
              Business email →
            </Link>
          </li>
          <li>
            <Link href={routes.websiteMigration} className="hover:underline">
              Website migration →
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function TipsLearningPathsGrid({
  content,
}: {
  content: CmsTipsHubPageContent;
}) {
  const paths = content.learningPaths.filter((p) => p.visible !== false);
  if (!paths.length) return null;
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#673de6] uppercase">
            Start here
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#1a1035]">
            Popular learning paths
          </h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {paths.map((path, i) => {
          const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
          return (
            <Link
              key={path.id}
              href={path.href}
              className="group flex h-full flex-col rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-white">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-[#1a1035] group-hover:text-[#673de6]">
                {path.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">
                {path.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#673de6]">
                Explore
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function TipsPillarsGrid({
  content,
}: {
  content: CmsTipsHubPageContent;
}) {
  const pillars = content.pillars.filter((p) => p.visible !== false);
  if (!pillars.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        Explore by topic
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Deep dives across hosting, domains, WordPress, security, email and more.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar, i) => {
          const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
          return (
            <Link
              key={pillar.id}
              href={tipsHubPath({ category: pillar.categorySlug })}
              className="group rounded-2xl border border-violet-100/90 bg-gradient-to-br from-white to-violet-50/40 p-6 shadow-sm transition hover:shadow-md"
            >
              <Icon className="size-6 text-[#673de6]" aria-hidden />
              <h3 className="mt-3 text-lg font-bold text-[#1a1035]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {pillar.description}
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-[#673de6] group-hover:underline">
                View guides →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function TipsFaqSection({
  content,
}: {
  content: CmsTipsHubPageContent;
}) {
  const faqs = content.faqs.filter((f) => f.visible !== false);
  if (!faqs.length) return null;
  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        Frequently asked questions
      </h2>
      <ul className="mt-6 divide-y divide-violet-100">
        {faqs.map((faq) => (
          <li key={faq.id} className="py-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left font-semibold text-[#1a1035] marker:content-none">
                {faq.question}
                <ChevronDown
                  className="size-5 shrink-0 text-[#673de6] transition group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {faq.answer}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TipsCtaBand({ content }: { content: CmsTipsHubPageContent }) {
  return (
    <section className="hb-band-purple relative overflow-hidden rounded-3xl px-6 py-10 text-center text-white sm:px-10 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] text-[#c4b5fd] uppercase">
          {content.ctaEyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          {content.ctaTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
          {content.ctaDescription}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={content.ctaPrimaryHref}
            className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-extrabold text-[#2f1c6a]"
          >
            {content.ctaPrimaryLabel}
          </Link>
          <Link
            href={content.ctaSecondaryHref}
            className="inline-flex h-12 items-center rounded-xl border border-white/35 px-6 text-sm font-bold text-white hover:bg-white/10"
          >
            {content.ctaSecondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
