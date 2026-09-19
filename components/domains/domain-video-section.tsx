"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe,
  Mail,
  Pause,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import { useTyped } from "@/hooks/use-typed";
import { cn } from "@/lib/utils";

const SCENES = [
  {
    id: "search",
    prompt: "northpeak.coffee",
    label: "Search",
    caption: "Type one idea — we check 10 extensions instantly.",
    icon: Search,
    chips: ["northpeak.com available", "northpeak.store available"],
  },
  {
    id: "secure",
    prompt: "Lock it with free WHOIS privacy",
    label: "Secure",
    caption: "WHOIS privacy, registry lock and DNS are included.",
    icon: Sparkles,
    chips: ["WHOIS privacy on", "Registry lock on"],
  },
  {
    id: "mail",
    prompt: "hello@northpeak.com",
    label: "Mail",
    caption: "Add branded mailboxes on the same domain in a click.",
    icon: Mail,
    chips: ["Mailbox created", "SPF + DKIM set"],
  },
  {
    id: "live",
    prompt: "northpeak.com is live",
    label: "Launch",
    caption: "Point it at hosting or a Beyond AI site — SSL auto-issues.",
    icon: Globe,
    chips: ["SSL issued", "Site published"],
  },
] as const;

const SCENE_MS = 4200;

export function DomainVideoSection() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || reduce) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SCENES.length);
    }, SCENE_MS);
    return () => window.clearInterval(timer);
  }, [playing, reduce]);

  const scene = SCENES[index];
  const typed = useTyped(scene.prompt, playing && !reduce, reduce, true);

  return (
    <section
      id="how-it-works"
      className="hb-band-purple relative overflow-hidden py-16 sm:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,255,255,0.18),transparent_55%)]"
      />
      <div className="hb-shell relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
          <div>
            <p className="text-[11px] font-bold tracking-[0.28em] text-white uppercase">
              Domain to live site
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-white">
              Watch a name become a business
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/90 sm:text-[16px]">
              Search, secure and launch in one place. No transfers between
              vendors, no DNS guesswork — every step below happens inside your
              HostingBeyond panel.
            </p>

            <ol className="mt-6 space-y-2">
              {SCENES.map((item, itemIndex) => {
                const Icon = item.icon;
                const active = itemIndex === index;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(itemIndex)}
                      aria-current={active}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition",
                        active
                          ? "border-white bg-white shadow-[0_16px_34px_-20px_rgba(15,10,40,0.7)]"
                          : "border-white/50 bg-white/18 hover:bg-white/28",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                          active
                            ? "bg-[#f3eeff] text-[#673de6]"
                            : "border border-white/60 bg-white/20 text-white",
                        )}
                      >
                        <Icon className="size-[17px]" strokeWidth={2} />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block text-[14px] font-extrabold tracking-tight",
                            active ? "text-[#2f1c6a]" : "text-white",
                          )}
                        >
                          {itemIndex + 1}. {item.label}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block text-[12.5px] leading-snug",
                            active ? "text-slate-600" : "text-white/90",
                          )}
                        >
                          {item.caption}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <Link
              href={routes.getStarted}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#2f1c6a] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)]"
            >
              Start with your domain
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/45 bg-white/10 shadow-[0_34px_80px_-34px_rgba(15,10,40,0.75)] sm:rounded-[32px]">
              <Image
                src="/images/domains/search-stage.jpg"
                alt="HostingBeyond domain search checking availability across extensions"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
                className={cn(
                  "object-cover",
                  playing && !reduce ? "hb-video" : "scale-[1.04]",
                )}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1035]/75 via-[#1a1035]/10 to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-2 sm:top-4 sm:left-4">
                <button
                  type="button"
                  onClick={() => setPlaying((value) => !value)}
                  aria-label={playing ? "Pause preview" : "Play preview"}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40"
                >
                  {playing ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4 fill-current" />
                  )}
                </button>
                <span className="rounded-full border border-white/50 bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  Step {index + 1} of {SCENES.length}
                </span>
              </div>

              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 space-y-2 sm:inset-x-6">
                {scene.chips.map((chip, chipIndex) => (
                  <motion.p
                    key={`${scene.id}-${chip}`}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.25 + chipIndex * 0.22,
                      duration: 0.45,
                    }}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11.5px] font-bold text-[#2f1c6a] shadow-[0_10px_24px_-12px_rgba(15,10,40,0.6)] sm:text-[12.5px]"
                  >
                    <Check
                      className="size-3.5 text-[#15803d]"
                      strokeWidth={3}
                    />
                    <span className="truncate">{chip}</span>
                  </motion.p>
                ))}
              </div>

              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white px-3 py-2 shadow-[0_18px_40px_-18px_rgba(15,10,40,0.7)] sm:px-4 sm:py-2.5">
                  <Search className="size-4 shrink-0 text-[#673de6]" />
                  <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-[#2f1c6a] sm:text-[14.5px]">
                    {typed}
                    <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
                  </p>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-white">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/30">
                  <motion.div
                    key={`${scene.id}-bar-${playing}`}
                    className="h-full rounded-full bg-white"
                    initial={{ width: reduce ? "100%" : "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: playing && !reduce ? SCENE_MS / 1000 : 0,
                      ease: "linear",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
