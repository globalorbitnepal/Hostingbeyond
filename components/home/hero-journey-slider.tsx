"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: "build",
    label: "Build",
    title: "You direct. Beyond AI builds it live.",
    body: "Describe the site. Keep prompting until the page looks like your brand.",
    image: "/images/business-email/people/p-laptop.jpg",
    alt: "People building a site together",
    href: routes.beyondAi,
    overlay: "prompt",
  },
  {
    id: "launch",
    label: "Launch",
    title: "Go live on NVMe hosting the same day.",
    body: "SSL, backups, and a domain in one HostingBeyond account.",
    image: "/images/business-email/people/p-phone.jpg",
    alt: "Team reviewing a live site",
    href: routes.hosting,
    overlay: "launch",
  },
  {
    id: "grow",
    label: "Grow",
    title: "Mail and campaigns that keep customers coming back.",
    body: "Branded inboxes and AI drafts next to the same hosting stack.",
    image: "/images/business-email/people/p-team.jpg",
    alt: "Team growing a business online",
    href: routes.businessEmail,
    overlay: "grow",
  },
  {
    id: "manage",
    label: "Manage",
    title: "Your AI co-worker. In the panel, on every plan.",
    body: "Migrate, fix, and manage through chat — humans still on 24/7.",
    image: "/images/business-email/people/p-desk.jpg",
    alt: "Bright workspace for managing hosting",
    href: routes.beyondAi,
    overlay: "manage",
  },
] as const;

export function HeroJourneySlider() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const active = slides[index];

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <section className="relative z-20 bg-[#4c1d95] py-12 sm:py-16">
      <div className="hb-shell">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(slideIndex)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] font-bold transition",
                index === slideIndex
                  ? "bg-white text-slate-950"
                  : "bg-white/15 text-white/85 hover:bg-white/25",
              )}
            >
              {slide.label}
            </button>
          ))}
        </div>

        <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {slides.map((slide, slideIndex) => {
            const on = slideIndex === index;
            return (
              <motion.article
                key={slide.id}
                layout
                className={cn(
                  "relative overflow-hidden rounded-[24px] border border-white/15 bg-white/10 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)]",
                  on ? "ring-2 ring-white/70" : "opacity-90",
                )}
              >
                <div className="relative h-[210px] sm:h-[230px]">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className={cn(
                      "object-cover transition duration-700",
                      on ? "scale-100" : "scale-[1.04]",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b1233]/80 via-transparent to-transparent" />
                  {slide.overlay === "prompt" ? (
                    <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 shadow-lg">
                      <Sparkles className="size-4 text-[#673de6]" />
                      <span className="text-[12px] font-semibold text-slate-700">
                        Create a studio site…
                      </span>
                    </div>
                  ) : null}
                  {slide.overlay === "launch" ? (
                    <p className="absolute top-4 left-4 rounded-full bg-[#673de6] px-3 py-1 text-[11px] font-bold text-white">
                      Live in minutes
                    </p>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-6 max-w-2xl text-center text-white"
          >
            <h2 className="font-heading text-[clamp(1.35rem,2.6vw,1.85rem)] font-extrabold tracking-[-0.03em]">
              {active.title}
            </h2>
            <p className="mt-2 text-[15px] text-white/75">{active.body}</p>
            <Link
              href={active.href}
              className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-extrabold text-white"
            >
              {active.label === "Build" ? "Create with AI" : "Learn more"}
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
