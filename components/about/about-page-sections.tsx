import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import type { CmsAboutPageContent } from "@/lib/orbit/about-page-content";

export function AboutStatsBand({ content }: { content: CmsAboutPageContent }) {
  return (
    <section
      className="rounded-2xl border border-violet-100/80 bg-gradient-to-r from-[#f5f3ff] via-white to-[#eff6ff] p-6 shadow-[0_8px_32px_rgba(103,61,230,0.08)] sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
      aria-label="Company highlights"
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

export function AboutMissionVision({
  content,
}: {
  content: CmsAboutPageContent;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-extrabold text-[#1a1035]">
          {content.missionTitle}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          {content.missionBody}
        </p>
      </article>
      <article className="rounded-3xl border border-violet-100 bg-gradient-to-br from-[#7c3aed]/10 to-[#2563eb]/10 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-[#1a1035]">
          {content.visionTitle}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          {content.visionBody}
        </p>
      </article>
    </section>
  );
}

export function AboutUsaSection({ content }: { content: CmsAboutPageContent }) {
  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-[#673de6] uppercase">
          United States
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-[#1a1035] sm:text-3xl">
          {content.usaTitle}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {content.usaBody}
        </p>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-slate-600">
          {content.usaBodySecondary}
        </p>
      </div>
    </section>
  );
}

export function AboutStorySection({
  content,
}: {
  content: CmsAboutPageContent;
}) {
  return (
    <section className="rounded-3xl border border-violet-100 bg-[#faf8ff] p-6 sm:p-10">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        {content.storyTitle}
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
        {content.storyBody}
      </p>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
        {content.storyBodySecondary}
      </p>
    </section>
  );
}

export function AboutValuesGrid({ content }: { content: CmsAboutPageContent }) {
  const values = content.values.filter((v) => v.visible !== false);
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">Our values</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {values.map((value) => (
          <div
            key={value.id}
            className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-[#673de6]">{value.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AboutProductsGrid({
  content,
}: {
  content: CmsAboutPageContent;
}) {
  const products = content.products.filter((p) => p.visible !== false);
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">What we offer</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        One brand, multiple ways to build and grow online.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className="group flex h-full flex-col rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <h3 className="text-lg font-bold text-[#1a1035] group-hover:text-[#673de6]">
              {product.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-slate-600">
              {product.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#673de6]">
              Learn more
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AboutMilestones({ content }: { content: CmsAboutPageContent }) {
  const items = content.milestones.filter(
    (m) => m.visible !== false && m.title.trim(),
  );
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">Milestones</h2>
      <ol className="mt-8 space-y-4 border-l-2 border-violet-200 pl-8">
        {items.map((m) => (
          <li key={m.id} className="relative">
            <span
              className="absolute top-1 -left-[calc(2rem+5px)] size-3 rounded-full bg-[#673de6]"
              aria-hidden
            />
            <p className="text-xs font-bold text-[#673de6]">{m.year}</p>
            <h3 className="text-lg font-bold text-[#1a1035]">{m.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{m.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AboutTeamSection({
  content,
}: {
  content: CmsAboutPageContent;
}) {
  const team = content.team.filter((t) => t.visible !== false && t.name.trim());
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        {content.teamSectionTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        {content.teamSectionIntro}
      </p>
      {team.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <article
              key={member.id}
              className="rounded-2xl border border-violet-100 bg-white p-5 text-center shadow-sm"
            >
              {member.imageUrl ? (
                <div className="relative mx-auto size-20 overflow-hidden rounded-full bg-violet-50">
                  <Image
                    src={member.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div
                  className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-xl font-bold text-white"
                  aria-hidden
                >
                  {member.name.slice(0, 1)}
                </div>
              )}
              <h3 className="mt-4 text-lg font-bold text-[#1a1035]">
                {member.name}
              </h3>
              <p className="text-sm font-semibold text-[#673de6]">
                {member.role}
              </p>
              {member.bio ? (
                <p className="mt-2 text-sm text-slate-600">{member.bio}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function AboutTrustSection({
  content,
}: {
  content: CmsAboutPageContent;
}) {
  const items = content.trustItems.filter((t) => t.visible !== false);
  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-10">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        {content.trustTitle}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{content.trustIntro}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-violet-50/50 p-5 ring-1 ring-violet-100"
          >
            <h3 className="font-bold text-[#1a1035]">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AboutCommitment({ content }: { content: CmsAboutPageContent }) {
  return (
    <section className="text-center">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        {content.commitmentTitle}
      </h2>
      <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
        {content.commitmentBody}
      </p>
    </section>
  );
}

export function AboutFaqSection({ content }: { content: CmsAboutPageContent }) {
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

export function AboutCtaBand({ content }: { content: CmsAboutPageContent }) {
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
