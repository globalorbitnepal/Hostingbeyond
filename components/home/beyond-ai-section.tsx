"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Cloud,
  FolderKanban,
  Gauge,
  Globe,
  Layers,
  LayoutGrid,
  Play,
  Rocket,
  Sparkles,
  Users,
  Wand2,
  Zap,
} from "lucide-react";

import { routes } from "@/config/routes";

const highlights = [
  { title: "One Click Publish", subtitle: "Go live instantly", icon: Zap },
  { title: "No Extra Hosting", subtitle: "Everything included", icon: Cloud },
  { title: "All Sites One Place", subtitle: "Manage with ease", icon: Globe },
  {
    title: "High Speed Servers",
    subtitle: "Built for performance",
    icon: Rocket,
  },
];

const sites = [
  {
    name: "Hotel Website",
    domain: "hotel.com",
    art: "bg-[linear-gradient(160deg,#7dd3fc_0%,#0369a1_42%,#0f172a_100%)]",
  },
  {
    name: "Trekking Adventure",
    domain: "trekking.com",
    art: "bg-[linear-gradient(160deg,#86efac_0%,#047857_48%,#0f172a_100%)]",
  },
  {
    name: "Business Site",
    domain: "business.com",
    art: "bg-[linear-gradient(160deg,#c4b5fd_0%,#4f46e5_45%,#0f172a_100%)]",
  },
];

const tools = [
  { label: "AI Generate", icon: Sparkles },
  { label: "Customize", icon: LayoutGrid },
  { label: "Templates", icon: FolderKanban },
  { label: "Publish", icon: Globe },
];

const bottom = [
  {
    title: "AI Website Creation",
    description: "Describe your idea and let AI build your website in seconds.",
    icon: Wand2,
  },
  {
    title: "All-in-One Platform",
    description: "Hosting, domain, database and everything included.",
    icon: Layers,
  },
  {
    title: "SaaS Based System",
    description: "Manage multiple websites, clients and teams easily.",
    icon: Users,
  },
  {
    title: "High Performance",
    description: "Optimized servers for blazing fast speed and uptime.",
    icon: Gauge,
  },
];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto lg:max-w-none">
      <div className="absolute -top-3 right-2 z-20 hidden items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex md:right-10">
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="size-3" strokeWidth={2.4} />
        </span>
        <span>
          Website Published!
          <span className="block text-[10px] font-medium text-slate-400">
            yourbrand.com is now live
          </span>
        </span>
      </div>

      <div className="absolute top-16 -right-2 z-20 hidden flex-col gap-2 xl:flex">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.label}
              className="flex size-[68px] flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-center shadow-[0_12px_30px_rgba(37,80,130,0.12)] backdrop-blur-xl"
            >
              <Icon className="size-4 text-[#4f46e5]" />
              <span className="mt-1 text-[9px] font-bold text-slate-600">
                {tool.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/75 shadow-[0_28px_70px_-24px_rgba(37,80,130,0.45)] backdrop-blur-2xl sm:rounded-[30px]">
        <div className="flex items-center gap-2 border-b border-slate-100/90 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex min-w-0 items-center gap-4 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Sparkles className="size-3.5 text-[#4f46e5]" />
              Beyond AI
            </span>
            <span className="hidden text-[#2563eb] sm:inline">Sites</span>
            <span className="hidden md:inline">Templates</span>
            <span className="hidden md:inline">AI Assistant</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[150px_minmax(0,1fr)]">
          <aside className="hidden border-r border-slate-100 bg-white/40 p-3 sm:block">
            <p className="mb-2 flex items-center justify-between rounded-xl bg-[#eef4ff] px-2.5 py-2 text-[11px] font-bold text-slate-800">
              All Websites
              <span className="rounded-full bg-[#2563eb] px-1.5 text-[10px] text-white">
                12
              </span>
            </p>
            {[
              "Templates",
              "AI Assistant",
              "Domains",
              "Analytics",
              "Team",
              "Settings",
            ].map((item) => (
              <p
                key={item}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500"
              >
                {item}
              </p>
            ))}
          </aside>

          <div className="p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-extrabold tracking-tight text-slate-900">
                My Websites
              </h3>
              <span className="inline-flex h-8 items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-3 text-[11px] font-bold text-white">
                + New Website
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {sites.map((site) => (
                <article
                  key={site.domain}
                  className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
                >
                  <div className={`h-16 sm:h-[84px] ${site.art}`} />
                  <div className="px-2 py-2 sm:px-2.5">
                    <p className="truncate text-[11px] font-bold text-slate-900 sm:text-[12px]">
                      {site.name}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {site.domain}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Live
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-3 left-2 z-20 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_14px_36px_rgba(37,80,130,0.16)] backdrop-blur-xl sm:left-8 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">
            Total Websites
          </p>
          <p className="text-[28px] leading-none font-extrabold text-slate-950">
            12
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600">
            +4 this month
          </p>
        </div>
        <div className="flex h-12 items-end gap-1 pb-0.5">
          {[40, 55, 48, 72, 64, 88, 76].map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-[#2563eb] to-[#7dd3fc]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute right-2 -bottom-2 z-20 hidden w-[210px] rounded-2xl border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(237,233,254,0.9))] p-3.5 shadow-[0_16px_40px_rgba(79,70,229,0.16)] backdrop-blur-xl sm:block md:right-16">
        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-slate-900">
          <Cloud className="size-3.5 text-[#2563eb]" />
          Powered by SaaS
        </p>
        {[
          "Your sites, forever",
          "Built-in hosting & domain",
          "AI tools included",
          "Team collaboration",
          "Scalable for business",
        ].map((item) => (
          <p
            key={item}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600"
          >
            <Check className="size-3 text-[#2563eb]" />
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export function BeyondAiSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8fd] pt-4 pb-16 sm:pt-6 sm:pb-20 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f8fd_0%,#eef4fb_40%,#f7fbff_100%)]" />
        <div className="absolute top-[-8%] right-[-8%] h-[52%] w-[48%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.32),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[42%] w-[40%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.14),transparent_70%)] blur-3xl" />
      </div>

      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-12">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[11px] font-bold text-slate-700 shadow-[0_8px_22px_rgba(37,80,130,0.08)] backdrop-blur-xl">
                <Sparkles className="size-3.5 text-[#4f46e5]" />
                Beyond AI Builder
              </span>
              <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-bold text-[#4f46e5]">
                Built for Everyone
              </span>
            </div>

            <h2 className="font-heading mt-5 text-[clamp(1.85rem,4vw,3.4rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950">
              Create Stunning
              <span className="block">Websites with</span>
              <span className="bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                Beyond AI
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
              All your sites, one place. Create, design and publish professional
              websites in minutes with AI — no extra hosting, no complex setup.
              Powered by our high-speed servers and modern SaaS platform.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-2.5 sm:flex-col sm:items-center sm:text-center"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#2563eb] shadow-[0_8px_20px_rgba(37,80,130,0.08)]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-[12px] font-extrabold text-slate-900">
                        {item.title}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {item.subtitle}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={routes.beyondAi}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#4f46e5] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
              >
                <Sparkles className="size-4" />
                Start Building with Beyond AI
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={routes.beyondAi}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/80 bg-white/80 px-5 text-[14px] font-bold text-slate-800 shadow-[0_10px_24px_rgba(37,80,130,0.08)] backdrop-blur-xl"
              >
                <Play className="size-4 fill-current" />
                View Templates
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-[#2563eb]" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-[#2563eb]" />
                Free to try
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-[#2563eb]" />
                Launch in minutes
              </span>
            </div>
          </div>

          <div className="relative pb-16 sm:pb-10 lg:pb-8">
            <DashboardPreview />
          </div>
        </div>

        <div className="mt-10 grid gap-3 rounded-[28px] border border-white/80 bg-white/70 p-3 shadow-[0_18px_50px_-28px_rgba(37,80,130,0.32)] backdrop-blur-2xl sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:p-4">
          {bottom.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="flex gap-3 rounded-2xl px-3 py-3 sm:px-4"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb]">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold tracking-tight text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.22em] text-slate-400 uppercase">
          <span className="h-px w-8 bg-slate-200" />
          Build today. Grow beyond tomorrow.
          <span className="h-px w-8 bg-slate-200" />
        </p>
      </div>
    </section>
  );
}
