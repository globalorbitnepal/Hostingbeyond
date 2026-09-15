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
  { prompt: string; kind: "prompt" | "domain"; chips: string[] }
> = {
  "web-hosting": {
    prompt: "Launch your website in minutes",
    kind: "prompt",
    chips: ["NVMe SSD", "Free SSL", "99.9% uptime"],
  },
  "cloud-hosting": {
    prompt: "Scale across 12 global regions",
    kind: "prompt",
    chips: ["Auto-scale", "Anycast DNS", "Load balanced"],
  },
  "ecommerce-hosting": {
    prompt: "Checkout that never drops",
    kind: "prompt",
    chips: ["PCI ready", "Cart speed", "Secure pay"],
  },
  "wordpress-hosting": {
    prompt: "WordPress, turbocharged",
    kind: "prompt",
    chips: ["1-click WP", "Staging", "LiteSpeed"],
  },
  "reseller-hosting": {
    prompt: "Sell hosting under your brand",
    kind: "prompt",
    chips: ["White label", "WHM", "Your prices"],
  },
  "business-email": {
    prompt: "you@yourbrand.com is ready",
    kind: "prompt",
    chips: ["Custom domain", "AI inbox", "Spam shield"],
  },
  vps: {
    prompt: "Root access. Isolated compute.",
    kind: "prompt",
    chips: ["Full root", "NVMe", "DDoS shield"],
  },
  domains: {
    prompt: "yourbrand",
    kind: "domain",
    chips: [".com", ".net", ".io"],
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
    prompt: product.name,
    kind: "prompt" as const,
    chips: [product.category],
  };

  return (
    <article className="group relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-[32px] border border-white/35 bg-white/12 shadow-[0_28px_70px_-32px_rgba(15,10,40,0.55)] backdrop-blur-2xl transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transform-none lg:min-h-[470px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
      <div className="flex min-h-[420px] flex-1 flex-col lg:min-h-[460px] lg:flex-row lg:items-stretch">
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
        <div className="relative mx-5 mb-5 h-[210px] w-[calc(100%-2.5rem)] shrink-0 overflow-hidden rounded-[24px] border border-white/35 bg-white/10 ring-1 ring-white/20 sm:mx-6 sm:mb-6 sm:h-[250px] sm:w-[calc(100%-3rem)] lg:my-6 lg:mr-6 lg:ml-0 lg:h-auto lg:min-h-[280px] lg:w-[min(52%,28rem)] lg:flex-none">
          <SolutionImageCarousel
            images={product.images}
            overlayText={stage.prompt}
            overlayKind={stage.kind}
            chips={stage.chips}
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
