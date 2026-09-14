"use client";

import Image from "next/image";
import Link from "next/link";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

type HostingItem = {
  href: string;
  title: string;
  description: string;
  logo: string;
  logoAlt: string;
};

const GROUPS: Array<{ id: string; label: string; items: HostingItem[] }> = [
  {
    id: "hosting",
    label: "Hosting Options",
    items: [
      {
        href: routes.hosting,
        title: "Web Hosting",
        description:
          "Fast nginx-powered sites with SSL, backups and 24/7 support.",
        logo: "/images/nav-brands/nginx.svg",
        logoAlt: "NGINX",
      },
      {
        href: routes.cloud,
        title: "Cloud Hosting",
        description: "Scale on Docker-ready cloud nodes when traffic jumps.",
        logo: "/images/nav-brands/docker.svg",
        logoAlt: "Docker",
      },
      {
        href: `${routes.hosting}/wordpress`,
        title: "WordPress Hosting",
        description: "Official WordPress stack, tuned for speed and updates.",
        logo: "/images/nav-brands/wordpress.svg",
        logoAlt: "WordPress",
      },
      {
        href: `${routes.hosting}/ecommerce`,
        title: "eCommerce Hosting",
        description: "WooCommerce-ready checkout with NVMe and free SSL.",
        logo: "/images/nav-brands/woocommerce.svg",
        logoAlt: "WooCommerce",
      },
    ],
  },
  {
    id: "code",
    label: "Code Based",
    items: [
      {
        href: `${routes.hosting}?stack=python`,
        title: "Python Hosting",
        description: "Run Python apps with the official CPython runtime.",
        logo: "/images/nav-brands/python.svg",
        logoAlt: "Python",
      },
      {
        href: `${routes.hosting}?stack=nodejs`,
        title: "Node.js Hosting",
        description: "Native Node.js for APIs, Next.js and realtime apps.",
        logo: "/images/nav-brands/nodedotjs.svg",
        logoAlt: "Node.js",
      },
      {
        href: `${routes.hosting}?stack=nestjs`,
        title: "NestJS Hosting",
        description: "Production NestJS servers with Node.js and TypeScript.",
        logo: "/images/nav-brands/nestjs.svg",
        logoAlt: "NestJS",
      },
      {
        href: `${routes.hosting}?stack=django`,
        title: "Django Hosting",
        description: "Django projects on Linux with Python, SSL and backups.",
        logo: "/images/nav-brands/django.svg",
        logoAlt: "Django",
      },
    ],
  },
  {
    id: "vps",
    label: "VPS Hosting",
    items: [
      {
        href: `${routes.vps}?region=eu`,
        title: "Europe VPS",
        description: "Low-latency KVM instances in European data centers.",
        logo: "/images/nav-brands/europe-flag.svg",
        logoAlt: "European Union",
      },
      {
        href: `${routes.vps}?storage=nvme`,
        title: "NVMe VPS",
        description: "NVMe Express storage for databases and heavy I/O.",
        logo: "/images/nav-brands/nvme.svg",
        logoAlt: "NVMe Express",
      },
      {
        href: `${routes.vps}?hypervisor=kvm`,
        title: "KVM VPS",
        description: "Full-root KVM virtualization with Linux or your ISO.",
        logo: "/images/nav-brands/proxmox.svg",
        logoAlt: "Proxmox",
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
        description: "White-label plans with cPanel to grow your own clients.",
        logo: "/images/nav-brands/cpanel.svg",
        logoAlt: "cPanel",
      },
      {
        href: `${routes.hosting}?panel=plesk`,
        title: "Plesk Hosting",
        description:
          "Plesk for teams that want WordPress and mail in one panel.",
        logo: "/images/nav-brands/plesk.svg",
        logoAlt: "Plesk",
      },
      {
        href: `${routes.vps}?os=linux`,
        title: "Linux Servers",
        description: "Tux-native Linux VPS and cloud nodes, ready in minutes.",
        logo: "/images/nav-brands/linux.svg",
        logoAlt: "Linux",
      },
    ],
  },
];

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
        "overflow-hidden border border-white/80 bg-white shadow-[0_28px_70px_-28px_rgba(37,80,130,0.45),0_12px_32px_-18px_rgba(15,23,42,0.12)]",
        compact ? "rounded-[22px]" : "rounded-[28px]",
      )}
    >
      <div
        className={cn(
          "grid gap-6 p-5 sm:p-6",
          compact ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-4 xl:gap-5",
        )}
      >
        {GROUPS.map((group) => (
          <div key={group.id}>
            <p className="mb-3 inline-flex rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-[#4f46e5] uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={`${group.id}-${item.title}`}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="group flex items-start gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-slate-50"
                  >
                    <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_6px_14px_-8px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/90">
                      <Image
                        src={item.logo}
                        alt={item.logoAlt}
                        width={28}
                        height={28}
                        unoptimized
                        className="h-[30px] w-[30px] object-contain"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-bold tracking-[-0.02em] text-slate-950 group-hover:text-[#1d4ed8]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function isHostingNavLabel(label: string) {
  return label === "Hosting" || label === "Web Hosting";
}
