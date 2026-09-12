"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Headphones,
  Layers,
  Lock,
  Mail,
  Play,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  Zap,
} from "lucide-react";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import {
  defaultBusinessEmailSection,
  type CmsBusinessEmailContent,
  type CmsBusinessEmailFeature,
  type CmsBusinessEmailHighlight,
  type CmsBusinessEmailStat,
} from "@/lib/orbit/defaults";

const highlightIcons: Record<CmsBusinessEmailHighlight["icon"], typeof Shield> =
  {
    shield: Shield,
    lock: Lock,
    zap: Zap,
    users: Users,
  };

const statIcons: Record<CmsBusinessEmailStat["icon"], typeof BarChart3> = {
  chart: BarChart3,
  globe: Globe,
  shield: ShieldCheck,
};

const featureIcons: Record<CmsBusinessEmailFeature["icon"], typeof Globe> = {
  globe: Globe,
  layers: Layers,
  headphones: Headphones,
  users: Users,
};

const cities = [
  {
    city: "New York",
    status: "Connected",
    top: "6%",
    left: "58%",
    initial: "N",
  },
  { city: "London", status: "Connected", top: "2%", left: "78%", initial: "L" },
  { city: "Tokyo", status: "Connected", top: "18%", left: "90%", initial: "T" },
  {
    city: "Sydney",
    status: "Connected",
    top: "32%",
    left: "88%",
    initial: "S",
  },
];

const sidebar = [
  { label: "Inbox", count: "12", active: true },
  { label: "Starred", icon: Star },
  { label: "Sent" },
  { label: "Drafts" },
  { label: "Spam" },
  { label: "Trash", icon: Trash2 },
];

function MailStage({ content }: { content: CmsBusinessEmailContent }) {
  return (
    <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-[-8%] right-[-6%] h-[70%] w-[80%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.28),transparent_68%)] blur-3xl" />
        <svg
          viewBox="0 0 800 420"
          className="absolute top-0 right-0 h-[70%] w-[92%] text-slate-300/50"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M430 70C520 90 610 40 720 80" strokeDasharray="4 6" />
            <path d="M520 80C610 110 680 90 740 150" strokeDasharray="4 6" />
            <path d="M540 90C600 180 690 170 760 210" strokeDasharray="4 6" />
          </g>
        </svg>
      </div>

      <div className="absolute top-2 left-[18%] z-20 hidden items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 shadow-[0_14px_36px_rgba(37,80,130,0.12)] backdrop-blur-xl sm:flex">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4f46e5]">
          <Mail className="size-3.5" />
        </span>
        <span className="text-[12px] font-bold text-slate-800">
          {content.toastEmail}
        </span>
        <Check className="size-4 text-emerald-500" strokeWidth={2.6} />
      </div>

      {cities.map((city) => (
        <div
          key={city.city}
          className="absolute z-20 hidden items-center gap-2 xl:flex"
          style={{ top: city.top, left: city.left }}
        >
          <span className="inline-flex size-8 items-center justify-center rounded-full border border-white bg-gradient-to-br from-[#93c5fd] to-[#6366f1] text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(79,70,229,0.25)]">
            {city.initial}
          </span>
          <span className="rounded-xl border border-white/70 bg-white/80 px-2 py-1 text-[10px] leading-tight shadow-sm backdrop-blur-xl">
            <span className="block font-bold text-slate-800">{city.city}</span>
            <span className="text-slate-500">{city.status}</span>
          </span>
        </div>
      ))}

      <div className="relative grid items-end gap-4 pt-10 sm:pt-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-0">
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-[380px]">
          <div className="overflow-hidden rounded-[26px] border border-white/80 bg-white/70 shadow-[0_28px_70px_-24px_rgba(37,80,130,0.45)] backdrop-blur-2xl">
            <div className="flex">
              <aside className="hidden w-[118px] border-r border-slate-100/90 bg-white/40 p-3 sm:block">
                <p className="mb-3 text-[12px] font-extrabold text-slate-900">
                  {content.mailTitle}
                </p>
                <button
                  type="button"
                  className="mb-3 inline-flex h-8 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-[11px] font-bold text-white"
                >
                  {content.composeLabel}
                </button>
                {sidebar.map((item) => (
                  <p
                    key={item.label}
                    className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                      item.active
                        ? "bg-[#eef4ff] text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    {item.label}
                    {item.count ? (
                      <span className="rounded-full bg-slate-900 px-1.5 text-[9px] text-white">
                        {item.count}
                      </span>
                    ) : null}
                  </p>
                ))}
              </aside>
              <div className="min-w-0 flex-1 p-3">
                <div className="mb-3 h-8 rounded-full border border-slate-100 bg-white/80 px-3 text-[11px] leading-8 text-slate-400">
                  Search emails…
                </div>
                <div className="space-y-2">
                  {content.messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center gap-2.5 rounded-2xl bg-white/70 px-2 py-2"
                    >
                      <span
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ background: message.accent }}
                      >
                        {message.sender.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-extrabold text-slate-900">
                          {message.sender}
                        </span>
                        <span className="block truncate text-[10px] text-slate-500">
                          {message.preview}
                        </span>
                      </span>
                      <span className="shrink-0 text-[9px] font-semibold text-slate-400">
                        {message.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative -mt-6 h-[280px] sm:-mt-10 sm:h-[340px] lg:mt-0 lg:h-[430px] xl:h-[470px]">
          {content.imageUrl ? (
            <Image
              src={content.imageUrl}
              alt={content.imageAlt}
              fill
              sizes="(max-width: 1024px) 90vw, 46vw"
              unoptimized={isRuntimeMediaSrc(content.imageUrl)}
              className="object-cover object-[72%_20%]"
            />
          ) : null}

          <div className="absolute top-[18%] right-0 z-20 hidden w-[168px] space-y-2 lg:block">
            {content.stats.map((stat) => {
              const Icon = statIcons[stat.icon] ?? BarChart3;
              return (
                <div
                  key={stat.id}
                  className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-2.5 py-2 shadow-[0_12px_28px_rgba(37,80,130,0.12)] backdrop-blur-xl"
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2563eb]">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-extrabold text-slate-900">
                      {stat.title}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {stat.subtitle}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessEmailSection({
  content,
}: {
  content?: CmsBusinessEmailContent;
}) {
  const data = content ?? defaultBusinessEmailSection();

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8fd] pt-4 pb-14 sm:pt-6 sm:pb-20 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7fbff_0%,#eef4fb_45%,#f4f8fd_100%)]" />
        <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[48%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.3),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-12%] left-[-8%] h-[40%] w-[38%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 xl:gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-slate-700 uppercase shadow-[0_8px_22px_rgba(37,80,130,0.08)] backdrop-blur-xl">
              <Mail className="size-3.5 text-[#4f46e5]" />
              {data.badge}
            </span>

            <h2 className="font-heading mt-5 text-[clamp(1.85rem,4.4vw,3.45rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950">
              <span className="block">{data.title}</span>
              <span className="block bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">
              {data.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Shield;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 sm:flex-col sm:items-center sm:text-center"
                  >
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#2563eb] shadow-[0_8px_20px_rgba(37,80,130,0.08)]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="text-[12px] font-extrabold text-slate-900">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={data.primaryCtaHref}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)] sm:w-auto"
              >
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/80 px-5 text-[14px] font-bold text-slate-800 shadow-[0_10px_24px_rgba(37,80,130,0.08)] backdrop-blur-xl sm:w-auto"
              >
                <Play className="size-4 fill-current" />
                {data.secondaryCtaLabel}
              </Link>
            </div>

            {data.handwrittenNote ? (
              <p className="mt-4 ml-2 max-w-[220px] font-serif text-[15px] leading-snug text-slate-400 italic">
                <span className="mb-1 block text-[#60a5fa]">↗</span>
                {data.handwrittenNote}
              </p>
            ) : null}
          </div>

          <MailStage content={data} />
        </div>

        <div className="mt-10 grid gap-2 rounded-full border border-white/80 bg-white/70 p-2 shadow-[0_18px_50px_-28px_rgba(37,80,130,0.32)] backdrop-blur-2xl sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:rounded-[28px] lg:px-3">
          {data.features.map((item) => {
            const Icon = featureIcons[item.icon] ?? Globe;
            return (
              <article
                key={item.id}
                className="flex items-center gap-3 rounded-[22px] px-4 py-3"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb]">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-[13px] font-extrabold tracking-tight text-slate-900">
                  {item.title}
                </h3>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
