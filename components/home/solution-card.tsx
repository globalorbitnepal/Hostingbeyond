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

const CROP: Record<string, string> = {
  "web-hosting-screen.png": "object-[62%_48%]",
  "cloud-hosting-screen.png": "object-[50%_50%]",
  "ecommerce-screen.png": "object-[50%_78%]",
  "wordpress-screen.png": "object-[50%_70%]",
  "reseller-screen.png": "object-[50%_50%]",
  "business-email-screen.png": "object-[50%_62%]",
  "vps-screen.png": "object-[50%_50%]",
  "domains-screen.png": "object-[50%_20%]",
};

function cropFor(url: string) {
  const file = url.split("/").pop() ?? "";
  return CROP[file] ?? "object-center";
}

type Props = {
  product: CmsSolutionProduct;
  paused?: boolean;
  priority?: boolean;
};

export function SolutionCard({ product, paused, priority }: Props) {
  const Icon = ICONS[product.icon] ?? Server;
  const shots = (product.images ?? [])
    .filter((image) => image.visible !== false && image.url.trim())
    .sort((a, b) => a.order - b.order);
  const plate = shots[0]?.url ?? "";
  const plateB = shots[1]?.url;
  const alt = shots[0]?.alt?.trim() || `${product.name} screen`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/72 shadow-[0_24px_60px_-32px_rgba(47,28,106,0.4)] ring-1 ring-white/90 backdrop-blur-2xl transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transform-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />
      <div className="flex flex-1 flex-col lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
              <span className="inline-flex size-8 items-center justify-center rounded-xl border border-white/80 bg-white/70 text-[#673de6]">
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
          <h3 className="font-heading mt-4 text-[1.55rem] leading-[1.08] font-semibold tracking-[-0.04em] text-[#2f1c6a] sm:text-[1.75rem]">
            {product.name}
          </h3>
          <p className="mt-2 max-w-[34ch] text-[14.5px] leading-6 text-slate-600">
            {product.description}
          </p>
          <Link
            href={product.ctaHref || "/"}
            className="mt-auto inline-flex min-h-10 items-center gap-2 pt-4 text-sm font-semibold text-[#673de6] transition hover:gap-2.5 hover:text-[#2563eb]"
          >
            {product.ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="relative mx-4 mb-4 aspect-[4/3] w-[calc(100%-2rem)] shrink-0 sm:mx-5 sm:mb-5 sm:w-[calc(100%-2.5rem)] lg:my-5 lg:mr-5 lg:ml-0 lg:w-[min(46%,20.5rem)]">
          <div className="hb-sol-display absolute inset-0 overflow-hidden">
            <div className="hb-sol-display-glass absolute inset-[6px] overflow-hidden">
              {plate ? (
                <SolutionImageCarousel
                  src={plate}
                  srcB={plateB}
                  alt={alt}
                  cropClass={cropFor(plate)}
                  paused={paused}
                  priority={priority}
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 42vw, 328px"
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#12082a] px-4 text-center text-[12px] font-semibold text-white/55">
                  No image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function solutionCardWidthClass() {
  return cn(
    "w-[calc(100vw-2*var(--hb-shell-pad))] max-w-none shrink-0 snap-start sm:w-[min(68vw,500px)] lg:w-[calc((100vw-2*var(--hb-shell-pad)-1.5rem)/2)] xl:w-[calc((100vw-2*var(--hb-shell-pad)-2.5rem)/2.25)]",
  );
}
