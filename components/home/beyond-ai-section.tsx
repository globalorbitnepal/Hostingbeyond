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

import { routes } from "@/config/routes";
import {
  defaultBeyondAiSection,
  type CmsBeyondAiContent,
  type CmsBeyondAiHighlight,
} from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

const stepIcons: Record<CmsBeyondAiHighlight["icon"], typeof Zap> = {
  zap: Zap,
  cloud: PenLine,
  globe: Globe,
  rocket: Globe,
};

const models = [
  { name: "OpenAI", note: "Best for complete websites" },
  { name: "Claude", note: "Beautiful UI copy" },
  { name: "Gemini", note: "Fast and creative" },
  { name: "Grok", note: "Quick edits" },
];

const templates = [
  { src: "/images/home/beyond-ai/luxe-stay.jpg", label: "Hotel & Resort" },
  {
    src: "/images/home/beyond-ai/alpine-trails.jpg",
    label: "Travel & Trekking",
  },
  { src: "/images/home/beyond-ai/ocean-escapes.jpg", label: "Restaurant" },
  { src: "/images/home/beyond-ai/desert-dunes.jpg", label: "Business" },
  { src: "/images/home/beyond-ai/hotel.png", label: "Portfolio" },
];

function WorkspaceScreen({ href }: { href: string }) {
  return (
    <div className="overflow-hidden rounded-[18px] bg-[#0b1020] text-white shadow-[0_40px_120px_-24px_rgba(37,99,235,0.55)] ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="size-1.5 rounded-full bg-[#f87171]" />
            <span className="size-1.5 rounded-full bg-[#fbbf24]" />
            <span className="size-1.5 rounded-full bg-[#34d399]" />
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-extrabold">
            <Sparkles className="size-3 text-[#818cf8]" />
            Beyond AI
          </span>
        </div>
        <div className="hidden items-center gap-3 text-[10px] font-semibold text-white/55 xl:flex">
          Build
          <span>Templates</span>
          <span>AI Models</span>
          <span>My Projects</span>
          <span>Pricing</span>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="size-3.5 text-white/40" />
          <span className="grid size-6 place-items-center rounded-full bg-[#7c3aed] text-[10px] font-bold">
            G
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[4.4rem_minmax(0,1fr)_11.5rem] xl:grid-cols-[5.2rem_minmax(0,1fr)_13rem]">
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
                Create Your Website with AI
              </p>
              <p className="mt-1 text-[10px] text-white/50">
                Describe your idea, choose a model, and generate a complete
                website.
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-[#a5b4fc]">
              How it works?
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 ring-1 ring-white/10">
            <Sparkles className="size-3.5 text-[#818cf8]" />
            <span className="min-w-0 flex-1 truncate text-[10px] text-white/45">
              A luxury hotel website with booking system, modern design, soft
              colors...
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
                key={model.name}
                className={cn(
                  "rounded-xl px-2.5 py-2 ring-1",
                  index === 0
                    ? "bg-[#7c3aed]/20 ring-[#7c3aed]/40"
                    : "bg-white/4 ring-white/8",
                )}
              >
                <p className="text-[10px] font-extrabold">{model.name}</p>
                <p className="mt-0.5 text-[8px] leading-tight text-white/45">
                  {model.note}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-extrabold">Popular Templates</p>
            <span className="text-[10px] text-white/40">
              Browse AI templates
            </span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {templates.map((item) => (
              <div key={item.label} className="min-w-0">
                <div className="relative h-12 overflow-hidden rounded-lg xl:h-14">
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <p className="mt-1 truncate text-[8px] font-semibold text-white/55">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="border-l border-white/8 px-3 py-4">
          <p className="text-[10px] font-extrabold text-white/70">
            Live Preview
          </p>
          <div className="relative mt-2 h-[88px] overflow-hidden rounded-xl xl:h-[104px]">
            <Image
              src="/images/home/beyond-ai/alpine-trails.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="180px"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/45 px-2 py-1 text-[9px] font-bold">
              Explore The World
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {templates.slice(0, 3).map((item) => (
              <div
                key={item.src}
                className="relative h-8 overflow-hidden rounded-md"
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50px"
                />
              </div>
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
          <p className="inline-flex items-center gap-1.5 text-[1.05rem] font-extrabold text-white">
            <Sparkles className="size-4 text-[#c4b5fd]" />
            {data.badge}
          </p>
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
            <WorkspaceScreen href={ctaHref} />
            <div className="mx-auto mt-2 h-2 w-[64%] rounded-b-[18px] bg-[#1e293b]" />
            <div className="mx-auto h-1.5 w-[38%] rounded-b-full bg-[#334155]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
