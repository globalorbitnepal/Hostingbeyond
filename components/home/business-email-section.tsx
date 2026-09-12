"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Headphones,
  Layers,
  Lock,
  Mail,
  Play,
  Shield,
  Users,
  Zap,
} from "lucide-react";

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

function MailStage({ src, alt }: { src: string; alt: string }) {
  if (!src) return null;

  return (
    <div className="relative w-full lg:-mr-8 xl:-mr-12">
      <div className="relative mx-auto aspect-[612/487] w-full max-w-[720px] lg:min-h-[540px] lg:max-w-none xl:min-h-[600px]">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          unoptimized={isRuntimeMediaSrc(src)}
          className="object-contain object-bottom object-right drop-shadow-[0_28px_50px_rgba(37,80,130,0.12)]"
        />
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
    <section className="relative isolate overflow-x-clip bg-[#eef4fb] pt-2 pb-14 sm:pt-4 sm:pb-20 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7fbff_0%,#eef4fb_42%,#f4f8fd_100%)]" />
        <div className="absolute top-[-8%] right-[-6%] h-[48%] w-[42%] rounded-full bg-[radial-gradient(ellipse,rgba(147,197,253,0.28),transparent_68%)] blur-3xl" />
      </div>

      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-4 xl:gap-2">
          <div className="relative z-10 max-w-[420px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-slate-600 uppercase shadow-[0_8px_22px_rgba(37,80,130,0.08)] backdrop-blur-xl">
              <Mail className="size-3.5 text-[#4f46e5]" />
              {data.badge}
            </span>

            <h2 className="font-heading mt-5 text-[clamp(2rem,4.6vw,3.55rem)] leading-[1.05] font-extrabold tracking-[-0.045em] text-slate-950">
              <span className="block">{data.title}</span>
              <span className="block bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                {data.titleAccent}
              </span>
            </h2>

            <p className="mt-4 max-w-[380px] text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
              {data.description}
            </p>

            <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
              {data.highlights.map((item) => {
                const Icon = highlightIcons[item.icon] ?? Shield;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 sm:flex-col sm:items-center sm:text-center"
                  >
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-[#d7e4f5] bg-white text-[#2563eb] shadow-[0_8px_18px_rgba(37,80,130,0.08)]">
                      <Icon className="size-[18px]" strokeWidth={1.8} />
                    </span>
                    <span className="text-[12px] leading-tight font-extrabold text-slate-800">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={data.primaryCtaHref}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)] sm:w-auto"
              >
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-[14px] font-bold text-slate-700 sm:w-auto"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_rgba(37,80,130,0.12)]">
                  <Play className="size-3.5 fill-current" />
                </span>
                {data.secondaryCtaLabel}
              </Link>
            </div>

            {data.handwrittenNote ? (
              <div className="mt-5 ml-8 flex items-start gap-2 text-[#7aa4d4]">
                <svg
                  aria-hidden
                  viewBox="0 0 48 36"
                  className="mt-1 h-8 w-10 shrink-0"
                  fill="none"
                >
                  <path
                    d="M4 8c10 18 22 24 40 20"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M36 22l8 6-10 2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="max-w-[210px] font-serif text-[15px] leading-snug text-slate-400 italic">
                  {data.handwrittenNote}
                </p>
              </div>
            ) : null}
          </div>

          <MailStage src={data.imageUrl} alt={data.imageAlt} />
        </div>

        <div className="mt-8 rounded-[999px] border border-white/90 bg-white/80 px-3 py-2.5 shadow-[0_18px_50px_-28px_rgba(37,80,130,0.32)] backdrop-blur-2xl sm:mt-10 sm:px-5">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {data.features.map((item) => {
              const Icon = featureIcons[item.icon] ?? Globe;
              return (
                <article
                  key={item.id}
                  className="flex items-center gap-3 rounded-full px-3 py-2"
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-[13px] font-extrabold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
