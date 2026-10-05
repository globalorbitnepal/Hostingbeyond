"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Cloud,
  Database,
  Headphones,
  Shield,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { WebHostingHeroVisual } from "@/components/hosting/web-hosting-hero-visual";
import { routes } from "@/config/routes";

const FEATURES = [
  {
    icon: Shield,
    label: "Free SSL",
    sub: "Certificates",
    tone: "text-[#c4b5fd]",
  },
  { icon: Database, label: "NVMe SSD", sub: "Storage", tone: "text-[#93c5fd]" },
  { icon: Cloud, label: "99.9%", sub: "Uptime", tone: "text-[#5eead4]" },
  {
    icon: Headphones,
    label: "24/7",
    sub: "Expert Support",
    tone: "text-[#e879f9]",
  },
] as const;

const FOOTER = [
  "Easy setup",
  "Secure infrastructure",
  "Migrate for free",
  "Upgrade anytime",
] as const;

export function WebHostingPremiumHero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden text-white"
      aria-labelledby="web-hosting-hero-title"
    >
      <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        <WebHostingHeroVisual />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[#2a1668] lg:hidden"
      />

      {/* Soft organic left wash — not a rectangle, not a photo frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 8% 12%, rgba(167,139,250,0.38), transparent 55%), linear-gradient(90deg, #24145f 0%, #2d1a72 26%, rgba(45,26,114,0.9) 40%, rgba(55,30,140,0.22) 50%, transparent 58%)",
        }}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-[1] hidden h-full w-[54%] lg:block"
        viewBox="0 0 900 900"
        preserveAspectRatio="none"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, #000 62%, rgba(0,0,0,0.45) 82%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, #000 62%, rgba(0,0,0,0.45) 82%, transparent 100%)",
        }}
      >
        <path
          d="M0 0 H620 C700 40 640 110 690 170 C760 250 620 300 650 390 C690 490 560 530 590 640 C630 760 540 820 560 900 H0 Z"
          fill="url(#hbHeroWave)"
          opacity="0.92"
        />
        <defs>
          <linearGradient id="hbHeroWave" x1="0" y1="0" x2="1" y2="0.15">
            <stop offset="0%" stopColor="#24145f" />
            <stop offset="55%" stopColor="#3b1d86" />
            <stop offset="82%" stopColor="#5b21b6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-[-8%] left-[-6%] z-[2] hidden h-[42%] w-[46%] opacity-40 lg:block"
        viewBox="0 0 500 280"
        fill="none"
      >
        <path
          d="M-20 220 C80 160 140 250 240 190 C340 130 380 220 520 160"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.4"
        />
        <path
          d="M-20 250 C90 190 160 270 260 210 C360 150 400 240 530 185"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
        />
        <path
          d="M-20 275 C100 215 170 290 280 230 C380 170 420 255 540 205"
          stroke="rgba(196,181,253,0.28)"
          strokeWidth="1.2"
        />
      </svg>

      <div className="hb-shell relative z-[4] pt-[5.75rem] pb-12 sm:pt-[6.75rem] sm:pb-14 lg:min-h-[640px] lg:pb-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-[560px] lg:max-w-[620px]"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white/90 uppercase backdrop-blur-sm">
            <Zap className="size-3.5 text-[#67e8f9]" strokeWidth={2.4} />
            Reliable • Secure • Scalable Hosting
          </p>

          <h1
            id="web-hosting-hero-title"
            className="font-heading mt-5 text-[clamp(1.95rem,4.4vw,3.35rem)] leading-[1.08] font-extrabold tracking-[-0.045em]"
          >
            <span className="lg:whitespace-nowrap">
              <span className="text-white">Fast NVMe </span>
              <span className="bg-gradient-to-r from-[#ddd6fe] to-[#c4b5fd] bg-clip-text text-transparent">
                Web Hosting
              </span>
            </span>
            <br />
            <span className="text-white">for </span>
            <span className="bg-gradient-to-r from-[#c084fc] via-[#818cf8] to-[#22d3ee] bg-clip-text text-transparent">
              Modern Websites
            </span>
          </h1>

          <p className="mt-5 max-w-[34rem] text-[15px] leading-relaxed font-medium text-white/90 sm:text-[16px]">
            Launch WordPress, WooCommerce, business websites and modern web
            projects on high-performance NVMe servers with SSL, backups and 24/7
            expert support.
          </p>

          <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-6">
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ${item.tone}`}
                  >
                    <Icon className="size-5" strokeWidth={2.1} />
                  </span>
                  <span className="text-[12px] leading-tight font-semibold text-white sm:text-[13px]">
                    {item.label}
                    <span className="block font-medium text-white/75">
                      {item.sub}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#plans"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a855f7] px-7 text-[15px] font-extrabold text-white shadow-[0_14px_32px_-10px_rgba(124,58,237,0.65)] transition hover:brightness-110"
            >
              View Hosting Plans
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={routes.getStarted}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-white/70 bg-transparent px-7 text-[15px] font-bold text-white transition hover:bg-white/10"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-medium text-white/85 sm:text-[13px]">
            {FOOTER.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check
                  className="size-3.5 text-emerald-400"
                  strokeWidth={2.6}
                />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="relative z-[1] min-h-[280px] sm:min-h-[340px] lg:hidden">
        <WebHostingHeroVisual />
      </div>
    </section>
  );
}
