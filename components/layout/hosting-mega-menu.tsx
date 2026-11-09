"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Globe,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

import { LocalizedText } from "@/components/i18n/localized-text";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

type HostingItem = {
  href: string;
  title: string;
  description: string;
  logo?: string;
  logoAlt?: string;
  tile: string;
  lucide?: LucideIcon;
  lucideClass?: string;
};

const FEATURED: Array<{ id: string; label: string; items: HostingItem[] }> = [
  {
    id: "website",
    label: "Website Hosting",
    items: [
      {
        href: routes.hosting,
        title: "Web Hosting",
        description: "Fast and reliable hosting for websites.",
        lucide: Globe,
        lucideClass: "text-[#2563eb]",
        tile: "bg-[#e8f1ff]",
      },
      {
        href: `${routes.hosting}/wordpress`,
        title: "WordPress Hosting",
        description: "Optimized hosting for WordPress.",
        logo: "/images/nav-brands/wordpress.svg",
        logoAlt: "WordPress",
        tile: "bg-[#e8f4f8]",
      },
      {
        href: `${routes.hosting}/ecommerce`,
        title: "eCommerce Hosting",
        description: "High-performance hosting for online stores.",
        lucide: ShoppingCart,
        lucideClass: "text-[#db2777]",
        tile: "bg-[#fce7f3]",
      },
    ],
  },
  {
    id: "application",
    label: "Application Hosting",
    items: [
      {
        href: "/nodejs-hosting",
        title: "Node.js Hosting",
        description: "Deploy Node.js, NestJS and Next.js apps.",
        logo: "/images/nav-brands/nodedotjs.svg",
        logoAlt: "Node.js",
        tile: "bg-[#ecfdf3]",
      },
      {
        href: "/laravel-hosting",
        title: "PHP & Laravel Hosting",
        description: "Powerful hosting for PHP and Laravel.",
        logo: "/images/nav-brands/laravel.svg",
        logoAlt: "Laravel",
        tile: "bg-[#fff1f2]",
      },
    ],
  },
];

const PROMO_BENEFITS = [
  "NVMe SSD",
  "Free SSL",
  "Automatic Backups",
  "24/7 Support",
] as const;

function ItemIcon({ item }: { item: HostingItem }) {
  if (item.logo) {
    return (
      <Image
        src={`${item.logo}?v=logo9`}
        alt={item.logoAlt ?? ""}
        width={22}
        height={22}
        unoptimized
        className="h-[22px] w-[22px] object-contain"
      />
    );
  }
  const Icon = item.lucide ?? Globe;
  return (
    <Icon
      className={cn("size-[18px]", item.lucideClass ?? "text-[#4f46e5]")}
      strokeWidth={2}
      aria-hidden
    />
  );
}

function HostingNavLink({
  item,
  onNavigate,
}: {
  item: HostingItem;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group flex items-center gap-3 rounded-2xl px-1.5 py-2 transition hover:bg-slate-50"
    >
      <span
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
          item.tile,
        )}
      >
        <ItemIcon item={item} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] leading-tight font-bold tracking-[-0.02em] text-slate-950">
          <LocalizedText text={item.title} />
        </span>
        <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500">
          <LocalizedText text={item.description} />
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-slate-300 transition duration-150 group-hover:translate-x-0.5 group-hover:text-[#7c3aed]"
        aria-hidden
      />
    </Link>
  );
}

function ServerRacks() {
  return (
    <svg
      viewBox="0 0 420 280"
      className="absolute inset-y-0 right-0 h-full w-[70%] opacity-90"
      aria-hidden
      preserveAspectRatio="xMaxYMid slice"
    >
      <defs>
        <linearGradient id="hb-rack-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((col) => (
        <g key={col} transform={`translate(${48 + col * 112} 22)`}>
          <rect
            x="0"
            y="0"
            width="92"
            height="236"
            rx="10"
            fill="url(#hb-rack-face)"
            opacity="0.92"
          />
          {Array.from({ length: 8 }).map((_, row) => (
            <g key={row} transform={`translate(8 ${16 + row * 26})`}>
              <rect
                width="76"
                height="17"
                rx="3"
                fill="#0f172a"
                opacity="0.55"
              />
              <circle cx="11" cy="8.5" r="2.2" fill="#22d3ee" />
              <circle
                cx="21"
                cy="8.5"
                r="2"
                fill={row % 2 === 0 ? "#34d399" : "#a78bfa"}
              />
              <rect
                x="32"
                y="5.5"
                width="36"
                height="5.5"
                rx="1.5"
                fill="#818cf8"
                opacity="0.55"
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

function PromoPanel({ compact }: { compact: boolean }) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-[linear-gradient(118deg,#3b0764_0%,#5b21b6_38%,#4c1d95_72%,#312e81_100%)] text-white",
        compact
          ? "min-h-[200px] rounded-[22px] p-5"
          : "h-full min-h-[220px] rounded-[22px] p-5 lg:p-6",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,rgba(192,132,252,0.38),transparent_58%)]"
      />
      <ServerRacks />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#3b0764] via-[#4c1d95]/90 to-transparent"
      />

      <div className="relative z-[1] flex h-full max-w-[24rem] flex-col justify-center pr-4">
        <p className="text-[10px] font-extrabold tracking-[0.2em] text-violet-200 uppercase">
          Premium Hosting
        </p>
        <p className="font-heading mt-2 text-[1.45rem] leading-[1.12] font-extrabold tracking-[-0.04em] sm:text-[1.65rem]">
          Reliable & Scalable Hosting for Every Project
        </p>
        <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {PROMO_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-white"
            >
              <span
                className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[#064e3b]"
                aria-hidden
              >
                <Check className="size-2.5" strokeWidth={3.5} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function HostingMegaMenu({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-white/80 bg-white shadow-[0_28px_70px_-28px_rgba(91,33,182,0.45),0_12px_32px_-18px_rgba(15,23,42,0.12)]",
        compact ? "rounded-[22px]" : "rounded-[28px]",
      )}
    >
      <div
        className={cn(
          "grid gap-5 p-4 sm:p-5",
          compact
            ? "grid-cols-1"
            : "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.95fr)_minmax(280px,1.2fr)] lg:items-stretch lg:gap-6",
        )}
      >
        {FEATURED.map((group) => (
          <div key={group.id} className="min-w-0">
            <p className="mb-2.5 inline-flex rounded-full bg-[#efe7ff] px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-[#6d28d9] uppercase">
              <LocalizedText text={group.label} />
            </p>
            <ul className="space-y-0">
              {group.items.map((item) => (
                <li key={`${group.id}-${item.title}`}>
                  <HostingNavLink item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <PromoPanel compact={compact} />
      </div>
    </div>
  );
}

export { isHostingNavLabel } from "@/lib/navigation/hosting-nav";
