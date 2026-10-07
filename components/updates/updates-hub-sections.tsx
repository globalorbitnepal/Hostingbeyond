import Link from "next/link";
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react";

import {
  type CmsUpdateEntry,
  type CmsUpdatesHubPageContent,
  updateKindLabel,
  UPDATES_BASE,
} from "@/lib/orbit/updates-hub-page-content";
import { updatesHubPath } from "@/lib/updates/paths";

function kindStyles(kind: CmsUpdateEntry["kind"]) {
  switch (kind) {
    case "NEW":
      return "bg-[#673de6]/12 text-[#5b21b6] ring-[#673de6]/25";
    case "FIX":
      return "bg-sky-500/10 text-sky-900 ring-sky-500/20";
    case "ANNOUNCEMENT":
      return "bg-violet-500/15 text-[#5b21b6] ring-violet-500/25";
    default:
      return "bg-[#673de6]/10 text-[#673de6] ring-[#673de6]/20";
  }
}

export function UpdatesStatsBand({
  content,
}: {
  content: CmsUpdatesHubPageContent;
}) {
  return (
    <section className="rounded-2xl border border-violet-100/80 bg-gradient-to-r from-[#f5f3ff] via-white to-[#eff6ff] p-6 shadow-[0_8px_32px_rgba(103,61,230,0.08)] sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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

export function UpdatesIntroSection({
  content,
}: {
  content: CmsUpdatesHubPageContent;
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
      </div>
    </section>
  );
}

export function UpdatesCategoryNav({
  categories,
  activeSlug,
  search,
}: {
  categories: CmsUpdatesHubPageContent["categories"];
  activeSlug: string;
  search?: string;
}) {
  const items = categories.filter((c) => c.visible !== false);
  return (
    <nav
      aria-label="Update categories"
      className="-mx-1 flex [scrollbar-width:thin] gap-2 overflow-x-auto px-1 pb-1"
    >
      <div className="mx-auto flex min-w-max gap-2">
        {items.map((cat) => {
          const isActive = (cat.slug || "") === activeSlug;
          const href = updatesHubPath({
            category: cat.slug || undefined,
            search,
          });
          return (
            <Link
              key={cat.id}
              href={href}
              className={`inline-flex shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#673de6] text-white shadow-sm"
                  : "border border-violet-100 bg-white text-slate-700 hover:border-violet-200"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function UpdatesTimeline({ entries }: { entries: CmsUpdateEntry[] }) {
  if (!entries.length) {
    return (
      <div
        id="timeline"
        className="rounded-3xl border border-dashed border-violet-200 bg-white/90 p-10 text-center"
      >
        <h3 className="text-xl font-bold text-[#1a1035]">
          No updates published yet
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
          When your team adds release notes in Orbit, they will appear here in
          chronological order. Check back soon or explore hosting and domain
          services in the meantime.
        </p>
      </div>
    );
  }

  return (
    <ol
      id="timeline"
      className="relative space-y-0 border-l-2 border-violet-200 pl-8 sm:pl-10"
    >
      {entries.map((entry) => (
        <li key={entry.id} className="relative pb-10 last:pb-0">
          <span
            className="absolute top-1.5 -left-[calc(2rem+5px)] size-3 rounded-full bg-[#673de6] ring-4 ring-violet-100 sm:-left-[calc(2.5rem+5px)]"
            aria-hidden
          />
          <div className="rounded-2xl border border-violet-100/90 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <time
                dateTime={entry.date}
                className="text-xs font-bold text-slate-500"
              >
                {entry.date}
              </time>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ring-1 ${kindStyles(entry.kind)}`}
              >
                {updateKindLabel(entry.kind)}
              </span>
              <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-[#673de6] uppercase">
                {entry.category}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-[#1a1035] sm:text-xl">
              {entry.href ? (
                <Link
                  href={entry.href}
                  className="inline-flex items-center gap-1 hover:text-[#673de6]"
                >
                  {entry.title}
                  <ExternalLink className="size-4" aria-hidden />
                </Link>
              ) : (
                entry.title
              )}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {entry.excerpt}
            </p>
            {entry.body ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {entry.body}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function UpdatesPillars({
  content,
}: {
  content: CmsUpdatesHubPageContent;
}) {
  const pillars = content.pillars.filter((p) => p.visible !== false);
  if (!pillars.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        What we document
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Updates span the HostingBeyond stack — from infrastructure to
        customer-facing tools.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/30 p-6"
          >
            <h3 className="text-lg font-bold text-[#1a1035]">{pillar.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{pillar.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function UpdatesRoadmap({
  content,
}: {
  content: CmsUpdatesHubPageContent;
}) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-[#f8f5ff]/80 p-6 sm:p-8">
      <h2 className="text-xl font-extrabold text-[#1a1035]">
        {content.roadmapTitle}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {content.roadmapBody}
      </p>
      <Link
        href={UPDATES_BASE}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#673de6]"
      >
        Refresh this page
        <ArrowRight className="size-3.5" />
      </Link>
    </section>
  );
}

export function UpdatesFaqSection({
  content,
}: {
  content: CmsUpdatesHubPageContent;
}) {
  const faqs = content.faqs.filter((f) => f.visible !== false);
  if (!faqs.length) return null;
  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">FAQ</h2>
      <ul className="mt-6 divide-y divide-violet-100">
        {faqs.map((faq) => (
          <li key={faq.id} className="py-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-[#1a1035] marker:content-none">
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

export function UpdatesCtaBand({
  content,
}: {
  content: CmsUpdatesHubPageContent;
}) {
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
        <p className="mt-3 text-sm text-white/85 sm:text-base">
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
