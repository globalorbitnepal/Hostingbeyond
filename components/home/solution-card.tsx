"use client";

import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  Cpu,
  Globe2,
  LayoutTemplate,
  Mail,
  Server,
  ShoppingBag,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { CmsSolutionProduct } from "@/lib/orbit/defaults";
import { SolutionImageCarousel } from "./solution-image-carousel";

const ICONS = {
  server: Server,
  cloud: Cloud,
  cart: ShoppingBag,
  wordpress: LayoutTemplate,
  users: Users,
  mail: Mail,
  cpu: Cpu,
  globe: Globe2,
} as const;

const STAGES: Record<string, { file: string; cropClass: string }> = {
  "web-hosting": {
    file: "web-hosting-screen.png",
    cropClass: "object-[62%_48%]",
  },
  "cloud-hosting": {
    file: "cloud-hosting-screen.png",
    cropClass: "object-[50%_50%]",
  },
  "ecommerce-hosting": {
    file: "ecommerce-screen.png",
    cropClass: "object-[50%_78%]",
  },
  "wordpress-hosting": {
    file: "wordpress-screen.png",
    cropClass: "object-[50%_70%]",
  },
  "reseller-hosting": {
    file: "reseller-screen.png",
    cropClass: "object-[50%_50%]",
  },
  "business-email": {
    file: "business-email-screen.png",
    cropClass: "object-[50%_62%]",
  },
  vps: {
    file: "vps-screen.png",
    cropClass: "object-[50%_50%]",
  },
  domains: {
    file: "domains-screen.png",
    cropClass: "object-[50%_20%]",
  },
};

type Props = {
  product: CmsSolutionProduct;
  paused?: boolean;
  priority?: boolean;
};

export function SolutionCard({ product, paused, priority }: Props) {
  const Icon = ICONS[product.icon] ?? Server;
  const stage = STAGES[product.id] ?? {
    file: "",
    cropClass: "object-center",
  };
  const plate = stage.file ? `/images/home/solutions/${stage.file}` : "";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/72 shadow-[0_32px_80px_-36px_rgba(47,28,106,0.45)] ring-1 ring-white/90 backdrop-blur-2xl transition-transform duration-500 ease-out hover:-translate-y-1.5 motion-reduce:transform-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />

      <div className="relative m-3 mb-0 sm:m-3.5 sm:mb-0">
        <div className="hb-sol-display relative aspect-[16/10] overflow-hidden">
          <div className="hb-sol-display-glass absolute inset-[7px] overflow-hidden sm:inset-[8px]">
            <SolutionImageCarousel
              src={plate}
              alt={`${product.name} live screen`}
              cropClass={stage.cropClass}
              paused={paused}
              priority={priority}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 560px"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-6 pt-5 pb-6 sm:px-7 sm:pt-6 sm:pb-7">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
            <span className="inline-flex size-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 text-[#673de6] shadow-[0_8px_18px_rgba(47,28,106,0.08)]">
              <Icon className="size-4" strokeWidth={1.8} />
            </span>
            {product.category}
          </p>
          {product.badge.trim() ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {product.badge}
            </span>
          ) : null}
        </div>
        <h3 className="font-heading mt-4 text-[1.7rem] leading-[1.08] font-semibold tracking-[-0.04em] text-[#2f1c6a] sm:text-[1.95rem]">
          {product.name}
        </h3>
        <p className="mt-2.5 max-w-[42ch] text-[15px] leading-7 text-slate-600">
          {product.description}
        </p>
        <Link
          href={product.ctaHref || "/"}
          className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-[#673de6] transition hover:gap-2.5 hover:text-[#2563eb]"
        >
          {product.ctaLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function solutionCardWidthClass() {
  return cn(
    "w-[calc(100vw-2*var(--hb-shell-pad))] max-w-none shrink-0 snap-start sm:w-[min(78vw,560px)] lg:w-[calc((100vw-2*var(--hb-shell-pad)-1.5rem)/2)] xl:w-[calc((100vw-2*var(--hb-shell-pad)-2rem)/2.05)]",
  );
}
