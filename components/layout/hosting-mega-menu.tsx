"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Globe,
  HelpCircle,
  type LucideIcon,
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
  /** Brand logo presentation inside the 44px circle */
  logoVariant?: "default" | "cpanel" | "woocommerce";
  lucide?: LucideIcon;
  lucideClass?: string;
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
        logo: "/images/nav-brands/docker.svg",
        logoAlt: "Docker",
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
        logo: "/images/nav-brands/laravel.svg",
        logoAlt: "Laravel",
        tile: "bg-[#fff1f2]",
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
        logo: "/images/nav-brands/plesk.svg",
        logoAlt: "Plesk",
        tile: "bg-[#ecfeff]",
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
        logoVariant: "cpanel",
      },
      {
        href: routes.hosting,
        title: "Agency Hosting",
        description: "Manage hosting for multiple clients.",
        logo: "/images/nav-brands/whm.svg",
        logoAlt: "WHM",
        tile: "bg-[#fff7ed]",
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

const ICON_BOX =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full p-1.5 shadow-[0_6px_14px_-8px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/75";

const LOGO_IMG_CLASS: Record<
  NonNullable<HostingItem["logoVariant"]>,
  string
> = {
  default: "h-[28px] w-[28px] max-h-[28px] max-w-[28px] object-contain",
  cpanel:
    "h-[30px] w-[58px] max-h-[30px] max-w-[58px] object-contain object-center",
  woocommerce:
    "h-[24px] w-[38px] max-h-[24px] max-w-[38px] object-contain object-center",
};

function ItemIcon({ item }: { item: HostingItem }) {
  if (item.logo) {
    const variant = item.logoVariant ?? "default";
    const dimensions =
      variant === "cpanel"
        ? { width: 58, height: 30 }
        : variant === "woocommerce"
          ? { width: 38, height: 24 }
          : { width: 28, height: 28 };
    return (
      <Image
        src={`${item.logo}?v=logo5`}
        alt={item.logoAlt ?? ""}
        width={dimensions.width}
        height={dimensions.height}
        unoptimized
        className={LOGO_IMG_CLASS[variant]}
      />
    );
  }
  const Icon = item.lucide ?? Globe;
  return (
    <Icon
      className={cn("size-[24px]", item.lucideClass ?? "text-[#4f46e5]")}
      strokeWidth={2}
      aria-hidden
    />
  );
}

function HostingNavLink({
  item,
  onNavigate,
  compact,
}: {
  item: HostingItem;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex min-h-[50px] items-center gap-2.5 rounded-xl px-1.5 transition-[background] duration-150 hover:bg-slate-50/95",
        compact ? "py-1" : "py-1.5",
      )}
    >
      <span
        className={cn(
          ICON_BOX,
          item.tile,
          item.logoVariant === "cpanel" && "px-0.5 py-1",
          "transition-transform duration-150 group-hover:scale-[1.02]",
        )}
      >
        <ItemIcon item={item} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] leading-[1.2] font-semibold tracking-[-0.02em] text-slate-950 group-hover:text-[#1d4ed8]">
          {item.title}
        </span>
        <span className="mt-0.5 line-clamp-2 text-[12px] leading-[1.35] text-slate-500">
          {item.description}
        </span>
      </span>
      <ChevronRight
        className="size-3.5 shrink-0 text-slate-400/90 transition duration-150 group-hover:translate-x-0.5 group-hover:text-[#6366f1]"
        aria-hidden
      />
    </Link>
  );
}

function CategoryColumn({
  group,
  onNavigate,
}: {
  group: (typeof GROUPS)[number];
  onNavigate?: () => void;
}) {
  const compactItems = group.id === "developer";
  return (
    <div className="min-w-0">
      <p className="mb-2 inline-flex h-[22px] items-center rounded-full border border-indigo-100 bg-indigo-50/90 px-2.5 py-0 text-[9px] font-extrabold tracking-[0.14em] text-[#4f46e5] uppercase">
        {group.label}
      </p>
      <ul className={cn("space-y-0", group.id === "business" && "space-y-1")}>
        {group.items.map((item) => (
          <li key={`${group.id}-${item.title}`}>
            <HostingNavLink
              item={item}
              onNavigate={onNavigate}
              compact={compactItems}
            />
          </li>
        ))}
      </ul>
    </div>
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
        "relative flex h-full flex-col overflow-hidden bg-[linear-gradient(155deg,#2563eb_0%,#4f46e5_50%,#7c3aed_100%)] text-white",
        compact
          ? "rounded-[18px] p-4"
          : "rounded-[20px] p-4 lg:rounded-none lg:rounded-r-[24px] lg:p-4",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-6 size-32 rounded-full bg-white/12 blur-2xl"
      />

      <div className="relative z-[1] flex h-full min-h-0 flex-col justify-center gap-2.5 px-0.5 py-2">
        <p className="text-[9px] font-extrabold tracking-[0.16em] text-white/75 uppercase">
          Reliable & scalable
        </p>
        <p className="font-heading mt-1.5 text-[1.05rem] leading-[1.15] font-extrabold tracking-[-0.03em] lg:text-[1.12rem]">
          Premium Hosting for Every Need
        </p>
        <p className="mt-1.5 text-[11.5px] leading-snug text-white/88">
          Fast, secure and scalable hosting for websites, applications and
          businesses.
        </p>
        <ul className="space-y-1.5">
          {PROMO_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-2 text-[11.5px] font-medium text-white/95"
            >
              <span
                className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-400/95 text-white"
                aria-hidden
              >
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
        <Link
          href={routes.pricing}
          onClick={onNavigate}
          className="relative z-[2] mt-1 inline-flex min-h-[40px] w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-bold tracking-[-0.01em] text-[#3730a3] shadow-[0_10px_22px_rgba(15,23,42,0.18)] transition hover:bg-indigo-50"
        >
          <span className="truncate">View All Hosting Plans</span>
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      </div>
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
        "grid gap-2 border-t border-slate-100/90 bg-slate-50/50",
        compact ? "grid-cols-1 p-3" : "grid-cols-1 p-3 sm:grid-cols-2",
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
              "group flex min-h-[68px] items-center gap-2.5 rounded-xl border border-white/80 bg-gradient-to-br p-3 shadow-[0_6px_18px_-10px_rgba(15,23,42,0.12)] transition duration-150 hover:-translate-y-px hover:shadow-[0_12px_28px_-12px_rgba(79,70,229,0.18)]",
              card.tone,
            )}
          >
            <span
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                card.iconTone,
              )}
            >
              <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-slate-950">
                {card.title}
              </span>
              <span className="mt-0.5 block text-[11.5px] text-slate-600">
                {card.description}
              </span>
            </span>
            <ArrowRight
              className="size-3.5 shrink-0 text-slate-400 transition duration-150 group-hover:translate-x-0.5 group-hover:text-[#4f46e5]"
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
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
              aria-expanded={expanded}
              onClick={() => setOpenId(expanded ? null : group.id)}
            >
              <span className="text-[12px] font-extrabold tracking-[0.06em] text-[#4f46e5] uppercase">
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
              <ul className="border-t border-slate-100 px-0.5 pb-1.5">
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
      <div className="space-y-2.5">
        <MobileCategoryAccordion onNavigate={onNavigate} />
        <PromoPanel compact onNavigate={onNavigate} />
        <BottomActions compact onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_22px_56px_-24px_rgba(37,80,130,0.42),0_10px_28px_-14px_rgba(15,23,42,0.1)]">
      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,0.72fr)_minmax(200px,240px)] lg:items-start lg:gap-x-2 lg:gap-y-0 lg:pb-3">
        {GROUPS.map((group) => (
          <CategoryColumn
            key={group.id}
            group={group}
            onNavigate={onNavigate}
          />
        ))}
        <div className="min-h-0 sm:col-span-2 lg:col-span-1 lg:col-start-5 lg:row-start-1 lg:self-stretch">
          <PromoPanel compact={false} onNavigate={onNavigate} />
        </div>
      </div>

      <BottomActions onNavigate={onNavigate} />
    </div>
  );
}

export function isHostingNavLabel(label: string) {
  return label === "Hosting" || label === "Web Hosting";
}
