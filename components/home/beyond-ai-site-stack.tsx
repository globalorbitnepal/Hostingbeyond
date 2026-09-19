"use client";

import Image from "next/image";
import {
  ArrowRight,
  Building2,
  Mountain,
  Search,
  Sparkles,
  Sun,
  TreePalm,
} from "lucide-react";

import { useInView } from "@/hooks/use-in-view";
import { useTyped } from "@/hooks/use-typed";
import {
  defaultBeyondAiSection,
  type CmsBeyondAiSite,
} from "@/lib/orbit/defaults";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";

const BRAND_ICONS = [Building2, Mountain, Sun, TreePalm] as const;
const BRAND_COLORS = ["#f97316", "#16a34a", "#ea580c", "#0d9488"] as const;
const BUNDLED_WORKSPACE = "/images/home/beyond-ai/workspace.jpg";
const FALLBACK_ALT = "Building a Beyond AI website on a laptop at a home desk";

function pinRegion(country: string) {
  const value = country.toLowerCase();
  if (value.includes("kingdom") || value === "uk") return "UK";
  if (value.includes("united states") || value.includes("usa")) return "USA";
  if (value.includes("uae") || value.includes("dubai")) return "UAE";
  if (value.includes("australia")) return "Australia";
  return country.split(" ")[0] || country;
}

function visibleSites(sites?: CmsBeyondAiSite[]) {
  const fromCms = (sites ?? [])
    .filter((site) => site.visible !== false && site.imageUrl?.trim())
    .sort((a, b) => a.order - b.order)
    .map((site) => ({
      ...site,
      imageUrl: site.imageUrl.trim(),
    }));
  const list = fromCms.length ? fromCms : defaultBeyondAiSection().sites;
  const uploaded = list.filter((site) => isRuntimeMediaSrc(site.imageUrl));
  const chosen = uploaded.length >= 4 ? uploaded : list;
  return chosen.slice(0, 4);
}

function SiteCard({ site, index }: { site: CmsBeyondAiSite; index: number }) {
  const Icon = BRAND_ICONS[index % BRAND_ICONS.length];
  const color = BRAND_COLORS[index % BRAND_COLORS.length];
  const nav = (site.nav || "Home  About  Contact").split(/\s{2,}|\s·\s/);
  const src = site.imageUrl;

  return (
    <article className="overflow-hidden rounded-[18px] bg-white shadow-[0_16px_36px_-18px_rgba(15,10,40,0.55)] ring-1 ring-white/80">
      <div className="flex h-8 items-center gap-2 border-b border-slate-100 px-2.5">
        <span className="flex shrink-0 gap-[3px]">
          <span className="size-1.5 rounded-full bg-[#ff5f57]" />
          <span className="size-1.5 rounded-full bg-[#febc2e]" />
          <span className="size-1.5 rounded-full bg-[#28c840]" />
        </span>
        <span
          className="inline-flex min-w-0 items-center gap-1 text-[9px] font-extrabold tracking-tight text-slate-800"
          style={{ color }}
        >
          <Icon className="size-3 shrink-0" />
          <span className="truncate">{site.name}</span>
        </span>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 text-[8px] font-semibold text-slate-400 sm:flex">
          {nav.slice(0, 5).map((item) => (
            <span key={item} className="truncate">
              {item}
            </span>
          ))}
        </nav>
        <Search className="ml-auto size-3 shrink-0 text-slate-300" />
      </div>
      <div className="relative aspect-[16/10]">
        <Image
          src={src}
          alt={site.imageAlt || site.name}
          fill
          sizes="(max-width: 1024px) 50vw, 280px"
          unoptimized={isRuntimeMediaSrc(src)}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/25 to-black/5" />
        <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-[15px] leading-[1.05] font-extrabold tracking-tight text-white drop-shadow sm:text-[17px]">
              {(site.headline || site.name).split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            {site.subhead ? (
              <p className="mt-1 text-[9px] leading-snug font-medium text-white/90 sm:text-[10px]">
                {site.subhead}
              </p>
            ) : null}
            {site.cta ? (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-bold text-white ring-1 ring-white/35 backdrop-blur-md sm:text-[9px]">
                {site.cta}
                <ArrowRight className="size-2.5" />
              </span>
            ) : null}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-slate-700 shadow-sm">
            <span aria-hidden>{site.flag || "🌐"}</span>
            {site.country}
          </span>
        </div>
      </div>
    </article>
  );
}

function WorkspacePhoto({
  imageUrl,
  imageAlt,
}: {
  imageUrl?: string;
  imageAlt?: string;
}) {
  const src = imageUrl?.trim() || BUNDLED_WORKSPACE;
  const alt = imageAlt?.trim() || FALLBACK_ALT;

  return (
    <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
      <div className="relative aspect-[4/3] overflow-hidden sm:rounded-[28px] lg:aspect-auto lg:min-h-[540px] lg:rounded-[32px]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 52vw"
          unoptimized={isRuntimeMediaSrc(src) || src.endsWith(".jpg")}
          className="object-cover object-[62%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-[#673de6] via-[#673de6]/35 to-transparent"
        />
      </div>
    </div>
  );
}

export function BeyondAiSiteStack({
  sites,
  imageUrl,
  imageAlt,
}: {
  sites?: CmsBeyondAiSite[];
  imageUrl?: string;
  imageAlt?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>("80px");
  const visuals = visibleSites(sites);
  const hasCmsSites = (sites ?? []).some(
    (site) => site.visible !== false && site.imageUrl?.trim(),
  );
  const typed = useTyped(
    "Create a website for my business...",
    inView,
    !inView,
    true,
  );

  if (!hasCmsSites) {
    return <WorkspacePhoto imageUrl={imageUrl} imageAlt={imageAlt} />;
  }

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden
        className="hb-beyond-map pointer-events-none absolute -inset-6 -top-14 hidden lg:block"
      />

      <div className="relative z-10 mb-3 hidden grid-cols-4 gap-2 px-6 lg:grid">
        {visuals.map((site) => (
          <div key={`pin-${site.id}`} className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-2.5 py-1 shadow-[0_8px_20px_rgba(47,28,106,0.16)]">
              <span className="text-[13px] leading-none" aria-hidden>
                {site.flag}
              </span>
              <span className="leading-tight">
                <span className="block text-[9px] font-extrabold tracking-wide text-[#2f1c6a] uppercase">
                  {pinRegion(site.country)}
                </span>
                <span className="block text-[9px] font-medium text-slate-500">
                  {site.city}
                </span>
              </span>
            </span>
          </div>
        ))}
      </div>

      <svg
        aria-hidden
        className="pointer-events-none absolute top-7 right-10 left-10 z-[11] hidden h-10 lg:block"
        viewBox="0 0 800 40"
        fill="none"
      >
        <path
          d="M80 8 C80 28, 140 36, 180 36"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.4"
          strokeDasharray="3 5"
        />
        <path
          d="M280 8 C280 28, 300 36, 340 36"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.4"
          strokeDasharray="3 5"
        />
        <path
          d="M520 8 C520 28, 500 36, 460 36"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.4"
          strokeDasharray="3 5"
        />
        <path
          d="M720 8 C720 28, 660 36, 620 36"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.4"
          strokeDasharray="3 5"
        />
      </svg>

      <div className="relative z-20 rounded-[28px] border border-white/35 bg-white/10 p-2.5 shadow-[0_24px_60px_-24px_rgba(15,10,40,0.45)] backdrop-blur-xl sm:p-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          {visuals.map((site, index) => (
            <SiteCard key={site.id} site={site} index={index} />
          ))}
        </div>

        <div className="mt-2.5 flex items-center gap-2 rounded-full border border-white/70 bg-white px-3 py-2 shadow-[0_16px_36px_-12px_rgba(47,28,106,0.4)] sm:px-4 sm:py-2.5">
          <Sparkles className="size-4 shrink-0 text-[#673de6]" />
          <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#2f1c6a] sm:text-[15px]">
            {typed}
            <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
          </p>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#673de6] text-white shadow-[0_8px_18px_rgba(103,61,230,0.4)]">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
