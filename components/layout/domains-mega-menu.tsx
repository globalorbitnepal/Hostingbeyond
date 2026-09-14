"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  Globe,
  Search,
  ShieldCheck,
} from "lucide-react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const GROUPS = [
  {
    id: "register",
    label: "Registration & Lookup",
    items: [
      {
        href: "/#domain-search",
        title: "Search Your Domain",
        description:
          "Find a unique name for your brand and start building today.",
        icon: Search,
        tone: "blue",
      },
      {
        href: `${routes.domains}/whois`,
        title: "WHOIS Lookup",
        description:
          "Instantly check domain ownership and registration details.",
        icon: ShieldCheck,
        tone: "amber",
      },
    ],
  },
  {
    id: "transfer",
    label: "Transfer & Migration",
    items: [
      {
        href: routes.contact,
        title: "Free Website Migration",
        description: "Move your site to HostingBeyond — we handle the switch.",
        icon: Globe,
        tone: "cyan",
      },
      {
        href: `${routes.domains}/transfer`,
        title: "Transfer Your Domain",
        description:
          "Bring your domain here and manage hosting, mail, and DNS together.",
        icon: ArrowLeftRight,
        tone: "rose",
      },
    ],
  },
] as const;

const TONES: Record<string, string> = {
  blue: "bg-[#e8f1ff] text-[#2563eb]",
  amber: "bg-[#fff4e5] text-[#d97706]",
  cyan: "bg-[#e7f8ff] text-[#0284c7]",
  rose: "bg-[#ffe8ef] text-[#e11d48]",
};

const TLDS = [".com", ".net", ".org", ".dev", ".io", ".ai"];

export function DomainsMegaMenu({
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
          "flex flex-col",
          compact ? "" : "lg:flex-row lg:items-stretch",
        )}
      >
        <div
          className={cn(
            "grid flex-1 gap-6 p-5 sm:p-6",
            compact ? "grid-cols-1" : "sm:grid-cols-2 lg:gap-8",
          )}
        >
          {GROUPS.map((group) => (
            <div key={group.id}>
              <p className="mb-3 inline-flex rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-[#4f46e5] uppercase">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className="group flex items-start gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-slate-50"
                      >
                        <span
                          className={cn(
                            "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                            TONES[item.tone],
                          )}
                        >
                          <Icon className="size-[18px]" strokeWidth={2} />
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
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div
          className={cn(
            compact ? "m-4 mt-0" : "lg:flex lg:w-[min(36%,400px)] lg:shrink-0",
          )}
        >
          <div
            className={cn(
              "relative flex min-h-[248px] flex-1 flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,#2563eb_0%,#4f46e5_52%,#7c3aed_100%)] p-6 text-white sm:p-7",
              compact ? "rounded-[22px]" : "",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-white/15 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 left-[-20%] size-52 rounded-full bg-[#93c5fd]/25 blur-3xl"
            />

            <div className="relative">
              <div className="mb-5 flex flex-wrap gap-1.5">
                {TLDS.map((tld) => (
                  <span
                    key={tld}
                    className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white/95 backdrop-blur-sm"
                  >
                    {tld}
                  </span>
                ))}
              </div>
              <p className="font-heading text-[1.45rem] leading-[1.15] font-extrabold tracking-[-0.04em] sm:text-[1.65rem]">
                Choose a name that fits your business.
              </p>
              <p className="mt-2.5 max-w-[34ch] text-[13px] leading-relaxed text-white/85">
                Register a domain, add hosting, and go live from one
                HostingBeyond account — not three different vendors.
              </p>
            </div>

            <Link
              href="/#domain-search"
              onClick={onNavigate}
              className="relative mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[13.5px] font-bold text-[#3730a3] shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition hover:bg-indigo-50"
            >
              Search domains
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
