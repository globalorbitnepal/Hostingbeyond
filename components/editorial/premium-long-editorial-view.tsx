import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";

import type { CmsEditorialPageContent } from "@/lib/orbit/editorial-page-content";

export type PremiumLongEditorialChrome = {
  related: { href: string; label: string }[];
  firstBandEyebrow: string;
  firstBandTitle: string;
  secondBandEyebrow: string;
  secondBandTitle: string;
  faqTitle: string;
  faqLead: string;
  closingTitle: string;
  closingLead: string;
};

export function PremiumLongEditorialView({
  content,
  chrome,
}: {
  content: CmsEditorialPageContent;
  chrome: PremiumLongEditorialChrome;
}) {
  const [lead, ...rest] = content.sections;
  const midpoint = Math.ceil(rest.length / 2);
  const firstBand = rest.slice(0, midpoint);
  const secondBand = rest.slice(midpoint);

  return (
    <article>
      <section className="hb-band-purple relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(37,99,235,0.22),transparent_50%)]"
        />
        <div className="hb-shell relative grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="text-[12px] font-bold tracking-[0.22em] text-[#c4b5fd] uppercase">
              {content.eyebrow}
            </p>
            <h1 className="font-heading mt-4 text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.05] font-extrabold tracking-[-0.045em]">
              {content.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/85">
              {content.heroLead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={content.primaryCta.href}
                className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-extrabold text-[#2f1c6a] shadow-lg"
              >
                {content.primaryCta.label}
              </Link>
              <Link
                href={content.secondaryCta.href}
                className="inline-flex h-12 items-center rounded-xl border border-white/35 px-6 text-[15px] font-bold text-white hover:bg-white/10"
              >
                {content.secondaryCta.label}
              </Link>
            </div>
          </div>
          {lead ? (
            <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <p className="text-[11px] font-bold tracking-wide text-white/60 uppercase">
                {lead.title}
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-white/85">
                {lead.body}
              </p>
              {lead.bullets.length ? (
                <ul className="mt-4 space-y-3 text-[14px] text-white/90">
                  {lead.bullets.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {firstBand.length ? (
        <section className="hb-band-cream py-16 sm:py-20">
          <div className="hb-shell">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-bold tracking-[0.28em] text-[#673de6] uppercase">
                {chrome.firstBandEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.75rem,3.2vw,2.6rem)] font-extrabold text-[#2f1c6a]">
                {chrome.firstBandTitle}
              </h2>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {firstBand.map((section) => (
                <article
                  key={section.id}
                  className="rounded-[22px] border border-[#e7e1ff] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(47,28,106,0.45)]"
                >
                  <h3 className="font-heading text-[20px] font-extrabold text-[#2f1c6a]">
                    {section.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 whitespace-pre-wrap text-slate-600">
                    {section.body}
                  </p>
                  {section.bullets.length ? (
                    <ul className="mt-4 space-y-2">
                      {section.bullets.map((line) => (
                        <li
                          key={line}
                          className="flex items-start gap-2 text-[14px] text-[#2f1c6a]"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {secondBand.length ? (
        <section className="hb-band-purple py-16 sm:py-20">
          <div className="hb-shell">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-bold tracking-[0.28em] text-white/70 uppercase">
                {chrome.secondBandEyebrow}
              </p>
              <h2 className="font-heading mt-3 text-[clamp(1.75rem,3.2vw,2.6rem)] font-extrabold text-white">
                {chrome.secondBandTitle}
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {secondBand.map((section) => (
                <article
                  key={section.id}
                  className="rounded-[22px] border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
                >
                  <h3 className="text-[18px] font-extrabold text-white">
                    {section.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-7 whitespace-pre-wrap text-white/80">
                    {section.body}
                  </p>
                  {section.bullets.length ? (
                    <ul className="mt-4 space-y-2">
                      {section.bullets.map((line) => (
                        <li
                          key={line}
                          className="flex items-start gap-2 text-[14px] text-white/90"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="hb-band-cream py-16 sm:py-20">
        <div className="hb-shell mx-auto max-w-3xl">
          <h2 className="font-heading text-center text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold text-[#2f1c6a]">
            {chrome.faqTitle}
          </h2>
          <p className="mt-2 text-center text-[15px] text-slate-600">
            {chrome.faqLead}
          </p>
          <div className="mt-8 space-y-2">
            {content.faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-[18px] border border-slate-200 bg-white open:border-[#c7b8ff]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-[15px] font-bold text-[#2f1c6a]">
                  {faq.question}
                  <Plus className="size-4 shrink-0 group-open:hidden" />
                  <Minus className="hidden size-4 shrink-0 group-open:block" />
                </summary>
                <p className="px-4 pb-4 text-[14px] leading-relaxed text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="hb-band-cream pb-16">
        <div className="hb-shell">
          <h2 className="font-heading text-[clamp(1.4rem,2.4vw,1.8rem)] font-extrabold text-[#2f1c6a]">
            Related pages
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {chrome.related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex rounded-full border border-[#e7e1ff] bg-white px-4 py-2 text-[13px] font-bold text-[#5b21b6]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hb-band-purple py-16 text-center text-white sm:py-20">
        <div className="hb-shell">
          <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold">
            {chrome.closingTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-white/85">
            {chrome.closingLead}
          </p>
          <Link
            href={content.primaryCta.href}
            className="mt-7 inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-extrabold text-[#2f1c6a]"
          >
            {content.primaryCta.label}
          </Link>
        </div>
      </section>
    </article>
  );
}
