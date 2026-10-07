import Link from "next/link";
import {
  BookOpen,
  Globe2,
  Search,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";

import { TipsSearch } from "@/components/tips/tips-search";
import type { CmsTipsHubPageContent } from "@/lib/orbit/tips-hub-page-content";

const FLOAT_ICONS = [Server, Globe2, Shield, BookOpen, Sparkles];

export function TipsPremiumHero({
  content,
  initialQuery = "",
  category,
  compact = false,
}: {
  content: CmsTipsHubPageContent;
  initialQuery?: string;
  category?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`hb-band-purple relative overflow-hidden text-white ${
        compact ? "py-10 sm:py-12" : "py-14 sm:py-16 lg:py-20"
      }`}
    >
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
          <h1
            className={`font-heading mt-3 font-extrabold tracking-[-0.04em] ${
              compact
                ? "text-2xl sm:text-3xl"
                : "text-[clamp(2rem,4.5vw,3.35rem)] leading-[1.08]"
            }`}
          >
            {compact && initialQuery ? (
              "Search results"
            ) : (
              <>
                {content.heroTitle}{" "}
                <span className="text-[#c7d7ff]">
                  {content.heroTitleAccent}
                </span>
              </>
            )}
          </h1>
          {!compact ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/88 sm:text-[17px]">
              {content.heroDescription}
            </p>
          ) : null}
          <div className="mt-7 max-w-xl">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-1.5 backdrop-blur-md">
              <TipsSearch
                initialQuery={initialQuery}
                category={category}
                variant="hero"
              />
            </div>
          </div>
          {!compact && !initialQuery ? (
            <div className="mt-6 flex flex-wrap gap-3">
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
          ) : null}
        </div>
        <div
          className="relative hidden min-h-[280px] rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-md lg:block"
          aria-hidden
        >
          <p className="text-xs font-bold tracking-wide text-[#c4b5fd] uppercase">
            Learning paths
          </p>
          <ul className="mt-4 space-y-3">
            {content.learningPaths
              .filter((p) => p.visible !== false)
              .slice(0, 4)
              .map((path, i) => {
                const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length];
                return (
                  <li
                    key={path.id}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {path.title}
                      </p>
                      <p className="text-xs text-white/75">
                        {path.description}
                      </p>
                    </div>
                  </li>
                );
              })}
          </ul>
          <div className="absolute -right-4 -bottom-4 flex size-16 items-center justify-center rounded-2xl bg-[#2563eb]/40 text-white shadow-xl ring-1 ring-white/20">
            <Search className="size-7" />
          </div>
        </div>
      </div>
    </section>
  );
}
