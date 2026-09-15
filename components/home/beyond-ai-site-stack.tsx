"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { useTyped } from "@/hooks/use-typed";
import { cn } from "@/lib/utils";
import type { CmsBeyondAiSite } from "@/lib/orbit/defaults";

type SiteVisual = {
  name: string;
  kicker: string;
  src: string;
  theme: string;
};

const FALLBACK_SITES: SiteVisual[] = [
  {
    name: "Azure Stay",
    kicker: "Hotel",
    src: "/images/home/beyond-ai/hotel.png",
    theme: "from-[#12082a]/70",
  },
  {
    name: "Horizon Trek",
    kicker: "Adventure",
    src: "/images/home/beyond-ai/trek.png",
    theme: "from-[#0b1f14]/70",
  },
  {
    name: "Vertex Studio",
    kicker: "Business",
    src: "/images/home/beyond-ai/business.png",
    theme: "from-[#0f172a]/70",
  },
  {
    name: "Bloom Shop",
    kicker: "Store",
    src: "/images/home/solutions/ecommerce.png",
    theme: "from-[#2f1c6a]/65",
  },
  {
    name: "Peak Journal",
    kicker: "Blog",
    src: "/images/home/solutions/wordpress.png",
    theme: "from-[#1e1b4b]/65",
  },
];

const THEMES = [
  "from-[#12082a]/70",
  "from-[#0b1f14]/70",
  "from-[#0f172a]/70",
  "from-[#2f1c6a]/65",
  "from-[#1e1b4b]/65",
];

function toVisuals(sites?: CmsBeyondAiSite[]): SiteVisual[] {
  const fromCms = (sites ?? [])
    .filter((site) => site.visible !== false && site.imageUrl?.trim())
    .sort((a, b) => a.order - b.order)
    .map((site, index) => ({
      name: site.name || "Site",
      kicker: site.status || site.domain || "Live",
      src: site.imageUrl.trim(),
      theme: THEMES[index % THEMES.length],
    }));
  return fromCms.length ? fromCms : FALLBACK_SITES;
}

function SiteCard({ site }: { site: SiteVisual }) {
  return (
    <article className="mb-4 overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)]">
      <div className="flex h-7 items-center gap-1.5 border-b border-slate-100 bg-white px-2.5">
        <span className="size-1.5 rounded-full bg-[#ff5f57]" />
        <span className="size-1.5 rounded-full bg-[#febc2e]" />
        <span className="size-1.5 rounded-full bg-[#28c840]" />
        <span className="ml-1 truncate text-[9px] font-semibold text-slate-400">
          {site.kicker.toLowerCase()}.com
        </span>
      </div>
      <div className="relative aspect-[16/10]">
        <Image
          src={site.src}
          alt={site.name}
          fill
          sizes="280px"
          unoptimized
          className="object-cover"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t to-transparent",
            site.theme,
          )}
        />
        <div className="absolute inset-x-3 bottom-3">
          <p className="text-[9px] font-semibold tracking-wide text-white/70 uppercase">
            {site.kicker}
          </p>
          <p className="font-heading text-[15px] leading-tight font-extrabold text-white">
            {site.name}
          </p>
        </div>
      </div>
    </article>
  );
}

export function BeyondAiSiteStack({ sites }: { sites?: CmsBeyondAiSite[] }) {
  const reduce = useReducedMotion();
  const visuals = toVisuals(sites);
  const typed = useTyped(
    "Create a luxury hotel website with a pool hero",
    !reduce,
    reduce,
    true,
  );
  const colA = [...visuals, ...visuals];
  const colB = [
    ...visuals.slice(2),
    ...visuals.slice(0, 2),
    ...visuals.slice(2),
    ...visuals.slice(0, 2),
  ];

  return (
    <div className="relative h-[380px] w-full sm:h-[430px] lg:h-[470px]">
      <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(180deg,transparent,black_12%,black_78%,transparent)]">
        <div className="flex h-full gap-3 px-1 sm:gap-4">
          <div className="w-1/2 overflow-hidden">
            <div className={reduce ? "" : "hb-sites-up"}>
              {colA.map((site, index) => (
                <SiteCard key={`a-${site.name}-${index}`} site={site} />
              ))}
            </div>
          </div>
          <div className="w-1/2 overflow-hidden pt-10">
            <div className={reduce ? "" : "hb-sites-down"}>
              {colB.map((site, index) => (
                <SiteCard key={`b-${site.name}-${index}`} site={site} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-2 bottom-2 z-20 sm:inset-x-4 sm:bottom-3">
        <div className="flex items-center gap-2 rounded-full border border-white bg-white px-4 py-2.5 shadow-[0_18px_40px_-12px_rgba(47,28,106,0.35)]">
          <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#2f1c6a] sm:text-[15px]">
            {typed}
            <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
          </p>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-white shadow-[0_8px_18px_rgba(103,61,230,0.35)]">
            →
          </span>
        </div>
      </div>
    </div>
  );
}
