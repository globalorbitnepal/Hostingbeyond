import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

import type {
  CmsCaseStudiesHubPageContent,
  CmsCaseStudyEntry,
} from "@/lib/orbit/case-studies-hub-page-content";
import { caseStudiesHubPath } from "@/lib/case-studies/paths";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

export function CaseStudiesStatsBand({
  content,
}: {
  content: CmsCaseStudiesHubPageContent;
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

export function CaseStudiesIntroSection({
  content,
}: {
  content: CmsCaseStudiesHubPageContent;
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

export function CaseStudiesIndustryNav({
  industries,
  active,
  search,
}: {
  industries: string[];
  active: string;
  search?: string;
}) {
  if (industries.length === 0) return null;
  return (
    <nav
      aria-label="Filter by industry"
      className="-mx-1 flex [scrollbar-width:thin] gap-2 overflow-x-auto px-1 pb-1"
    >
      <div className="mx-auto flex min-w-max gap-2">
        <Link
          href={caseStudiesHubPath({ search })}
          className={`inline-flex shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            !active
              ? "bg-[#673de6] text-white shadow-sm"
              : "border border-violet-100 bg-white text-slate-700 hover:border-violet-200"
          }`}
        >
          All industries
        </Link>
        {industries.map((ind) => {
          const isActive = ind.toLowerCase() === active.toLowerCase();
          return (
            <Link
              key={ind}
              href={caseStudiesHubPath({ industry: ind, search })}
              className={`inline-flex shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-[#673de6] text-white shadow-sm"
                  : "border border-violet-100 bg-white text-slate-700 hover:border-violet-200"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {ind}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function ServiceTags({ services }: { services: string[] }) {
  if (!services.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {services.map((s) => (
        <li
          key={s}
          className="rounded-full bg-[#673de6]/10 px-3 py-1 text-[11px] font-bold tracking-wide text-[#5b21b6] uppercase"
        >
          {s}
        </li>
      ))}
    </ul>
  );
}

export function CaseStudyArticle({
  study,
  featured = false,
}: {
  study: CmsCaseStudyEntry;
  featured?: boolean;
}) {
  const headingId = `case-study-${study.id}`;
  return (
    <article
      id={headingId}
      className={`overflow-hidden rounded-[24px] border border-violet-100/90 bg-white shadow-[0_20px_50px_-36px_rgba(47,28,106,0.35)] ${
        featured ? "lg:grid lg:grid-cols-[minmax(0,1fr)_280px]" : ""
      }`}
    >
      <div className="p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.16em] text-[#673de6] uppercase">
          {study.industry}
          {study.location ? ` · ${study.location}` : ""}
        </p>
        <h2 className="font-heading mt-2 text-xl font-extrabold tracking-tight text-[#1a1035] sm:text-2xl">
          {study.title}
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {study.clientName}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
          {study.summary}
        </p>
        <ServiceTags services={study.services} />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#1a1035]">Challenge</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {study.challenge}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1a1035]">Solution</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {study.solution}
            </p>
          </div>
        </div>
        {study.results.length > 0 ? (
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {study.results.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-violet-50 bg-[#f8f7fd] px-4 py-3"
              >
                <dt className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                  {r.label}
                </dt>
                <dd className="mt-1 text-lg font-extrabold text-[#673de6]">
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {study.quote ? (
          <blockquote className="mt-6 border-l-4 border-[#673de6] pl-4">
            <p className="text-[15px] leading-relaxed text-slate-700 italic">
              “{study.quote}”
            </p>
            <footer className="mt-2 text-sm font-semibold text-[#1a1035]">
              {study.quoteAuthor}
              {study.quoteRole ? (
                <span className="font-normal text-slate-500">
                  {" "}
                  — {study.quoteRole}
                </span>
              ) : null}
            </footer>
          </blockquote>
        ) : null}
        {study.href ? (
          <Link
            href={study.href}
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#673de6] hover:underline"
          >
            Explore related services
            <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
      {featured && study.image ? (
        <div className="relative min-h-[220px] bg-gradient-to-br from-[#ede9fe] to-[#dbeafe] lg:min-h-full">
          <Image
            src={study.image}
            alt={study.imageAlt || study.clientName}
            fill
            unoptimized={isRuntimeMediaSrc(study.image)}
            className="object-cover object-top"
            sizes="280px"
          />
        </div>
      ) : null}
    </article>
  );
}

export function CaseStudiesLibrary({
  studies,
}: {
  studies: CmsCaseStudyEntry[];
}) {
  if (studies.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 px-6 py-10 text-center text-sm text-slate-600">
        No case studies match your filters. Try another industry or clear
        search.
      </p>
    );
  }
  const featured = studies.filter((s) => s.featured);
  const rest = studies.filter((s) => !s.featured);
  return (
    <div className="space-y-8">
      {featured.map((s) => (
        <CaseStudyArticle key={s.id} study={s} featured />
      ))}
      {rest.length > 0 ? (
        <div className="grid gap-8">
          {rest.map((s) => (
            <CaseStudyArticle key={s.id} study={s} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CaseStudiesMethodology({
  content,
}: {
  content: CmsCaseStudiesHubPageContent;
}) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        {content.methodologyTitle}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        {content.methodologyBody}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {content.methodologyBodySecondary}
      </p>
    </section>
  );
}

export function CaseStudiesPillars({
  content,
}: {
  content: CmsCaseStudiesHubPageContent;
}) {
  const items = content.pillars.filter((p) => p.visible !== false);
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        Why teams choose HostingBeyond
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-[#f8f7fd] p-5"
          >
            <h3 className="text-lg font-extrabold text-[#1a1035]">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CaseStudiesFaqSection({
  content,
}: {
  content: CmsCaseStudiesHubPageContent;
}) {
  const faqs = content.faqs.filter(
    (f) => f.visible !== false && f.question && f.answer,
  );
  if (!faqs.length) return null;
  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        Case studies FAQ
      </h2>
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

export function CaseStudiesCtaBand({
  content,
}: {
  content: CmsCaseStudiesHubPageContent;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2f1c6a] via-[#4c1d95] to-[#2563eb] px-6 py-10 text-white sm:px-10">
      <p className="text-xs font-bold tracking-[0.2em] text-[#c4b5fd] uppercase">
        {content.ctaEyebrow}
      </p>
      <h2 className="font-heading mt-2 text-2xl font-extrabold sm:text-3xl">
        {content.ctaTitle}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
        {content.ctaDescription}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={content.ctaPrimaryHref}
          className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-extrabold text-[#2f1c6a]"
        >
          {content.ctaPrimaryLabel}
        </Link>
        <Link
          href={content.ctaSecondaryHref}
          className="inline-flex h-12 items-center rounded-xl border border-white/40 px-6 text-sm font-bold text-white hover:bg-white/10"
        >
          {content.ctaSecondaryLabel}
        </Link>
      </div>
    </section>
  );
}
