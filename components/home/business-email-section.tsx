"use client";

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

import {
  defaultBusinessEmailSection,
  type CmsBusinessEmailContent,
  type CmsBusinessEmailFeature,
  type CmsBusinessEmailHighlight,
} from "@/lib/orbit/defaults";
import {
  GlassBand,
  GlassPromptBar,
  GlassVideoStage,
} from "./glass-video-frame";

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
          <Mail className="size-3.5 text-[#673de6]" />
          {content.mailTitle}
        </p>
      </div>
      <div className="flex">
        <aside className="hidden w-[118px] border-r border-white/70 bg-white/40 p-3 sm:block">
          <button
            type="button"
            className="mb-3 inline-flex h-8 w-full items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-[11px] font-bold text-white"
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
                  item.active ? "bg-[#f4f5ff] text-slate-900" : "text-slate-500"
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
  const src =
    content.imageUrl?.includes("woman.") || !content.imageUrl
      ? "/images/home/business-email-stage.png"
      : content.imageUrl;

  return (
    <GlassVideoStage
      src={src}
      alt={content.imageAlt}
      overlay={<GlassPromptBar text="you@yourbrand.com is ready" />}
    >
      <div className="absolute top-4 left-4 z-20 w-[min(92%,340px)] sm:top-6 sm:left-6">
        <div className="origin-top-left scale-[0.82] sm:scale-90">
          <MailInbox content={content} />
        </div>
      </div>
    </GlassVideoStage>
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
    <GlassBand>
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
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-[12px] font-bold tracking-[0.04em] text-white backdrop-blur-xl">
              <Mail className="size-3.5" aria-hidden />
              {data.badge}
            </span>

            <h2 className="font-heading mt-5 text-[clamp(1.9rem,3.8vw,3.15rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-white">
              <span className="block">{data.title}</span>
              <span className="block bg-gradient-to-r from-[#bfdbfe] via-white to-[#ddd6fe] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-4 text-[15.5px] leading-7 text-white/75 sm:text-[16.5px]">
              {data.description}
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Shield;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-white/25 bg-white/12 px-3.5 py-3.5 backdrop-blur-xl"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-[0_8px_18px_rgba(15,10,40,0.12)] ring-1 ring-white/25">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-[13.5px] font-extrabold tracking-tight text-white">
                        {item.title}
                      </span>
                      {item.subtitle ? (
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-white/65">
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
              >
                <Mail className="size-4" />
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(15,10,40,0.12)] backdrop-blur-xl"
              >
                <Play className="size-4 fill-current" />
                {data.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] font-semibold text-white/70">
              {[data.trust1, data.trust2, data.trust3]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 text-[#93c5fd]" />
                    {item}
                  </span>
                ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-white/20 pt-7 sm:grid-cols-2 lg:grid-cols-4">
          {data.features.map((item) => {
            const Icon = featureIcons[item.icon] ?? Globe;
            return (
              <article key={item.id} className="flex gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold tracking-tight text-white">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-1 text-[12px] leading-relaxed text-white/65">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </GlassBand>
  );
}
