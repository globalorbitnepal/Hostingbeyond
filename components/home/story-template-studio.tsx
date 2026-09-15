"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { HostingBeyondLogo } from "@/components/shared/hostingbeyond-logo";
import { useTyped } from "@/hooks/use-typed";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    name: "Nova Studio",
    tag: "Agency",
    src: "/images/home/beyond-ai/business.png",
  },
  {
    name: "Horizon Travel",
    tag: "Travel",
    src: "/images/home/beyond-ai/trek.png",
  },
  {
    name: "Azure Stay",
    tag: "Hotel",
    src: "/images/home/beyond-ai/hotel.png",
  },
  {
    name: "Bloom Shop",
    tag: "Store",
    src: "/images/home/solutions/ecommerce.png",
  },
  {
    name: "Peak Journal",
    tag: "Blog",
    src: "/images/home/solutions/wordpress.png",
  },
  {
    name: "Vertex Cloud",
    tag: "SaaS",
    src: "/images/home/solutions/cloud-hosting.png",
  },
] as const;

export function TemplateStudio({ playing = true }: { playing?: boolean }) {
  const reduce = useReducedMotion();
  const motionOn = playing && !reduce;
  const [active, setActive] = useState(0);
  const typed = useTyped("Designer-made templates", motionOn, reduce, true);

  useEffect(() => {
    if (!motionOn) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % TEMPLATES.length);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [motionOn]);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/50 bg-white/12 shadow-[0_32px_70px_-28px_rgba(15,10,40,0.45)] ring-1 ring-white/25 backdrop-blur-2xl">
      <div className="absolute inset-2 overflow-hidden rounded-[22px] border border-white/40 bg-[#f4f6fb] sm:inset-2.5">
        <div className="flex h-9 items-center gap-2 border-b border-slate-200 bg-white px-3">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <HostingBeyondLogo className="ml-2 h-5 w-[132px]" />
          <span className="ml-auto rounded-full bg-[#673de6] px-2.5 py-1 text-[10px] font-bold text-white">
            Publish
          </span>
        </div>

        <div className="grid h-[calc(100%-2.25rem)] grid-cols-[92px_minmax(0,1fr)] sm:grid-cols-[108px_minmax(0,1fr)]">
          <aside className="hidden bg-[#1b1238] p-2.5 text-white sm:block">
            <p className="rounded-lg bg-[#673de6] px-2 py-1.5 text-[10px] font-bold">
              Templates
            </p>
            {["AI Builder", "Pages", "Store", "Settings"].map((item) => (
              <p
                key={item}
                className="mt-1 px-2 py-1.5 text-[10px] font-semibold text-white/55"
              >
                {item}
              </p>
            ))}
          </aside>

          <div className="min-w-0 bg-[#eef1f8] p-2 sm:p-2.5">
            <p className="mb-2 text-[11px] font-extrabold text-slate-800">
              All templates
            </p>
            <div className="grid h-[calc(100%-1.5rem)] grid-cols-3 gap-1.5 sm:gap-2">
              {TEMPLATES.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    "relative overflow-hidden rounded-xl border text-left",
                    index === active
                      ? "border-[#673de6] ring-2 ring-[#673de6]/40"
                      : "border-white/80",
                  )}
                >
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    sizes="120px"
                    unoptimized
                    className={cn(
                      "object-cover",
                      motionOn && index === active && "hb-video-card",
                    )}
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#12082a]/80 to-transparent px-1.5 pt-4 pb-1">
                    <span className="block truncate text-[8px] font-bold text-white sm:text-[9px]">
                      {item.name}
                    </span>
                    <span className="text-[8px] text-white/70">{item.tag}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-4 sm:bottom-3.5">
        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-2 shadow-[0_16px_40px_rgba(47,28,106,0.2)] backdrop-blur-xl sm:px-4">
          <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#2f1c6a] sm:text-[13px]">
            {typed}
            <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
          </p>
          <span className="grid size-7 place-items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-sm font-bold text-white">
            →
          </span>
        </div>
      </div>
    </div>
  );
}
