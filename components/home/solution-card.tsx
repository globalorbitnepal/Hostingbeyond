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
      <div className="grid flex-1 grid-rows-[auto_1fr_auto] gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:grid-rows-1 lg:items-stretch">
        <div className="flex flex-col px-7 pt-7 pb-5 sm:px-8 sm:pt-8">
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
        <div className="relative mx-5 mb-5 min-h-[210px] overflow-hidden rounded-[24px] sm:mx-6 sm:mb-6 lg:my-6 lg:mr-6 lg:ml-0 lg:min-h-0">
          <SolutionImageCarousel
            images={product.images}
            paused={paused}
            priority={priority}
            sizes="(max-width: 1024px) 90vw, 340px"
            className="absolute inset-0"
          />
        </div>
      </div>
    </article>
  );
}

export function solutionCardWidthClass() {
  return cn(
    "w-[min(86vw,560px)] shrink-0 snap-start sm:w-[min(78vw,600px)] lg:w-[min(42vw,640px)]",
  );
}
