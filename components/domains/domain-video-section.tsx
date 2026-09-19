"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe,
  Pause,
  Play,
  Search,
  ShieldCheck,
} from "lucide-react";

import { routes } from "@/config/routes";
import { useInView } from "@/hooks/use-in-view";
import { useTyped } from "@/hooks/use-typed";
import { cn } from "@/lib/utils";

export type VideoScene = {
  id: string;
  image: string;
  label: string;
  caption: string;
  prompt: string;
  chips: string[];
};

const SCENE_ICONS = [Search, ShieldCheck, Globe] as const;
const SCENE_MS = 4600;

export function DomainVideoSection({
  heading,
  description,
  eyebrow,
  scenes,
  ctaLabel,
  ctaHref = routes.getStarted,
}: {
  heading: string;
  description: string;
  eyebrow: string;
  scenes: VideoScene[];
  ctaLabel: string;
  ctaHref?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(query.matches);
    const onChange = () => setReduceMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const animating = inView && !paused && !reduceMotion && scenes.length > 1;

  useEffect(() => {
    if (!animating) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % scenes.length);
    }, SCENE_MS);
    return () => window.clearInterval(timer);
  }, [animating, scenes.length]);

  const scene = scenes[index] ?? scenes[0];
  const typed = useTyped(scene?.prompt ?? "", animating, reduceMotion, true);

  if (!scene) return null;

  return (
    <section className="hb-band-purple relative overflow-hidden py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,255,255,0.18),transparent_55%)]"
      />
      <div className="hb-shell relative z-10">
        <div
          ref={ref}
          className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10"
        >
          <div>
            <p className="text-[11px] font-bold tracking-[0.28em] text-white uppercase">
              {eyebrow}
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.9rem)] leading-[1.1] font-extrabold tracking-[-0.045em] text-white">
              {heading}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/90 sm:text-[16px]">
              {description}
            </p>

            <ol className="mt-6 space-y-2">
              {scenes.map((item, itemIndex) => {
                const Icon = SCENE_ICONS[itemIndex % SCENE_ICONS.length];
                const active = itemIndex === index;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(itemIndex)}
                      aria-current={active}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors duration-300",
                        active
                          ? "border-white bg-white shadow-[0_18px_36px_-22px_rgba(15,10,40,0.8)]"
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
              href={ctaHref}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#2f1c6a] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)]"
            >
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <figure className="relative m-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/45 bg-[#12082a] shadow-[0_38px_90px_-38px_rgba(15,10,40,0.9)] sm:rounded-[32px]">
              {scenes.map((item, itemIndex) => (
                <Image
                  key={item.id}
                  src={item.image}
                  alt={`${item.label} step of the HostingBeyond domain flow`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  loading={itemIndex === 0 ? "eager" : "lazy"}
                  className={cn(
                    "object-cover transition-opacity duration-[900ms] ease-in-out",
                    itemIndex === index ? "opacity-100" : "opacity-0",
                    animating ? "hb-video" : "scale-[1.03]",
                  )}
                />
              ))}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#12082a]/80 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-2 sm:top-4 sm:left-4">
                <button
                  type="button"
                  onClick={() => setPaused((value) => !value)}
                  aria-label={paused ? "Play preview" : "Pause preview"}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40"
                >
                  {paused ? (
                    <Play className="size-4 fill-current" />
                  ) : (
                    <Pause className="size-4" />
                  )}
                </button>
                <span className="rounded-full border border-white/50 bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  {index + 1} / {scenes.length} · {scene.label}
                </span>
              </div>

              <div className="absolute inset-x-3 top-14 space-y-2 sm:inset-x-5 sm:top-16">
                {scene.chips.map((chip) => (
                  <p
                    key={`${scene.id}-${chip}`}
                    className="hb-chip-in inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11.5px] font-bold text-[#2f1c6a] shadow-[0_10px_24px_-12px_rgba(15,10,40,0.7)] sm:text-[12.5px]"
                  >
                    <Check
                      className="size-3.5 text-[#15803d]"
                      strokeWidth={3}
                    />
                    <span className="truncate">{chip}</span>
                  </p>
                ))}
              </div>

              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white px-3 py-2 shadow-[0_18px_40px_-18px_rgba(15,10,40,0.8)] sm:px-4 sm:py-2.5">
                  <Search className="size-4 shrink-0 text-[#673de6]" />
                  <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-[#2f1c6a] sm:text-[14.5px]">
                    {typed}
                    <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
                  </p>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-white">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {scenes.map((item, itemIndex) => (
                    <span
                      key={`bar-${item.id}`}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
                    >
                      {itemIndex === index ? (
                        <span
                          key={`fill-${item.id}-${animating}`}
                          className={cn(
                            "block h-full rounded-full bg-white",
                            animating ? "hb-progress" : "w-full",
                          )}
                          style={
                            animating
                              ? { animationDuration: `${SCENE_MS}ms` }
                              : undefined
                          }
                        />
                      ) : (
                        <span
                          className={cn(
                            "block h-full rounded-full bg-white/70",
                            itemIndex < index ? "w-full" : "w-0",
                          )}
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <figcaption className="mt-3 text-[12.5px] text-white/80">
              {scene.caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
