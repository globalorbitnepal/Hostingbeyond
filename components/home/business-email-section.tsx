"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
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
import { motion, useReducedMotion } from "framer-motion";

import { MailWorkspace } from "@/components/business-email/mail-workspace";
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

function MailStage() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/70 p-2 shadow-[0_32px_70px_-28px_rgba(15,10,40,0.22)] ring-1 ring-white/60 backdrop-blur-2xl sm:p-2.5">
      <MailWorkspace compact />
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
    <section className="hb-home-section hb-home-section--mist">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-[-12%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.35),transparent_68%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] bottom-[-20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.16),transparent_70%)] blur-2xl"
      />

      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)] lg:gap-10 xl:gap-12">
          <motion.div
            className="relative order-2 lg:order-1"
            initial={reduceMotion ? false : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <MailStage />
          </motion.div>

          <motion.div
            className="order-1 flex max-w-[34rem] flex-col justify-center lg:order-2"
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-[12px] font-bold tracking-[0.04em] text-[#673de6] backdrop-blur-xl">
              <Mail className="size-3.5" aria-hidden />
              {data.badge}
            </span>

            <h2 className="font-heading mt-5 text-[clamp(1.9rem,3.8vw,3.15rem)] leading-[1.08] font-extrabold tracking-[-0.045em] text-[#2f1c6a]">
              <span className="block">{data.title}</span>
              <span className="block bg-gradient-to-r from-[#2563eb] via-[#673de6] to-[#7c3aed] bg-clip-text text-transparent">
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
                    className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/70 px-3.5 py-3.5 backdrop-blur-xl"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#673de6] shadow-[0_8px_18px_rgba(15,10,40,0.08)]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-[13.5px] font-extrabold tracking-tight text-[#2f1c6a]">
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]"
              >
                <Mail className="size-4" />
                {data.primaryCtaLabel}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={data.secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#c4b5fd] bg-white px-5 text-[14px] font-bold text-[#2f1c6a] shadow-[0_8px_20px_rgba(15,10,40,0.08)]"
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
                    <Check className="size-3.5 text-[#673de6]" />
                    {item}
                  </span>
                ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-[#c4b5fd]/40 pt-7 sm:grid-cols-2 lg:grid-cols-4">
          {data.features.map((item) => {
            const Icon = featureIcons[item.icon] ?? Globe;
            return (
              <article key={item.id} className="flex gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-[#673de6]">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold tracking-tight text-[#2f1c6a]">
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
