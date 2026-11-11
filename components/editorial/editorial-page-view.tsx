import Link from "next/link";

import type { CmsEditorialPageContent } from "@/lib/orbit/editorial-page-content";

export function EditorialPageView({
  content,
}: {
  content: CmsEditorialPageContent;
}) {
  return (
    <article className="hb-band-cream text-[#1a1035]">
      <section className="border-b border-[#5b21b6]/10 bg-[linear-gradient(180deg,#f4eefc_0%,#eef3ff_100%)]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-[11px] font-extrabold tracking-[0.18em] text-[#5b21b6] uppercase">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {content.heroTitle}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#3f355c]">
            {content.heroLead}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={content.primaryCta.href}
              className="inline-flex rounded-full bg-[#5b21b6] px-5 py-2.5 text-sm font-bold text-white"
            >
              {content.primaryCta.label}
            </Link>
            <Link
              href={content.secondaryCta.href}
              className="inline-flex rounded-full border border-[#5b21b6]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#5b21b6]"
            >
              {content.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {content.sections.map((section) => (
        <section
          key={section.id}
          className="mx-auto max-w-3xl px-4 py-12 sm:px-6"
        >
          <h2 className="text-2xl font-extrabold tracking-tight">
            {section.title}
          </h2>
          <p className="mt-4 text-[17px] leading-8 whitespace-pre-wrap text-[#352d4e]">
            {section.body}
          </p>
          {section.bullets.length ? (
            <ul className="mt-5 space-y-2">
              {section.bullets.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-[#5b21b6]/12 bg-white px-4 py-3 text-sm font-medium text-[#1a1035]"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      {content.faqs.length ? (
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Questions</h2>
          <dl className="mt-6 space-y-4">
            {content.faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-[#5b21b6]/12 bg-white p-5"
              >
                <dt className="font-bold">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-[#352d4e]">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </article>
  );
}
