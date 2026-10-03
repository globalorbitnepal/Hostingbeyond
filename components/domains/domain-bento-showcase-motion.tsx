"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Globe2, ShieldCheck } from "lucide-react";

import type { ShowcaseLayout } from "@/components/domains/domain-showcase-media";
import { cn } from "@/lib/utils";

export function DomainBentoShowcaseMotion({
  layout,
  badge,
  className,
}: {
  layout: ShowcaseLayout;
  badge?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const playing = !reduce;

  return (
    <div
      className={cn(
        "relative h-full min-h-[200px] w-full overflow-hidden",
        className,
      )}
    >
      {layout === "registrar" ? <RegistrarMotion playing={playing} /> : null}
      {layout === "privacy" ? <PrivacyMotion playing={playing} /> : null}
      {layout === "support" ? (
        <SupportMotion playing={playing} badge={badge} />
      ) : null}
      {layout === "setup" ? <SetupMotion playing={playing} /> : null}
    </div>
  );
}

function MotionBackdrop({
  playing,
  dark,
}: {
  playing: boolean;
  dark?: boolean;
}) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          dark
            ? "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]"
            : "bg-gradient-to-br from-[#ede9fe] via-[#dbeafe] to-[#e0e7ff]",
          playing && !dark && "hb-pricing-motion-bg",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          dark
            ? "bg-[radial-gradient(ellipse_at_20%_20%,rgba(96,165,250,0.35),transparent_55%),radial-gradient(ellipse_at_85%_80%,rgba(103,61,230,0.4),transparent_50%)]"
            : "bg-[radial-gradient(ellipse_at_25%_15%,rgba(167,139,250,0.35),transparent_50%),radial-gradient(ellipse_at_80%_85%,rgba(96,165,250,0.28),transparent_45%)]",
        )}
      />
      {playing ? (
        <>
          <motion.span
            aria-hidden
            className={cn(
              "absolute top-[8%] left-[6%] h-32 w-32 rounded-full blur-3xl",
              dark ? "bg-[#2563eb]/35" : "bg-[#673de6]/25",
            )}
            animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden
            className={cn(
              "absolute right-[5%] bottom-[10%] h-36 w-36 rounded-full blur-3xl",
              dark ? "bg-[#7c3aed]/30" : "bg-[#2563eb]/22",
            )}
            animate={{ x: [0, -14, 0], y: [0, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}
    </>
  );
}

function RegistrarMotion({ playing }: { playing: boolean }) {
  const exts = [".com", ".io", ".shop", ".ai"];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setTick((v) => v + 1), 900);
    return () => window.clearInterval(t);
  }, [playing]);

  const ext = exts[tick % exts.length];

  return (
    <div className="absolute inset-0">
      <MotionBackdrop playing={playing} />
      <div className="relative z-10 flex h-full flex-col justify-center p-5 sm:p-6">
        <motion.div
          className="w-full rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_24px_60px_-28px_rgba(103,61,230,0.45)] backdrop-blur-sm sm:p-5"
          animate={playing ? { y: [0, -4, 0] } : undefined}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-2 rounded-xl bg-[#f4f5ff] px-3 py-3 ring-1 ring-[#e0e7ff] sm:py-3.5">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#673de6]/40" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#673de6]" />
            </span>
            <Globe2 className="size-5 shrink-0 text-[#673de6]" />
            <span className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-[#2f1c6a] sm:text-[17px]">
              yourbrand{ext}
              <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
            </span>
            <span className="shrink-0 rounded-lg bg-[#673de6] px-3 py-1.5 text-[11px] font-extrabold text-white shadow-[0_0_24px_rgba(103,61,230,0.45)]">
              Search
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["ICANN-accredited", "300+ extensions", "Renewal upfront"].map(
              (label, i) => (
                <motion.span
                  key={label}
                  className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-bold text-[#4338ca] sm:text-[11px]"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.35 }}
                >
                  {label}
                </motion.span>
              ),
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[12px] font-bold text-[#2f1c6a] sm:text-[13px]">
              Free WHOIS privacy
            </span>
            <span className="relative h-7 w-12 rounded-full bg-[#673de6]">
              <motion.span
                className="absolute top-1 right-1 size-5 rounded-full bg-white shadow"
                animate={playing ? { x: [0, -4, 0] } : undefined}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e0e7ff]">
            <motion.span
              className="block h-full rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb]"
              animate={
                playing ? { width: ["35%", "95%", "35%"] } : { width: "70%" }
              }
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PrivacyMotion({ playing }: { playing: boolean }) {
  const rows = [
    { label: "WHOIS privacy", value: "ON", ok: true },
    { label: "SSL certificate", value: "Active", ok: true },
    { label: "Contact details", value: "Hidden", ok: false },
  ];

  return (
    <div className="absolute inset-0">
      <MotionBackdrop playing={playing} dark />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {playing ? (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute top-1/2 left-[28%] size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#60a5fa]/30 sm:left-[32%] sm:size-56"
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      ) : null}
      <div className="relative z-10 flex h-full items-center gap-4 px-4 py-5 sm:gap-8 sm:px-8">
        <motion.div
          className="relative flex shrink-0 items-center justify-center"
          animate={playing ? { y: [0, -8, 0] } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex size-24 items-center justify-center rounded-[28px] bg-gradient-to-b from-[#60a5fa] to-[#2563eb] shadow-[0_0_50px_rgba(96,165,250,0.55)] sm:size-28">
            <ShieldCheck
              className="size-11 text-white sm:size-12"
              strokeWidth={1.8}
            />
          </div>
        </motion.div>
        <div className="min-w-0 flex-1 space-y-2.5 sm:space-y-3">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.4 }}
            >
              <span className="text-[12px] font-bold text-white sm:text-[14px]">
                {row.label}
              </span>
              <span
                className={cn(
                  "text-[12px] font-extrabold sm:text-[13px]",
                  row.ok ? "text-emerald-400" : "text-white/70",
                )}
              >
                {row.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportMotion({
  playing,
  badge,
}: {
  playing: boolean;
  badge?: string;
}) {
  const opener =
    badge?.trim() || "Hi — I need help connecting my domain to hosting.";
  const script = [
    { from: "you", text: opener },
    {
      from: "agent",
      text: "Hello! I can walk you through DNS in one panel.",
    },
    { from: "you", text: "Perfect — buying my first .com today." },
    { from: "agent", text: "Done — your domain is pointed and SSL is on." },
  ];
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    if (!playing) {
      setVisible(script.length);
      return;
    }
    setVisible(1);
    const t = window.setInterval(() => {
      setVisible((v) => (v >= 4 ? 1 : v + 1));
    }, 1400);
    return () => window.clearInterval(t);
  }, [playing, opener]);

  return (
    <div className="absolute inset-0">
      <MotionBackdrop playing={playing} />
      <div className="relative z-10 flex h-full flex-col p-3 sm:p-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_24px_60px_-28px_rgba(103,61,230,0.35)]">
          <div className="flex shrink-0 items-center justify-between gap-2 bg-[#673de6] px-3 py-2.5 sm:px-4 sm:py-3">
            <span className="truncate text-[13px] font-extrabold text-white sm:text-[15px]">
              HostingBeyond Support
            </span>
            <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
              24/7 Live
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3 sm:gap-2.5 sm:p-4">
            {script.slice(0, visible).map((msg, i) => (
              <motion.div
                key={`${msg.text}-${i}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "max-w-[92%] rounded-2xl px-3 py-2.5 text-[12px] leading-snug font-medium sm:text-[13px]",
                  msg.from === "agent"
                    ? "ml-auto bg-[#673de6] text-white"
                    : "bg-[#f1f5f9] text-[#2f1c6a]",
                )}
              >
                {msg.text}
              </motion.div>
            ))}
            {playing && visible >= script.length ? (
              <motion.div
                className="ml-auto flex gap-1 rounded-2xl bg-[#ede9fe] px-3 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-2 rounded-full bg-[#673de6]"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: i * 0.12,
                    }}
                  />
                ))}
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupMotion({ playing }: { playing: boolean }) {
  const steps = ["Register domain", "Manage DNS", "Add hosting & mail"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setActive((v) => (v + 1) % 3), 1600);
    return () => window.clearInterval(t);
  }, [playing]);

  return (
    <div className="absolute inset-0">
      <MotionBackdrop playing={playing} />
      <div className="relative z-10 flex h-full items-center justify-center p-4 sm:p-5">
        <div className="w-full max-w-none rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_24px_60px_-28px_rgba(103,61,230,0.35)] backdrop-blur-sm sm:p-5">
          <p className="text-[15px] font-extrabold text-[#2f1c6a] sm:text-[17px]">
            Quick domain setup
          </p>
          <ul className="mt-4 space-y-4">
            {steps.map((label, index) => {
              const done = index < active || (!playing && index < 2);
              const current = index === active;
              return (
                <li key={label} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold",
                        done
                          ? "bg-[#673de6] text-white"
                          : "border-2 border-[#673de6] text-[#673de6]",
                      )}
                    >
                      {done ? (
                        <Check className="size-4" strokeWidth={3} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="text-[13px] font-bold text-[#2f1c6a] sm:text-[14px]">
                      {label}
                    </span>
                  </div>
                  <div className="ml-11 h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                    <motion.span
                      className="block h-full rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb]"
                      animate={{
                        width:
                          current && playing ? "100%" : done ? "100%" : "12%",
                      }}
                      transition={{ duration: current && playing ? 1.4 : 0.3 }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <motion.div
            className="mt-5 text-center"
            animate={
              playing
                ? {
                    boxShadow: [
                      "0 0 0 0 rgba(103,61,230,0)",
                      "0 0 28px rgba(103,61,230,0.35)",
                      "0 0 0 0 rgba(103,61,230,0)",
                    ],
                  }
                : undefined
            }
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="inline-flex rounded-full bg-[#673de6] px-6 py-2.5 text-[13px] font-extrabold text-white">
              Go live
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
