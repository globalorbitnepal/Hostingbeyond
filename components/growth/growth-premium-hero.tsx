import Link from "next/link";
import {
  BarChart3,
  Layers,
  Mail,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type { CmsGrowthHubPageContent } from "@/lib/orbit/growth-hub-page-content";

const ICONS = [Rocket, TrendingUp, Mail, BarChart3, Layers, Sparkles];

export function GrowthPremiumHero({
  content,
}: {
  content: CmsGrowthHubPageContent;
}) {
  const featured = content.playbooks
    .filter((p) => p.visible !== false && p.featured)
    .slice(0, 3);

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
      <div className="hb-shell relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-[#c4b5fd] uppercase">
            {content.heroEyebrow}
          </p>
          <h1 className="font-heading mt-3 text-[clamp(2rem,4.5vw,3.35rem)] leading-[1.08] font-extrabold tracking-[-0.04em]">
            {content.heroTitle}{" "}
            <span className="text-[#c7d7ff]">{content.heroTitleAccent}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/88 sm:text-[17px]">
            {content.heroDescription}
          </p>
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
            Featured playbooks
          </p>
          <ul className="mt-4 space-y-3">
            {featured.map((item, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/25 to-white/5 ring-1 ring-white/20">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-wide text-[#c4b5fd] uppercase">
                      {item.category}
                    </p>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/80">
                      {item.excerpt}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
