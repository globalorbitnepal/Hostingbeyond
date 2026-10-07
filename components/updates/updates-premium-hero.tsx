import Link from "next/link";
import { Megaphone, Rocket, Shield, Sparkles, Zap } from "lucide-react";

import type { CmsUpdatesHubPageContent } from "@/lib/orbit/updates-hub-page-content";

const ICONS = [Rocket, Zap, Shield, Megaphone, Sparkles];

export function UpdatesPremiumHero({
  content,
}: {
  content: CmsUpdatesHubPageContent;
}) {
  const featured = content.updates
    .filter((u) => u.visible !== false && u.featured)
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
            {featured.length ? "Highlighted" : "Release notes"}
          </p>
          {featured.length ? (
            <ul className="mt-4 space-y-3">
              {featured.map((item, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs text-white/70">{item.date}</p>
                      <p className="text-sm font-bold text-white">
                        {item.title}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Product updates appear here when your team publishes entries from
              Orbit. No placeholder announcements are shown on the live site.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
