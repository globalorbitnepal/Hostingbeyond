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

const STAGES: Record<
  string,
  {
    file: string;
    prompt: string;
    kind: "prompt" | "domain";
  }
> = {
  "web-hosting": {
    file: "web-hosting.png",
    prompt: "Launch your website in minutes",
    kind: "prompt",
  },
  "cloud-hosting": {
    file: "cloud-hosting.png",
    prompt: "Scale across 12 global regions",
    kind: "prompt",
  },
  "ecommerce-hosting": {
    file: "ecommerce.png",
    prompt: "Checkout that never drops",
    kind: "prompt",
  },
  "wordpress-hosting": {
    file: "wordpress.png",
    prompt: "WordPress, turbocharged",
    kind: "prompt",
  },
  "reseller-hosting": {
    file: "reseller.png",
    prompt: "Sell hosting under your brand",
    kind: "prompt",
  },
  "business-email": {
    file: "business-email.png",
    prompt: "you@yourbrand.com is ready",
    kind: "prompt",
  },
  vps: {
    file: "vps.png",
    prompt: "Root access. Isolated compute.",
    kind: "prompt",
  },
  domains: {
    file: "domains.png",
    prompt: "yourbrand",
    kind: "domain",
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
    prompt: product.name,
    kind: "prompt" as const,
  };
  const plate = stage.file
    ? `/images/home/solutions/${stage.file}?v=5`
    : product.images.find((image) => image.visible !== false)?.url || "";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/35 bg-white/12 shadow-[0_28px_70px_-32px_rgba(15,10,40,0.55)] backdrop-blur-2xl transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transform-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
      <div className="flex flex-1 flex-col lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-5">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">
              <span className="inline-flex size-8 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white">
                <Icon className="size-4" strokeWidth={1.8} />
              </span>
              {product.category}
            </p>
            {product.badge.trim() ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-100 uppercase">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {product.badge}
              </span>
            ) : null}
          </div>
          <h3 className="font-heading mt-5 text-[1.85rem] leading-[1.08] font-semibold tracking-[-0.04em] text-white sm:text-[2.05rem]">
            {product.name}
          </h3>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-7 text-white/70">
            {product.description}
          </p>
          <Link
            href={product.ctaHref || "/"}
            className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-sm font-semibold text-white transition hover:gap-2.5 hover:text-[#bfdbfe]"
          >
            {product.ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="relative mx-5 mb-5 aspect-[4/3] w-[calc(100%-2.5rem)] shrink-0 overflow-hidden rounded-[24px] border border-white/35 bg-[#1a0b3a] ring-1 ring-white/20 sm:mx-6 sm:mb-6 sm:w-[calc(100%-3rem)] lg:my-6 lg:mr-6 lg:ml-0 lg:w-[min(50%,26rem)]">
          <SolutionImageCarousel
            src={plate}
            alt={product.name}
            overlayText={stage.prompt}
            overlayKind={stage.kind}
            chromeLabel={product.category}
            paused={paused}
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 416px"
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
