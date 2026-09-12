import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Wand2, Zap } from "lucide-react";

import { SiteHeader } from "@/components/layout";
import { routes } from "@/config/routes";
import { getHomeSections, getSiteSettings } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Beyond AI — HostingBeyond",
  description:
    "AI tools to build, write and launch websites faster on HostingBeyond.",
};

const features = [
  {
    title: "AI Website Builder",
    description:
      "Describe your idea and generate a starting site you can host in minutes.",
    icon: Wand2,
  },
  {
    title: "Smart copy & SEO",
    description:
      "Draft pages, headlines and meta text that match your brand and market.",
    icon: Sparkles,
  },
  {
    title: "Built into hosting",
    description:
      "AI credits sit next to your plans — no extra platform to learn.",
    icon: Zap,
  },
];

export default async function BeyondAiPage() {
  const [sections, settings] = await Promise.all([
    getHomeSections(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f4f8fd]">
      <div className="relative bg-[#b5d3f2]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(165deg,#b5d3f2_0%,#c5daf0_55%,#f4f8fd_100%)]" />
        </div>
        <SiteHeader
          navigation={sections.navigation}
          loginLabel={settings.loginLabel}
          loginHref={settings.loginHref}
          getStartedLabel={settings.getStartedLabel}
          getStartedHref={settings.getStartedHref}
          logoPath={settings.logoPath}
        />

        <section className="hb-shell relative pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16">
          <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase sm:text-[12px]">
            Beyond AI
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="font-heading max-w-3xl text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950">
              Build faster with{" "}
              <span className="bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                Beyond AI
              </span>
            </h1>
            <p className="max-w-md text-[16px] leading-relaxed text-slate-600 lg:text-right lg:text-[17px]">
              AI that helps you launch pages, content and sites — then host them
              on HostingBeyond.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-[0_18px_50px_-28px_rgba(37,80,130,0.32)] backdrop-blur-2xl"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#d6e8f8] text-[#2563eb]">
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <h2 className="font-heading mt-4 text-[1.15rem] font-extrabold tracking-tight text-slate-950">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <Link
            href={routes.signup}
            className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[15px] font-semibold text-white shadow-[0_12px_24px_-10px_rgba(47,107,255,0.7)]"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
