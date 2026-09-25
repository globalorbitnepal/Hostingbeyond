"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Globe2,
  Mail,
  Search,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function isVideoMediaSrc(src: string | null | undefined) {
  if (!src?.trim()) return false;
  return /\.(mp4|webm)(\?|#|$)/i.test(src.trim());
}

function PremiumBackdrop({ playing }: { playing: boolean }) {
  const reduce = useReducedMotion();
  const on = playing && !reduce;

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 opacity-95",
          on && "hb-pricing-motion-bg",
        )}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_20%,rgba(147,197,253,0.38),transparent_55%),radial-gradient(ellipse_at_78%_75%,rgba(167,139,250,0.42),transparent_50%)]"
      />
      {on ? (
        <>
          <motion.span
            aria-hidden
            className="absolute top-[12%] left-[8%] h-36 w-36 rounded-full bg-[#7c3aed]/35 blur-3xl"
            animate={{ x: [0, 26, 0], y: [0, -16, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden
            className="absolute right-[6%] bottom-[14%] h-44 w-44 rounded-full bg-[#2563eb]/28 blur-3xl"
            animate={{ x: [0, -22, 0], y: [0, 12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}
    </>
  );
}

export function DomainPremiumVideoLayer({
  src,
  playing,
  className,
}: {
  src: string;
  playing: boolean;
  className?: string;
}) {
  return (
    <video
      className={cn(
        "absolute inset-0 h-full w-full object-cover",
        playing ? "opacity-95" : "opacity-80",
        className,
      )}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

function StageChrome({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-[#0c0618]/55 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md"
        aria-hidden
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400/90" />
          <span className="size-2.5 rounded-full bg-amber-400/90" />
          <span className="size-2.5 rounded-full bg-emerald-400/90" />
          <span className="ml-2 truncate text-[11px] font-semibold text-white/50">
            hostingbeyond — domains
          </span>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function DomainSceneMotion({
  sceneId,
  playing,
}: {
  sceneId: string;
  playing: boolean;
}) {
  const reduce = useReducedMotion();
  const on = playing && !reduce;

  if (sceneId === "compare") {
    return <CompareMotion playing={on} />;
  }
  if (sceneId === "launch") {
    return <LaunchMotion playing={on} />;
  }
  return <SearchMotion playing={on} />;
}

function SearchMotion({ playing }: { playing: boolean }) {
  const extensions = [".com", ".io", ".store", ".ai"];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTick((v) => v + 1), 900);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <StageChrome>
      <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
        <Search className="size-4 text-[#a78bfa]" />
        <span className="text-[13px] font-bold text-white">
          northpeak
          <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-white align-[-2px]" />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {extensions.map((ext, index) => {
          const done = playing ? tick > index : true;
          return (
            <motion.div
              key={ext}
              className="rounded-xl border border-white/10 bg-white/8 px-2.5 py-2"
              animate={
                playing
                  ? { opacity: done ? 1 : 0.45, scale: done ? 1 : 0.98 }
                  : undefined
              }
              transition={{ duration: 0.35 }}
            >
              <p className="text-[11px] font-bold text-white/90">
                northpeak{ext}
              </p>
              <p
                className={cn(
                  "mt-1 text-[10px] font-extrabold",
                  done ? "text-emerald-300" : "text-white/45",
                )}
              >
                {done ? "Available" : "Checking…"}
              </p>
            </motion.div>
          );
        })}
      </div>
    </StageChrome>
  );
}

function CompareMotion({ playing }: { playing: boolean }) {
  const rows = [
    { tld: ".com", promo: "$0.01", renew: "$19.99", ok: true },
    { tld: ".coffee", promo: "$12", renew: "$32", ok: true },
    { tld: ".net", promo: "—", renew: "—", ok: false },
  ];
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setHighlight((v) => (v + 1) % rows.length),
      1400,
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <StageChrome>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <motion.div
            key={row.tld}
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2",
              index === highlight
                ? "border border-[#a78bfa]/60 bg-white/15"
                : "border border-white/10 bg-white/6",
            )}
            animate={
              playing && index === highlight ? { scale: [1, 1.02, 1] } : {}
            }
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <span className="text-[12px] font-bold text-white">
              northpeak{row.tld}
            </span>
            {row.ok ? (
              <span className="text-right text-[10px] font-extrabold text-emerald-300">
                {row.promo}
                <span className="block text-white/55">renews {row.renew}</span>
              </span>
            ) : (
              <span className="text-[10px] font-extrabold text-white/45">
                Taken
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </StageChrome>
  );
}

function LaunchMotion({ playing }: { playing: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((v) => (v + 1) % 3), 1600);
    return () => window.clearInterval(timer);
  }, [playing]);

  const items = [
    { icon: Globe2, label: "Site published", detail: "northpeak.com" },
    { icon: BadgeCheck, label: "SSL issued", detail: "Auto-renew on" },
    { icon: Mail, label: "Mailbox ready", detail: "hello@northpeak.com" },
  ];

  return (
    <StageChrome>
      <div className="space-y-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          const active = index <= step;
          return (
            <motion.div
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                active
                  ? "border-emerald-400/40 bg-emerald-500/15"
                  : "border-white/10 bg-white/6",
              )}
              animate={
                playing && index === step
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(52,211,153,0)",
                        "0 0 0 6px rgba(52,211,153,0.12)",
                        "0 0 0 0 rgba(52,211,153,0)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <span
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full",
                  active
                    ? "bg-emerald-500 text-white"
                    : "bg-white/10 text-white/50",
                )}
              >
                {active ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  <Icon className="size-4" />
                )}
              </span>
              <span>
                <span className="block text-[12px] font-extrabold text-white">
                  {item.label}
                </span>
                <span className="text-[10px] text-white/65">{item.detail}</span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </StageChrome>
  );
}

export function DomainIncludedPremiumStage({
  playing = true,
}: {
  playing?: boolean;
}) {
  const reduce = useReducedMotion();
  const on = playing && !reduce;
  const [panel, setPanel] = useState(0);

  useEffect(() => {
    if (!on) return;
    const timer = window.setInterval(() => setPanel((v) => (v + 1) % 3), 3200);
    return () => window.clearInterval(timer);
  }, [on]);

  const panels = [
    {
      title: "Branded inbox",
      body: "hello@yourbrand.com · SPF · DKIM",
      icon: Mail,
      accent: "from-[#673de6]/55 to-[#2563eb]/40",
    },
    {
      title: "HTTPS live",
      body: "Certificate issued & auto-renewed",
      icon: ShieldCheck,
      accent: "from-emerald-500/45 to-[#2563eb]/35",
    },
    {
      title: "One dashboard",
      body: "DNS · mail · hosting · Beyond AI",
      icon: Globe2,
      accent: "from-[#7c3aed]/50 to-[#0ea5e9]/35",
    },
  ];

  const current = panels[panel];

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white/70 bg-[#0f0a24] shadow-[0_28px_70px_-34px_rgba(47,28,106,0.5)] lg:aspect-[3/4]">
      <PremiumBackdrop playing={on} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f0a24]/90 via-[#0f0a24]/25 to-transparent"
      />
      <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-white/90 uppercase backdrop-blur-md">
          Live preview
        </span>

        <div className="relative min-h-[200px] flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 flex flex-col justify-center"
            >
              <div
                className={cn(
                  "rounded-[22px] border border-white/20 bg-gradient-to-br p-5 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.65)] backdrop-blur-md",
                  current.accent,
                )}
              >
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/20 text-white">
                  <current.icon className="size-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 text-[18px] font-extrabold tracking-tight text-white">
                  {current.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/85">
                  {current.body}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                  <motion.span
                    className="block h-full rounded-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.1, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2">
          {panels.map((item, index) => (
            <span
              key={item.title}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === panel ? "w-8 bg-white" : "w-2 bg-white/35",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
