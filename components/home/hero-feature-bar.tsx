"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Mail, ShieldCheck } from "lucide-react";

import { routes } from "@/config/routes";

function IconTile({
  children,
  tone = "sky",
  wide = false,
}: {
  children: ReactNode;
  tone?: "sky" | "white" | "green" | "violet" | "orange" | "blue";
  wide?: boolean;
}) {
  const tones = {
    white:
      "border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(60,120,170,0.14)]",
    sky: "bg-[#d6e8f8] text-[#2563eb]",
    green: "bg-[#d8f3e4] text-[#16a34a]",
    violet:
      "bg-gradient-to-br from-[#7c3aed]/15 to-[#2563eb]/20 text-[#4f46e5]",
    orange:
      "border border-orange-100/90 bg-white shadow-[0_2px_12px_rgba(255,108,44,0.22)]",
    blue: "border border-sky-100/90 bg-white shadow-[0_2px_12px_rgba(33,117,155,0.18)]",
  } as const;

  return (
    <span
      className={`flex h-8 shrink-0 items-center justify-center rounded-[10px] sm:h-9 ${
        wide ? "w-11 sm:w-12" : "w-8 sm:w-9"
      } ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const features = [
  {
    key: "cpanel",
    title: "One Click",
    subtitle: "cPanel Access",
    icon: (
      <IconTile tone="orange" wide>
        <Image
          src="/images/feature-marks/cpanel-user.png"
          alt="cPanel"
          width={40}
          height={30}
          className="h-[18px] w-auto object-contain sm:h-[21px]"
          priority
        />
      </IconTile>
    ),
  },
  {
    key: "wordpress",
    title: "One Click",
    subtitle: "WordPress Install",
    icon: (
      <IconTile tone="blue">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/feature-marks/wordpress-w.svg?v=3"
          alt="WordPress"
          width={28}
          height={28}
          className="h-[22px] w-[22px] object-contain sm:h-6 sm:w-6"
          draggable={false}
        />
      </IconTile>
    ),
  },
  {
    key: "builder",
    title: "One Click",
    subtitle: "Website Create",
    icon: (
      <IconTile tone="white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/feature-marks/website-create.svg?v=2"
          alt=""
          width={28}
          height={28}
          className="h-[22px] w-[22px] object-contain sm:h-6 sm:w-6"
          draggable={false}
        />
      </IconTile>
    ),
  },
  {
    key: "email",
    title: "Business Email",
    subtitle: "Professional Mail",
    icon: (
      <IconTile tone="sky">
        <Mail className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
      </IconTile>
    ),
  },
  {
    key: "ssl",
    title: "Free SSL",
    subtitle: "With All Plans",
    icon: (
      <IconTile tone="green">
        <ShieldCheck
          className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
          strokeWidth={2}
        />
      </IconTile>
    ),
  },
] as const;

export function HeroFeatureBar() {
  return (
    <div className="relative flex [scrollbar-width:none] items-center gap-3 overflow-x-auto px-3 py-2 sm:gap-0 sm:overflow-visible sm:px-3.5 sm:py-1.5 lg:justify-between [&::-webkit-scrollbar]:hidden">
      <div className="flex shrink-0 items-center gap-2">
        <IconTile tone="violet">
          <Gift className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
        </IconTile>
        <div className="min-w-0 leading-tight">
          <p className="text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase sm:text-[10px]">
            Special Offer
          </p>
          <p className="text-[12px] font-bold text-slate-900 sm:text-[13px]">
            Save Up to{" "}
            <span className="bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
              70%
            </span>
          </p>
        </div>
      </div>

      {features.map((item) => (
        <div key={item.key} className="flex shrink-0 items-center">
          <div
            aria-hidden
            className="mx-2 hidden h-7 w-px bg-[#8eb8de]/50 sm:mx-2.5 sm:block lg:mx-3"
          />
          <div className="flex items-center gap-2">
            {item.icon}
            <div className="min-w-0 leading-tight">
              <p className="text-[12px] font-bold text-slate-900 sm:text-[13px]">
                {item.title}
              </p>
              <p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
                {item.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="ml-auto flex shrink-0 items-center lg:ml-0">
        <div
          aria-hidden
          className="mr-2.5 hidden h-7 w-px bg-[#8eb8de]/50 sm:block lg:mr-3"
        />
        <Link
          href={routes.hosting}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-3.5 text-[12px] font-semibold whitespace-nowrap text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] transition hover:brightness-105 sm:h-9 sm:px-4 sm:text-[13px]"
        >
          View Plans
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
