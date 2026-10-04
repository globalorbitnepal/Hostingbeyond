"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { WebHostingHeroVisual } from "@/components/hosting/web-hosting-hero-visual";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const TRUST = ["Free SSL", "NVMe Storage", "24/7 Expert Support"] as const;

export function WebHostingPremiumHero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden text-white"
      aria-labelledby="web-hosting-hero-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#2f1c6a] via-[#35206f] to-[#1e3a8a]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_18%_0%,rgba(255,255,255,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_92%_18%,rgba(59,130,246,0.2),transparent_50%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[58%] bg-gradient-to-b from-[#2f1c6a] from-0% via-[#2f1c6a]/95 via-70% to-transparent lg:hidden"
      />

      <WebHostingHeroVisual className="pointer-events-none absolute inset-x-0 top-[36%] bottom-0 z-0 min-h-[320px] sm:min-h-[360px] lg:inset-y-0 lg:top-0 lg:right-0 lg:left-[32%] lg:min-h-0" />

      <div className="hb-shell relative z-[2]">
        <nav
          aria-label="Breadcrumb"
          className="pt-3 pb-0.5 text-[12px] font-medium text-white/85 sm:pt-3.5"
        >
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href={routes.home} className="hover:text-white">
                Home
              </Link>
            </li>
            <li className="text-white/45" aria-hidden>
              /
            </li>
            <li>
              <Link href={routes.hosting} className="hover:text-white">
                Hosting
              </Link>
            </li>
            <li className="text-white/45" aria-hidden>
              /
            </li>
            <li className="font-semibold text-white">Web Hosting</li>
          </ol>
        </nav>

        <div
          className={cn(
            "relative grid gap-8 pt-4 pb-12 lg:grid-cols-[minmax(0,0.88fr)_1fr] lg:items-center lg:gap-6 lg:pt-1 lg:pb-14",
            "min-h-[540px] lg:min-h-[560px]",
          )}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-[3] max-w-[520px] lg:max-w-[540px]"
          >
            <p className="text-[11px] font-bold tracking-[0.28em] text-white/90 uppercase">
              Web hosting
            </p>
            <h1
              id="web-hosting-hero-title"
              className="font-heading mt-3 text-[clamp(1.95rem,4.5vw,3.35rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
            >
              Fast NVMe{" "}
              <span className="bg-gradient-to-r from-[#93c5fd] to-[#c4b5fd] bg-clip-text text-transparent">
                Web Hosting
              </span>
              <br />
              <span className="text-white">for </span>
              <span className="text-[#5eead4]">Modern Websites</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed font-medium text-white sm:text-[16px]">
              Launch WordPress, WooCommerce, business websites and modern web
              projects on fast NVMe-powered hosting with SSL, backups and expert
              support included.
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5 text-[14px] font-semibold text-white">
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check
                    className="size-4 shrink-0 text-emerald-400"
                    strokeWidth={2.5}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="#plans"
                className="pointer-events-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-extrabold text-[#2f1c6a] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] transition hover:brightness-[1.02]"
              >
                View Hosting Plans
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.getStarted}
                className="pointer-events-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-white/55 bg-white/10 px-7 text-[15px] font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="mt-5 text-[12px] font-medium text-white/80 sm:text-[13px]">
              Easy setup • Secure infrastructure • Upgrade anytime
            </p>
          </motion.div>

          <div className="hidden min-h-[1px] lg:block" aria-hidden />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none relative z-[2] h-8 bg-gradient-to-b from-transparent to-[#e8eeff] sm:h-10"
      />
    </section>
  );
}
