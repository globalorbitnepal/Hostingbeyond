"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const TRUST = ["Free SSL", "NVMe Storage", "24/7 Expert Support"] as const;

const HERO_VISUAL = {
  src: "/images/hosting/web-hosting-hero-paris.jpg",
  width: 1024,
  height: 576,
  alt: "Web hosting with HostingBeyond — fast secure hosting, uptime, and migration",
} as const;

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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(255,255,255,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_20%,rgba(59,130,246,0.28),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -right-24 h-64 w-64 rounded-full bg-[#673de6]/20 blur-3xl"
      />

      <div className="hb-shell relative z-[1]">
        <nav
          aria-label="Breadcrumb"
          className="pt-3 pb-0.5 text-[11px] font-medium text-white/50 sm:pt-3.5"
        >
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href={routes.home} className="hover:text-white/85">
                Home
              </Link>
            </li>
            <li className="text-white/30" aria-hidden>
              /
            </li>
            <li>
              <Link href={routes.hosting} className="hover:text-white/85">
                Hosting
              </Link>
            </li>
            <li className="text-white/30" aria-hidden>
              /
            </li>
            <li className="text-white/85">Web Hosting</li>
          </ol>
        </nav>

        <div
          className={cn(
            "grid items-center gap-7 pt-3 pb-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-9 lg:pt-1 lg:pb-10",
            "min-h-0 lg:min-h-[480px]",
          )}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-[11px] font-bold tracking-[0.24em] text-[#c4b5fd] uppercase">
              Web hosting
            </p>
            <h1
              id="web-hosting-hero-title"
              className="font-heading mt-3 text-[clamp(1.85rem,4.2vw,3.15rem)] leading-[1.08] font-extrabold tracking-[-0.04em]"
            >
              Fast NVMe{" "}
              <span className="bg-gradient-to-r from-[#93c5fd] via-[#c4b5fd] to-[#a78bfa] bg-clip-text text-transparent">
                Web Hosting
              </span>
              <br className="hidden sm:block" />
              <span className="text-white"> for </span>
              <span className="bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] bg-clip-text text-transparent">
                Modern Websites
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/82 sm:text-[16px]">
              Launch WordPress, WooCommerce, business websites and modern web
              projects on fast NVMe-powered hosting with SSL, backups and expert
              support included.
            </p>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-white/90">
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

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="#plans"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-extrabold text-[#2f1c6a] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] transition hover:brightness-[1.02]"
              >
                View Hosting Plans
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.getStarted}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 text-[15px] font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="mt-4 text-[12px] font-medium tracking-wide text-white/55 sm:text-[13px]">
              Easy setup • Secure infrastructure • Upgrade anytime
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="relative mx-auto w-full max-w-[520px] lg:max-w-none lg:justify-self-end"
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-[20px]",
                "shadow-[0_28px_64px_-32px_rgba(15,10,40,0.65)]",
              )}
            >
              <Image
                src={HERO_VISUAL.src}
                alt={HERO_VISUAL.alt}
                width={HERO_VISUAL.width}
                height={HERO_VISUAL.height}
                className="block h-auto w-full"
                sizes="(max-width: 1024px) 92vw, 520px"
                priority
              />
            </div>
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
