"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  Globe,
  Home,
  LayoutGrid,
  PenLine,
  Settings,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { AiModelBrandIcon } from "@/components/beyond-ai/ai-model-brand-icons";
import { routes } from "@/config/routes";
import {
  defaultBeyondAiSection,
  type CmsBeyondAiContent,
  type CmsBeyondAiHighlight,
  type CmsBeyondAiSite,
} from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

const stepIcons: Record<CmsBeyondAiHighlight["icon"], typeof Zap> = {
  zap: Zap,
  cloud: PenLine,
  globe: Globe,
  rocket: Globe,
};

const models = [
  { id: "openai", name: "OpenAI", note: "Best for complete websites" },
  { id: "claude", name: "Claude", note: "Beautiful UI copy" },
  { id: "gemini", name: "Gemini", note: "Fast and creative" },
  { id: "grok", name: "Grok", note: "Quick edits" },
] as const;

const fallbackThumbs = [
  {
    src: "/images/home/beyond-ai/luxe-stay.jpg",
    name: "LUXE STAY",
    domain: "luxestay.com",
    cta: "Book",
  },
  {
    src: "/images/home/beyond-ai/alpine-trails.jpg",
    name: "Alpine Trails",
    domain: "alpinetrails.com",
    cta: "Explore",
  },
  {
    src: "/images/home/beyond-ai/ocean-escapes.jpg",
    name: "Ocean Escapes",
    domain: "oceanescapes.com",
    cta: "View",
  },
  {
    src: "/images/home/beyond-ai/desert-dunes.jpg",
    name: "Desert Dunes",
    domain: "desertdunes.com",
    cta: "Discover",
  },
  {
    src: "/images/home/beyond-ai/hotel.png",
    name: "Portfolio",
    domain: "studio.site",
    cta: "See work",
  },
];

function BeyondAiMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "hb-ai-nav inline-flex items-center justify-center gap-1.5 rounded-full border border-violet-200/80 bg-white font-bold tracking-[-0.02em] text-slate-950 shadow-[0_8px_22px_rgba(79,70,229,0.12),inset_0_1px_0_rgba(255,255,255,1)]",
        compact
          ? "h-7 px-2.5 text-[10px]"
          : "hb-ai-nav--section h-10 px-4 text-[15px]",
      )}
    >
      <span className="hb-ai-nav__shine" aria-hidden />
      <Sparkles
        className={cn(
          "hb-ai-nav__spark shrink-0 text-[#7c3aed]",
          compact ? "size-3" : "size-4",
        )}
        aria-hidden
      />
      <span>
        Beyond <span className="hb-ai-nav__word">AI</span>
      </span>
    </span>
  );
}

function MiniWebsite({
  src,
  name,
  domain,
  cta,
  nav,
  tall,
}: {
  src: string;
  name: string;
  domain: string;
  cta: string;
  nav?: string;
  tall?: boolean;
}) {
  const links = (nav || "Home About Contact")
    .split(/\s{2,}|\s/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-[0_8px_18px_-12px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-1 bg-[#eef2f7] px-1.5 py-0.5">
        <span className="size-1 rounded-full bg-[#f87171]" />
        <span className="size-1 rounded-full bg-[#fbbf24]" />
        <span className="size-1 rounded-full bg-[#34d399]" />
        <span className="ml-0.5 min-w-0 truncate text-[6px] font-semibold text-slate-500">
          {domain}
        </span>
      </div>
      <div className="flex items-center justify-between gap-1 px-1.5 py-0.5">
        <span className="truncate text-[6px] font-extrabold text-slate-800">
          {name}
        </span>
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-1 truncate xl:flex">
          {links.slice(1, 4).map((item) => (
            <span
              key={item}
              className="text-[5px] font-semibold text-slate-400"
            >
              {item}
            </span>
          ))}
        </div>
        <span className="shrink-0 rounded-full bg-[#7c3aed] px-1 py-px text-[5px] font-bold text-white">
          {cta.split(" ")[0]}
        </span>
      </div>
      <div className={cn("relative", tall ? "h-[78px]" : "h-10")}>
        <Image src={src} alt="" fill className="object-cover" sizes="160px" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-1.5 pt-4 pb-1">
          <p className="truncate text-[6px] font-extrabold text-white">
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}

function siteCard(site: CmsBeyondAiSite | undefined, index: number) {
  const fallback = fallbackThumbs[index % fallbackThumbs.length];
  return {
    src: site?.imageUrl?.trim() || fallback.src,
    name: site?.name?.trim() || fallback.name,
    domain: site?.domain?.trim() || fallback.domain,
    cta: site?.cta?.trim() || fallback.cta,
    nav: site?.nav?.trim() || "Home About Contact",
  };
}

function WorkspaceScreen({
  href,
  data,
  cards,
}: {
  href: string;
  data: CmsBeyondAiContent;
  cards: ReturnType<typeof siteCard>[];
}) {
  const preview = cards[0];
  const previewThumbs = cards.slice(0, 4);

  return (
    <div className="overflow-hidden rounded-[18px] bg-[#0b1020] text-white shadow-[0_40px_120px_-24px_rgba(37,99,235,0.55)] ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="size-1.5 rounded-full bg-[#f87171]" />
            <span className="size-1.5 rounded-full bg-[#fbbf24]" />
            <span className="size-1.5 rounded-full bg-[#34d399]" />
          </span>
          <BeyondAiMark compact />
        </div>
        <div className="hidden items-center gap-3 text-[10px] font-semibold text-white/55 xl:flex">
          Build
          <span>Templates</span>
          <span>AI Models</span>
          <span>My Projects</span>
          <span>Billing</span>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="size-3.5 text-white/40" />
          <span className="grid size-6 place-items-center rounded-full bg-[#7c3aed] text-[10px] font-bold">
            G
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[4.4rem_minmax(0,1fr)_12.2rem] xl:grid-cols-[5.2rem_minmax(0,1fr)_13.6rem]">
        <aside className="space-y-3 border-r border-white/8 px-2 py-4 text-center text-[8px] font-semibold text-white/45 xl:text-[9px]">
          {(
            [
              { Icon: Home, label: "Create" },
              { Icon: LayoutGrid, label: "Templates" },
              { Icon: Sparkles, label: "AI Models" },
              { Icon: Globe, label: "My Websites" },
              { Icon: Settings, label: "Settings" },
            ] as const
          ).map((item) => (
            <div key={item.label} className="grid place-items-center gap-1">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full",
                  item.label === "Create"
                    ? "bg-[#7c3aed] text-white"
                    : "bg-white/6",
                )}
              >
                <item.Icon className="size-3.5" />
              </span>
              {item.label}
            </div>
          ))}
        </aside>

        <div className="min-w-0 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-extrabold tracking-tight xl:text-[17px]">
                {data.dashboardTitle}
              </p>
              <p className="mt-1 text-[10px] text-white/50">
                {data.toastTitle}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-[#a5b4fc]">
              {data.statsLabel}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 ring-1 ring-white/10">
            <Sparkles className="size-3.5 text-[#818cf8]" />
            <span className="min-w-0 flex-1 truncate text-[10px] text-white/45">
              {data.toastSubtitle}
            </span>
            <Link
              href={href}
              className="inline-flex h-7 items-center gap-1 rounded-full bg-[#7c3aed] px-3 text-[10px] font-bold"
            >
              Generate
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-extrabold">Choose an AI Model</p>
            <span className="text-[10px] text-white/40">Compare models</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 xl:grid-cols-4">
            {models.map((model, index) => (
              <div
                key={model.id}
                className={cn(
                  "rounded-xl px-2 py-2 ring-1",
                  index === 0
                    ? "bg-[#7c3aed]/20 ring-[#7c3aed]/40"
                    : "bg-white/4 ring-white/8",
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="grid size-5 shrink-0 place-items-center overflow-hidden rounded-full bg-white">
                    <AiModelBrandIcon
                      id={model.id}
                      variant="inline"
                      size={14}
                    />
                  </span>
                  <p className="text-[10px] font-extrabold">{model.name}</p>
                </div>
                <p className="mt-1 text-[8px] leading-tight text-white/45">
                  {model.note}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-extrabold">{data.saasTitle}</p>
            <span className="text-[10px] text-white/40">
              Browse AI templates
            </span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {cards.slice(0, 5).map((item, index) => (
              <MiniWebsite
                key={`${item.domain}-${index}`}
                src={item.src}
                name={item.name}
                domain={item.domain}
                cta={item.cta}
                nav={item.nav}
              />
            ))}
          </div>
        </div>

        <aside className="border-l border-white/8 px-3 py-4">
          <p className="text-[10px] font-extrabold text-white/70">
            Live Preview
          </p>
          <div className="mt-2">
            <MiniWebsite
              src={preview.src}
              name={preview.name}
              domain={preview.domain}
              cta={preview.cta}
              nav={preview.nav}
              tall
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {previewThumbs.slice(1, 4).map((item, index) => (
              <MiniWebsite
                key={`${item.domain}-p-${index}`}
                src={item.src}
                name={item.name}
                domain={item.domain}
                cta={item.cta}
                nav={item.nav}
              />
            ))}
          </div>
          <Link
            href={href}
            className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1 rounded-full bg-[#7c3aed] text-[10px] font-bold"
          >
            <Upload className="size-3" />
            Publish Website
          </Link>
          <div className="mt-3 space-y-1.5 text-[9px] font-semibold text-white/65">
            {["Connect domain", "Enable hosting", "SSL certificate"].map(
              (item) => (
                <p key={item} className="flex items-center justify-between">
                  {item}
                  <Check className="size-3 text-emerald-400" />
                </p>
              ),
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const reduce = useReducedMotion();
  const steps = data.highlights.slice(0, 3);
  const titleLines = data.title.split("\n").filter(Boolean);
  const scene =
    data.workspaceImageUrl?.trim() || "/images/home/beyond-ai/dark-glow.png";
  const ctaHref = data.primaryCtaHref || routes.beyondAi;
  const stats = [data.trust1, data.trust2, data.trust3].filter(Boolean);
  const cards = Array.from({ length: 5 }, (_, index) =>
    siteCard(data.sites[index], index),
  );

  return (
    <section className="relative w-full overflow-hidden bg-[#050816]">
      <Image
        src={scene}
        alt=""
        fill
        priority
        quality={95}
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(79,70,229,0.28),transparent_42%),linear-gradient(90deg,#050816_0%,#050816b8_28%,transparent_58%)]"
      />

      <div className="hb-shell relative z-10 grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:py-20 xl:min-h-[44rem]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.48 }}
          className="max-w-[34rem]"
        >
          <Link href={ctaHref} className="inline-flex">
            <BeyondAiMark />
          </Link>
          {data.badgeSecondary ? (
            <p className="mt-3 inline-flex rounded-full bg-white/8 px-3 py-1 text-[12px] font-semibold text-white/80 ring-1 ring-white/12">
              {data.badgeSecondary}
            </p>
          ) : null}

          <h2 className="font-heading mt-4 text-[clamp(2.4rem,5vw,3.9rem)] leading-[0.98] font-extrabold tracking-[-0.05em] text-white">
            {titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block">
              Into{" "}
              <span className="bg-gradient-to-r from-[#818cf8] via-[#c4b5fd] to-[#38bdf8] bg-clip-text text-transparent">
                {data.titleAccent.split(" ")[0]}
              </span>
              {data.titleAccent.includes(" ")
                ? ` ${data.titleAccent.split(" ").slice(1).join(" ")}`
                : ""}
            </span>
          </h2>

          <p className="mt-4 max-w-[28rem] text-[15px] leading-relaxed text-white/70">
            {data.description}
          </p>

          <ul className="mt-7 space-y-4">
            {steps.map((item) => {
              const Icon = stepIcons[item.icon] ?? Zap;
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-white">
                    <Icon className="size-3.5" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-extrabold text-white">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-white/55">
                      {item.subtitle}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <Link
            href={ctaHref}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#2563eb] px-7 text-[15px] font-bold text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)]"
          >
            {data.primaryCtaLabel}
            <ArrowRight className="size-4" />
          </Link>

          {stats.length ? (
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-semibold text-white/55">
              {stats.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="relative"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 rounded-[36px] bg-[radial-gradient(circle,rgba(99,102,241,0.28),transparent_62%)] blur-2xl"
          />
          <div className="relative">
            <WorkspaceScreen href={ctaHref} data={data} cards={cards} />
            <div className="mx-auto mt-2 h-2 w-[64%] rounded-b-[18px] bg-[#1e293b]" />
            <div className="mx-auto h-1.5 w-[38%] rounded-b-full bg-[#334155]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
