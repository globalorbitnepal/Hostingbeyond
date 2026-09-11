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

type Props = {
  product: CmsSolutionProduct;
  paused?: boolean;
  priority?: boolean;
};

export function SolutionCard({ product, paused, priority }: Props) {
  const Icon = ICONS[product.icon] ?? Server;

  return (
    <article className="group relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white/88 shadow-[0_24px_70px_-36px_rgba(37,80,130,0.45)] backdrop-blur-sm transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transform-none lg:min-h-[470px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--hb-blue)]/50 to-transparent"
      />
      <div className="flex min-h-[420px] flex-1 flex-col lg:min-h-[460px] lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-5">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-[#EEF4FF] text-[var(--hb-blue)]">
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
          <h3 className="font-heading mt-5 text-[1.85rem] leading-[1.08] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2.05rem]">
            {product.name}
          </h3>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-7 text-slate-600">
            {product.description}
          </p>
          <Link
            href={product.ctaHref || "/"}
            className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-sm font-semibold text-[var(--hb-blue)] transition hover:gap-2.5 hover:text-[#1d4ed8]"
          >
            {product.ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="relative mx-5 mb-5 h-[210px] w-[calc(100%-2.5rem)] shrink-0 overflow-hidden rounded-[24px] bg-[#e8f1fb] sm:mx-6 sm:mb-6 sm:h-[250px] sm:w-[calc(100%-3rem)] lg:my-6 lg:mr-6 lg:ml-0 lg:h-auto lg:min-h-[280px] lg:w-[min(52%,28rem)] lg:flex-none">
          <SolutionImageCarousel
            images={product.images}
            paused={paused}
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 480px"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </article>
  );
}

export function solutionCardWidthClass() {
  return cn(
    "w-[calc(100vw-2*var(--hb-shell-pad))] max-w-none shrink-0 snap-start sm:w-[min(70vw,540px)] lg:w-[calc((100vw-2*var(--hb-shell-pad)-1.5rem)/2)] xl:w-[calc((100vw-2*var(--hb-shell-pad)-2rem)/2.15)]",
  );
}
