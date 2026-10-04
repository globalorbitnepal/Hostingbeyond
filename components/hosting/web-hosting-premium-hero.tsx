"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  HardDrive,
  Server,
  Shield,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const TRUST = ["Free SSL", "NVMe Storage", "24/7 Expert Support"] as const;

const CARD_METRICS = [
  { icon: HardDrive, label: "NVMe Performance", value: "Ultra-fast I/O" },
  { icon: Activity, label: "99.9% Uptime", value: "Monitored stack" },
  { icon: Shield, label: "Free SSL", value: "Auto-renewed" },
  { icon: Server, label: "Daily Backups", value: "Restore ready" },
] as const;

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
          className="pt-3 pb-1 text-[12px] font-medium text-white/55 sm:pt-4"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={routes.home} className="hover:text-white/90">
                Home
              </Link>
            </li>
            <li className="text-white/35" aria-hidden>
              /
            </li>
            <li>
              <Link href={routes.hosting} className="hover:text-white/90">
                Hosting
              </Link>
            </li>
            <li className="text-white/35" aria-hidden>
              /
            </li>
            <li className="text-white/90">Web Hosting</li>
          </ol>
        </nav>

        <div
          className={cn(
            "grid items-center gap-8 pt-4 pb-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:pt-2 lg:pb-12",
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
            className="relative mx-auto w-full max-w-md lg:max-w-none lg:justify-self-end"
          >
            <div className="relative overflow-hidden rounded-[22px] border border-white/20 bg-white/[0.08] p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[#673de6]/25 blur-2xl"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
                    HostingBeyond
                  </p>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">
                    Web Hosting
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>

              <div className="relative mt-5 grid grid-cols-2 gap-2.5">
                {CARD_METRICS.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div
                      key={row.label}
                      className="rounded-xl border border-white/12 bg-black/15 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-[#c4b5fd]" />
                        <span className="text-[11px] font-bold text-white/90">
                          {row.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-white/55">
                        {row.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="relative mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] px-3 py-3">
                <div className="flex items-center justify-between text-[10px] font-semibold tracking-wide text-white/50 uppercase">
                  <span>Node cluster</span>
                  <span>NVMe tier</span>
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  {[42, 68, 55, 82, 61, 74].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-[#673de6] to-[#60a5fa]"
                      style={{ height: `${h * 0.45}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none relative z-[1] h-10 bg-gradient-to-b from-transparent to-[#f6f3ff] sm:h-12"
      />
    </section>
  );
}
