import Link from "next/link";
import { Building2, Globe2, MapPin, Shield } from "lucide-react";

import type { CmsAboutPageContent } from "@/lib/orbit/about-page-content";

export function AboutPremiumHero({
  content,
}: {
  content: CmsAboutPageContent;
}) {
  return (
    <section className="hb-band-purple relative overflow-hidden py-14 text-white sm:py-16 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(255,255,255,0.16),transparent_42%),radial-gradient(ellipse_at_88%_100%,rgba(37,99,235,0.35),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.12]"
      />
      <div className="hb-shell relative grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-[#c4b5fd] uppercase">
            {content.heroEyebrow}
          </p>
          <h1 className="font-heading mt-3 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] font-extrabold tracking-[-0.04em]">
            {content.heroTitle}{" "}
            <span className="text-[#c7d7ff]">{content.heroTitleAccent}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/88 sm:text-[17px]">
            {content.heroDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white/90">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
              <MapPin className="size-4" aria-hidden />
              {content.headquartersLine}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
              <Globe2 className="size-4" aria-hidden />
              {content.servingLine}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={content.heroPrimaryHref}
              className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-extrabold text-[#2f1c6a] shadow-lg hover:bg-violet-50"
            >
              {content.heroPrimaryLabel}
            </Link>
            <Link
              href={content.heroSecondaryHref}
              className="inline-flex h-12 items-center rounded-xl border border-white/35 px-6 text-sm font-bold text-white hover:bg-white/10"
            >
              {content.heroSecondaryLabel}
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
          <p className="text-xs font-bold tracking-wide text-[#c4b5fd] uppercase">
            {content.companyLegalName}
          </p>
          <ul className="mt-4 space-y-3">
            {[
              {
                icon: Building2,
                title: "Mission-driven",
                text: content.missionTitle,
              },
              {
                icon: Shield,
                title: "Trust & security",
                text: content.trustTitle,
              },
              {
                icon: Globe2,
                title: "Global reach",
                text: content.servingLine,
              },
            ].map((row) => (
              <li
                key={row.title}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <row.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{row.title}</p>
                  <p className="line-clamp-2 text-xs text-white/75">
                    {row.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
