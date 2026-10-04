"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  HelpCircle,
  Server,
} from "lucide-react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

type HostingItem = {
  href: string;
  title: string;
  description: string;
  logo?: string;
  logoAlt?: string;
  tile: string;
  fit?: "cover" | "wide";
  lucide?: typeof Server;
};

const GROUPS: Array<{ id: string; label: string; items: HostingItem[] }> = [
  {
    id: "website",
    label: "Website Hosting",
    items: [
      {
        href: routes.hosting,
        title: "Web Hosting",
        description: "Simple and reliable hosting for websites.",
        logo: "/images/nav-brands/nginx.svg",
        logoAlt: "NGINX",
        tile: "bg-[#ecfdf3]",
      },
      {
        href: `${routes.hosting}/wordpress`,
        title: "WordPress Hosting",
        description: "Optimized hosting for WordPress websites.",
        logo: "/images/nav-brands/wordpress.svg",
        logoAlt: "WordPress",
        tile: "bg-[#e8f4f8]",
      },
      {
        href: `${routes.hosting}/ecommerce`,
        title: "eCommerce Hosting",
        description: "Powerful hosting for online stores.",
        logo: "/images/nav-brands/woocommerce.svg",
        logoAlt: "WooCommerce",
        tile: "bg-[#f3e8ff]",
      },
      {
        href: routes.cloud,
        title: "Business Hosting",
        description: "More resources for growing businesses.",
        lucide: Briefcase,
        tile: "bg-[#eff6ff]",
      },
    ],
  },
  {
    id: "developer",
    label: "Developer Hosting",
    items: [
      {
        href: `${routes.hosting}?stack=nodejs`,
        title: "Node.js Hosting",
        description: "Deploy Node.js applications with high performance.",
        logo: "/images/nav-brands/nodedotjs.svg",
        logoAlt: "Node.js",
        tile: "bg-[#ecfdf3]",
      },
      {
        href: `${routes.hosting}/python`,
        title: "Python Hosting",
        description:
          "Run Python applications with support for modern frameworks.",
        logo: "/images/nav-brands/python.svg",
        logoAlt: "Python",
        tile: "bg-[#eff6ff]",
      },
      {
        href: `${routes.hosting}?stack=laravel`,
        title: "Laravel Hosting",
        description: "Optimized hosting for Laravel projects.",
        lucide: Server,
        tile: "bg-[#fff7ed]",
      },
      {
        href: `${routes.hosting}?stack=django`,
        title: "Django Hosting",
        description: "Hosting for Django applications.",
        logo: "/images/nav-brands/django.svg",
        logoAlt: "Django",
        tile: "bg-[#ecfdf5]",
      },
      {
        href: `${routes.hosting}?stack=nestjs`,
        title: "NestJS Hosting",
        description: "Deploy modern NestJS applications.",
        logo: "/images/nav-brands/nestjs.svg",
        logoAlt: "NestJS",
        tile: "bg-[#fff1f2]",
      },
    ],
  },
  {
    id: "vps",
    label: "VPS Hosting",
    items: [
      {
        href: `${routes.vps}?hypervisor=kvm`,
        title: "KVM VPS",
        description: "Full root access with KVM virtualization.",
        logo: "/images/nav-brands/proxmox.svg",
        logoAlt: "KVM",
        tile: "bg-[#fff7ed]",
      },
      {
        href: `${routes.vps}?storage=nvme`,
        title: "NVMe VPS",
        description: "High-speed NVMe VPS for demanding workloads.",
        logo: "/images/nav-brands/nvme.svg",
        logoAlt: "NVMe Express",
        tile: "bg-[#0B1F33]",
      },
      {
        href: `${routes.vps}?os=linux`,
        title: "Linux VPS",
        description: "Ubuntu, Debian and other Linux distributions.",
        logo: "/images/nav-brands/linux.svg",
        logoAlt: "Linux",
        tile: "bg-[#0f172a]",
      },
      {
        href: `${routes.vps}?managed=1`,
        title: "Managed VPS",
        description: "Managed updates, security and technical support.",
        lucide: Server,
        tile: "bg-[#e0e7ff]",
      },
    ],
  },
  {
    id: "business",
    label: "Business",
    items: [
      {
        href: `${routes.hosting}/reseller`,
        title: "Reseller Hosting",
        description: "Start your own hosting business.",
        logo: "/images/nav-brands/cpanel.svg",
        logoAlt: "cPanel",
        tile: "bg-[#fff7ed]",
        fit: "wide",
      },
      {
        href: routes.hosting,
        title: "Agency Hosting",
        description: "Manage hosting for multiple clients.",
        lucide: BarChart3,
        tile: "bg-[#f3e8ff]",
      },
    ],
  },
];

const PROMO_BENEFITS = [
  "NVMe Storage",
  "Free SSL",
  "Automatic Backups",
  "24/7 Support",
] as const;

function ItemIcon({ item }: { item: HostingItem }) {
  if (item.logo) {
    return (
      <Image
        src={`${item.logo}?v=logo2`}
        alt={item.logoAlt ?? ""}
        width={40}
        height={40}
        unoptimized
        className={cn(
          "object-contain",
          item.fit === "cover"
            ? "h-full w-full object-cover"
            : item.fit === "wide"
              ? "h-[18px] w-[30px]"
              : item.tile.includes("#0")
                ? "h-[22px] w-[22px] brightness-0 invert"
                : "h-[28px] w-[28px]",
        )}
      />
    );
  }
  const Icon = item.lucide ?? Server;
  return (
    <Icon className="size-[20px] text-[#4f46e5]" strokeWidth={2} aria-hidden />
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
      className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 transition duration-150 hover:bg-slate-50/90"
    >
      <span
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_8px_16px_-10px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/80",
          item.tile,
        )}
      >
        <ItemIcon item={item} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold tracking-[-0.02em] text-slate-950 transition group-hover:text-[#1d4ed8]">
          {item.title}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
          {item.description}
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#6366f1]"
        aria-hidden
      />
    </Link>
  );
}

function PromoPanel({
  compact,
  onNavigate,
}: {
  compact: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,#2563eb_0%,#4f46e5_48%,#7c3aed_100%)] text-white",
        compact ? "rounded-[20px] p-5" : "h-full min-h-[280px] p-6 sm:p-7",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-8 size-40 rounded-full bg-white/15 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 left-[-15%] size-48 rounded-full bg-[#93c5fd]/20 blur-3xl"
      />

      <div className="relative">
        <p className="text-[10px] font-extrabold tracking-[0.16em] text-white/75 uppercase">
          Reliable & scalable
        </p>
        <p className="font-heading mt-2 text-[1.35rem] leading-[1.12] font-extrabold tracking-[-0.04em] sm:text-[1.5rem]">
          Premium Hosting for Every Need
        </p>
        <p className="mt-2 max-w-[32ch] text-[12.5px] leading-relaxed text-white/88">
          Fast, secure and scalable hosting for websites, applications and
          businesses.
        </p>
        <ul className="mt-4 space-y-2">
          {PROMO_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-2 text-[12.5px] font-medium text-white/95"
            >
              <span
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/90 text-white shadow-sm"
                aria-hidden
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={routes.pricing}
        onClick={onNavigate}
        className="relative mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[13px] font-bold text-[#3730a3] shadow-[0_12px_28px_rgba(15,23,42,0.2)] transition hover:bg-indigo-50"
      >
        View All Hosting Plans
        <ArrowRight className="size-4" aria-hidden />
      </Link>

      {!compact ? (
        <div
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-2 hidden w-[42%] max-w-[160px] opacity-90 sm:block"
        >
          <Image
            src="/images/home/solutions/vps-screen.png"
            alt=""
            width={320}
            height={240}
            className="h-auto w-full object-contain drop-shadow-[0_20px_40px_rgba(15,23,42,0.35)]"
          />
        </div>
      ) : null}
    </div>
  );
}

function BottomActions({
  onNavigate,
  compact,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const cards = [
    {
      href: routes.pricing,
      title: "Compare Hosting Plans",
      description: "Compare features and prices",
      icon: FileText,
      tone: "from-[#eff6ff] to-[#e0e7ff]",
      iconTone: "bg-[#dbeafe] text-[#2563eb]",
    },
    {
      href: routes.getStarted,
      title: "Not sure which plan?",
      description: "Find the right hosting",
      icon: HelpCircle,
      tone: "from-[#f5f3ff] to-[#ede9fe]",
      iconTone: "bg-[#ede9fe] text-[#7c3aed]",
    },
  ] as const;

  return (
    <div
      className={cn(
        "grid gap-3 border-t border-slate-100/90 bg-slate-50/40",
        compact ? "grid-cols-1 p-4" : "grid-cols-1 p-4 sm:grid-cols-2 sm:p-5",
      )}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border border-white/80 bg-gradient-to-br p-4 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-14px_rgba(79,70,229,0.2)]",
              card.tone,
            )}
          >
            <span
              className={cn(
                "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
                card.iconTone,
              )}
            >
              <Icon className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-slate-950">
                {card.title}
              </span>
              <span className="mt-0.5 block text-[12px] text-slate-600">
                {card.description}
              </span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#4f46e5]"
              aria-hidden
            />
          </Link>
        );
      })}
    </div>
  );
}

function MobileCategoryAccordion({ onNavigate }: { onNavigate?: () => void }) {
  const [openId, setOpenId] = useState<string | null>(GROUPS[0]?.id ?? null);

  return (
    <div className="space-y-1">
      {GROUPS.map((group) => {
        const expanded = openId === group.id;
        return (
          <div
            key={group.id}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-3 text-left"
              aria-expanded={expanded}
              onClick={() => setOpenId(expanded ? null : group.id)}
            >
              <span className="text-[13px] font-extrabold tracking-[0.06em] text-[#4f46e5] uppercase">
                {group.label}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-slate-400 transition-transform duration-200",
                  expanded && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {expanded ? (
              <ul className="border-t border-slate-100 px-1 pb-2">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <HostingNavLink item={item} onNavigate={onNavigate} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
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
  if (compact) {
    return (
      <div className="space-y-3">
        <MobileCategoryAccordion onNavigate={onNavigate} />
        <PromoPanel compact onNavigate={onNavigate} />
        <BottomActions compact onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_28px_70px_-28px_rgba(37,80,130,0.45),0_12px_32px_-18px_rgba(15,23,42,0.12)]">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-4 lg:gap-4 xl:pr-[min(34%,360px)]">
        {GROUPS.map((group) => (
          <div key={group.id} className="min-w-0">
            <p className="mb-2.5 inline-flex rounded-full border border-indigo-100 bg-indigo-50/90 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-[#4f46e5] uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={`${group.id}-${item.title}`}>
                  <HostingNavLink item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-[min(34%,360px)] lg:border-l lg:border-slate-100/80">
        <PromoPanel compact={false} onNavigate={onNavigate} />
      </div>

      <BottomActions onNavigate={onNavigate} />
    </div>
  );
}

export function isHostingNavLabel(label: string) {
  return label === "Hosting" || label === "Web Hosting";
}
