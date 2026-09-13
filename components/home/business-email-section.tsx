"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Globe,
  Headphones,
  Inbox,
  Layers,
  Lock,
  Mail,
  PenLine,
  Play,
  Search,
  Shield,
  Star,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import {
  defaultBusinessEmailSection,
  type CmsBusinessEmailContent,
  type CmsBusinessEmailFeature,
  type CmsBusinessEmailHighlight,
} from "@/lib/orbit/defaults";

const highlightIcons: Record<CmsBusinessEmailHighlight["icon"], typeof Shield> =
  {
    shield: Shield,
    lock: Lock,
    zap: Zap,
    users: Users,
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
    top: "28%",
    left: "22%",
    photo: "/images/business-email/ny.png",
  },
  {
    city: "London",
    status: "Connected",
    top: "24%",
    left: "49%",
    photo: "/images/business-email/london.png",
  },
  {
    city: "Tokyo",
    status: "Connected",
    top: "30%",
    left: "80%",
    photo: "/images/business-email/tokyo.png",
  },
  {
    city: "Sydney",
    status: "Connected",
    top: "58%",
    left: "82%",
    photo: "/images/business-email/sydney.png",
  },
];

const sidebar = [
  { label: "Inbox", count: "12", active: true, icon: Inbox },
  { label: "Starred", icon: Star },
  { label: "Sent", icon: Mail },
  { label: "Drafts", icon: FileText },
  { label: "Spam", icon: Shield },
  { label: "Trash", icon: Trash2 },
];

function MailInbox({ content }: { content: CmsBusinessEmailContent }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/60 shadow-[0_32px_80px_-28px_rgba(37,80,130,0.48)] backdrop-blur-2xl sm:rounded-[32px]">
      <div className="relative flex items-center gap-2 border-b border-white/70 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <p className="ml-2 flex items-center gap-1.5 text-[12px] font-extrabold text-slate-900">
          <Mail className="size-3.5 text-[#4f46e5]" />
          {content.mailTitle}
        </p>
      </div>
      <div className="flex">
        <aside className="hidden w-[118px] border-r border-white/70 bg-white/40 p-3 sm:block">
          <button
            type="button"
            className="mb-3 inline-flex h-8 w-full items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-[11px] font-bold text-white"
          >
            <PenLine className="size-3" />
            {content.composeLabel}
          </button>
          {sidebar.map((item) => {
            const Icon = item.icon;
            return (
              <p
                key={item.label}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                  item.active ? "bg-[#eef4ff] text-slate-900" : "text-slate-500"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="size-3" />
                  {item.label}
                </span>
                {item.count ? (
                  <span className="rounded-full bg-slate-900 px-1.5 text-[9px] text-white">
                    {item.count}
                  </span>
                ) : null}
              </p>
            );
          })}
        </aside>
        <div className="min-w-0 flex-1 p-3">
          <div className="mb-3 flex h-8 items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 text-[11px] text-slate-400">
            <Search className="size-3.5" />
            Search emails…
          </div>
          <div className="space-y-2">
            {content.messages.map((message) => (
              <div
                key={message.id}
                className="flex items-center gap-2.5 rounded-2xl bg-white/75 px-2 py-2"
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
  );
}

function MailStage({ content }: { content: CmsBusinessEmailContent }) {
  return (
    <div className="relative mx-auto min-h-[560px] w-full max-w-[760px] sm:min-h-[620px] lg:mx-0 lg:min-h-[700px] lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(147,197,253,0.28),transparent_58%)]"
      />

      <div className="absolute top-[2%] left-[-4%] z-[5] aspect-[16/9] w-[108%] max-w-[820px]">
        <Image
          src="/images/business-email/map.png"
          alt=""
          fill
          unoptimized
          sizes="(max-width: 1024px) 90vw, 58vw"
          className="object-contain object-left opacity-90"
        />
        <svg
          aria-hidden
          viewBox="0 0 100 56"
          className="pointer-events-none absolute inset-0 h-full w-full text-sky-400/50"
        >
          <path
            d="M26 20C38 14 46 16 52 16C64 16 74 18 82 20"
            fill="none"
            stroke="currentColor"
            strokeDasharray="1.2 1.8"
            strokeWidth="0.35"
          />
          <path
            d="M26 20C40 28 58 32 82 34"
            fill="none"
            stroke="currentColor"
            strokeDasharray="1.2 1.8"
            strokeWidth="0.35"
          />
        </svg>
        {cities.map((city) => (
          <div
            key={city.city}
            className="absolute z-10 hidden items-center gap-2 lg:flex"
            style={{ top: city.top, left: city.left }}
          >
            <span className="relative size-9 overflow-hidden rounded-full border-2 border-white shadow-[0_8px_18px_rgba(79,70,229,0.22)]">
              <Image
                src={city.photo}
                alt=""
                fill
                unoptimized
                sizes="36px"
                className="object-cover object-top"
              />
            </span>
            <span className="rounded-xl border border-white/80 bg-white/90 px-2 py-1 text-[10px] leading-tight shadow-sm backdrop-blur-xl">
              <span className="block font-bold text-slate-800">
                {city.city}
              </span>
              <span className="text-slate-500">{city.status}</span>
            </span>
          </div>
        ))}
      </div>

      {content.imageUrl ? (
        <div className="absolute right-[2%] bottom-[-4%] z-10 h-[94%] w-[82%] sm:right-0 sm:w-[76%] lg:w-[74%]">
          <Image
            src={content.imageUrl}
            alt={content.imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 52vw"
            unoptimized={
              isRuntimeMediaSrc(content.imageUrl) ||
              content.imageUrl.endsWith(".png")
            }
            className="[mask-image:linear-gradient(180deg,transparent_2%,#000_14%,#000_86%,transparent_100%),linear-gradient(90deg,transparent_0%,#000_16%,#000_92%,transparent_100%)] [mask-composite:intersect] object-contain object-bottom [-webkit-mask-composite:source-in] [-webkit-mask-image:linear-gradient(180deg,transparent_2%,#000_14%,#000_86%,transparent_100%),linear-gradient(90deg,transparent_0%,#000_16%,#000_92%,transparent_100%)]"
          />
        </div>
      ) : null}

      <div className="absolute top-[34%] left-0 z-20 w-[90%] max-w-[380px] sm:top-[28%] sm:w-[58%]">
        <MailInbox content={content} />
      </div>

      <div className="absolute top-[16%] left-[4%] z-30 hidden items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 shadow-[0_10px_28px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]">
          <Mail className="size-3.5" />
        </span>
        <span className="text-[12px] font-bold text-slate-800">
          {content.toastEmail}
        </span>
        <Check className="size-4 text-emerald-500" strokeWidth={2.6} />
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
  const reduceMotion = useReducedMotion();

  return (
    <section className="hb-home-section hb-home-section--white">
      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10 xl:gap-14">
          <motion.div
            className="relative order-2 lg:order-1"
            initial={reduceMotion ? false : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <MailStage content={data} />
          </motion.div>

          <motion.div
            className="order-1 flex max-w-[34rem] flex-col justify-center lg:order-2"
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef2ff] px-3.5 py-1.5 text-[12px] font-bold tracking-[0.04em] text-[#4f46e5]">
              <Mail className="size-3.5" aria-hidden />
              {data.badge}
            </span>

            <h2 className="font-heading mt-5 text-[clamp(1.9rem,3.8vw,3.15rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-slate-950">
              <span className="block">{data.title}</span>
              <span className="block bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-4 text-[15.5px] leading-7 text-slate-600 sm:text-[16.5px]">
              {data.description}
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Shield;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-[#f8fbff] px-3.5 py-3.5"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563eb] shadow-[0_8px_18px_rgba(37,80,130,0.08)] ring-1 ring-slate-100">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-[13.5px] font-extrabold tracking-tight text-slate-950">
                        {item.title}
                      </span>
                      {item.subtitle ? (
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={data.primaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#4f46e5] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
              >
                <Mail className="size-4" />
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-[14px] font-bold text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
              >
                <Play className="size-4 fill-current" />
                {data.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] font-semibold text-slate-500">
              {[data.trust1, data.trust2, data.trust3]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 text-[#2563eb]" />
                    {item}
                  </span>
                ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-slate-200/80 pt-7 sm:grid-cols-2 lg:grid-cols-4">
          {data.features.map((item) => {
            const Icon = featureIcons[item.icon] ?? Globe;
            return (
              <article key={item.id} className="flex gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb]">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold tracking-tight text-slate-950">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
