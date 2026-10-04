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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(255,255,255,0.14),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_20%,rgba(59,130,246,0.22),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -right-24 h-64 w-64 rounded-full bg-[#673de6]/20 blur-3xl"
      />

      <div className="hb-shell relative z-[1]">
        <nav
          aria-label="Breadcrumb"
          className="pt-3 pb-0.5 text-[12px] font-medium text-white/75 sm:pt-3.5"
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
            "relative grid items-center gap-8 pt-4 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 lg:pt-2 lg:pb-12",
            "min-h-0 lg:min-h-[500px]",
          )}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-xl lg:max-w-none"
          >
            <p className="text-[11px] font-bold tracking-[0.28em] text-white/90 uppercase">
              Web hosting
            </p>
            <h1
              id="web-hosting-hero-title"
              className="font-heading mt-3 text-[clamp(1.9rem,4.4vw,3.25rem)] leading-[1.06] font-extrabold tracking-[-0.04em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.25)]"
            >
              Fast NVMe <span className="text-white">Web Hosting</span>
              <br className="hidden sm:block" />
              <span className="text-white"> for </span>
              <span className="text-[#5eead4]">Modern Websites</span>
            </h1>
            <p
              className="mt-5 max-w-lg text-[15px] leading-relaxed font-medium text-white/95 sm:text-[16px] sm:leading-relaxed"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}
            >
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-extrabold text-[#2f1c6a] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] transition hover:brightness-[1.02]"
              >
                View Hosting Plans
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.getStarted}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-white/55 bg-white/10 px-7 text-[15px] font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="mt-5 text-[12px] font-medium text-white/75 sm:text-[13px]">
              Easy setup • Secure infrastructure • Upgrade anytime
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="relative min-h-[300px] w-full lg:min-h-[420px] lg:overflow-visible"
          >
            <WebHostingHeroVisual />
          </motion.div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none relative z-[1] h-8 bg-gradient-to-b from-transparent to-[#e8eeff] sm:h-10"
      />
    </section>
  );
}
