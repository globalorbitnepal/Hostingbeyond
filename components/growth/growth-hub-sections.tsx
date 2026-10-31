import Link from "next/link";
import { ArrowRight, ChevronDown, ListChecks, Sparkles } from "lucide-react";

import {
  type CmsGrowthHubPageContent,
  type CmsGrowthPlaybook,
  growthPlaybookKindLabel,
} from "@/lib/orbit/growth-hub-page-content";
import { growthHubPath } from "@/lib/growth/paths";

function kindStyles(kind: CmsGrowthPlaybook["kind"]) {
  switch (kind) {
    case "CHECKLIST":
      return "bg-sky-500/10 text-sky-900 ring-sky-500/20";
    case "FRAMEWORK":
      return "bg-violet-500/15 text-[#5b21b6] ring-violet-500/25";
    default:
      return "bg-[#673de6]/12 text-[#5b21b6] ring-[#673de6]/25";
  }
}

export function GrowthStatsBand({
  content,
}: {
  content: CmsGrowthHubPageContent;
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

export function GrowthIntroSection({
  content,
}: {
  content: CmsGrowthHubPageContent;
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
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-[#f8f7fd] p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-slate-600">
          {content.introBodySecondary}
        </p>
      </div>
    </section>
  );
}

export function GrowthStagesSection({
  content,
}: {
  content: CmsGrowthHubPageContent;
}) {
  const stages = content.stages.filter((s) => s.visible !== false);
  if (!stages.length) return null;
  return (
    <section className="rounded-[28px] border border-violet-100/90 bg-white p-6 shadow-[0_16px_48px_-32px_rgba(103,61,230,0.25)] sm:p-8">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        {content.stagesTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        {content.stagesSubtitle}
      </p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <li
            key={stage.id}
            className="relative rounded-2xl border border-violet-50 bg-gradient-to-b from-[#faf9ff] to-white p-5"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#673de6] text-sm font-extrabold text-white shadow-md shadow-violet-500/30">
              {stage.step}
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-[#1a1035]">
              {stage.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {stage.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function GrowthCategoryNav({
  categories,
  activeSlug,
  search,
}: {
  categories: CmsGrowthHubPageContent["categories"];
  activeSlug: string;
  search?: string;
}) {
  const items = categories.filter((c) => c.visible !== false);
  return (
    <nav
      aria-label="Playbook categories"
      className="-mx-1 flex [scrollbar-width:thin] gap-2 overflow-x-auto px-1 pb-1"
    >
      <div className="mx-auto flex min-w-max gap-2">
        {items.map((cat) => {
          const isActive = (cat.slug || "") === activeSlug;
          const href = growthHubPath({
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

function PlaybookCard({
  playbook,
  featured,
}: {
  playbook: CmsGrowthPlaybook;
  featured?: boolean;
}) {
  return (
    <article
      id={`playbook-${playbook.id}`}
      className={`group relative overflow-hidden rounded-[24px] border bg-white p-6 sm:p-8 ${
        featured
          ? "border-violet-200 shadow-[0_24px_60px_-40px_rgba(103,61,230,0.45)] ring-1 ring-violet-100"
          : "border-violet-100/90 shadow-[0_12px_40px_-28px_rgba(47,28,106,0.2)]"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#673de6] via-[#7c3aed] to-[#2563eb]"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ring-1 ${kindStyles(playbook.kind)}`}
        >
          {growthPlaybookKindLabel(playbook.kind)}
        </span>
        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-[#673de6] uppercase">
          {playbook.category}
        </span>
        {featured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#673de6]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#673de6] uppercase">
            <Sparkles className="size-3" aria-hidden />
            Featured
          </span>
        ) : null}
      </div>
      <h3 className="font-heading mt-4 text-xl font-extrabold tracking-tight text-[#1a1035] sm:text-2xl">
        {playbook.title}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
        {playbook.excerpt}
      </p>
      {playbook.body ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {playbook.body}
        </p>
      ) : null}
      {playbook.href ? (
        <Link
          href={playbook.href}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#673de6]/10 px-4 py-2.5 text-sm font-bold text-[#673de6] transition group-hover:bg-[#673de6] group-hover:text-white"
        >
          Take action
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </article>
  );
}

export function GrowthPlaybookLibrary({
  playbooks,
}: {
  playbooks: CmsGrowthPlaybook[];
}) {
  if (!playbooks.length) {
    return (
      <p className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 px-6 py-10 text-center text-sm text-slate-600">
        No playbooks match your filters. Try another category or clear search.
      </p>
    );
  }
  const featured = playbooks.filter((p) => p.featured);
  const rest = playbooks.filter((p) => !p.featured);
  return (
    <div className="space-y-8">
      {featured.map((p) => (
        <PlaybookCard key={p.id} playbook={p} featured />
      ))}
      {rest.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {rest.map((p) => (
            <PlaybookCard key={p.id} playbook={p} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function GrowthPrinciplesSection({
  content,
}: {
  content: CmsGrowthHubPageContent;
}) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-[#f8f7fd]/80 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#673de6] text-white shadow-lg shadow-violet-500/25">
          <ListChecks className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-[#1a1035]">
            {content.principlesTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {content.principlesBody}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {content.principlesBodySecondary}
          </p>
        </div>
      </div>
    </section>
  );
}

export function GrowthPillars({
  content,
}: {
  content: CmsGrowthHubPageContent;
}) {
  const items = content.pillars.filter((p) => p.visible !== false);
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        Growth pillars on HostingBeyond
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((pillar, i) => (
          <div
            key={pillar.id}
            className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/40 p-6"
          >
            <span className="text-xs font-extrabold text-[#673de6]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-lg font-extrabold text-[#1a1035]">
              {pillar.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GrowthFaqSection({
  content,
}: {
  content: CmsGrowthHubPageContent;
}) {
  const faqs = content.faqs.filter(
    (f) => f.visible !== false && f.question && f.answer,
  );
  if (!faqs.length) return null;
  return (
    <section
      id="faq"
      className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8"
    >
      <h2 className="text-2xl font-extrabold text-[#1a1035]">Growth FAQ</h2>
      <ul className="mt-6 divide-y divide-violet-100">
        {faqs.map((faq) => (
          <li key={faq.id} className="py-4 first:pt-0 last:pb-0">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left font-bold text-[#1a1035] marker:content-none">
                {faq.question}
                <ChevronDown className="size-5 shrink-0 text-[#673de6] transition group-open:rotate-180" />
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

export function GrowthCtaBand({
  content,
}: {
  content: CmsGrowthHubPageContent;
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
