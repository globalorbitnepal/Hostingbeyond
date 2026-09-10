"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Cloud,
  Globe2,
  Lock,
  Shield,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import type {
  CmsHostingTypeCard,
  CmsHostingTypesContent,
} from "@/lib/orbit/defaults";

type Accent = "blue" | "purple";

const accentMap = {
  blue: {
    border:
      "border-[#3b82f6]/45 shadow-[0_0_0_1px_rgba(59,130,246,0.14),0_0_42px_rgba(59,130,246,0.12)] hover:border-[#60a5fa]/70",
    icon: "border-[#3b82f6]/55 bg-[#3b82f6]/15 text-white shadow-[0_0_22px_rgba(59,130,246,0.35)]",
    cta: "text-[#60a5fa]",
    flare: "via-[#60a5fa]/85",
  },
  purple: {
    border:
      "border-[#a855f7]/45 shadow-[0_0_0_1px_rgba(168,85,247,0.14),0_0_42px_rgba(168,85,247,0.12)] hover:border-[#c084fc]/70",
    icon: "border-[#a855f7]/55 bg-[#a855f7]/15 text-white shadow-[0_0_22px_rgba(168,85,247,0.35)]",
    cta: "text-[#c084fc]",
    flare: "via-[#c084fc]/85",
  },
} as const;

/** Official WordPress logo (circle + W) */
function WordPressMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 122.52 122.523"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298l-25.069-68.686c-2.916 6.536-4.55 13.769-4.55 21.388z" />
      <path d="M96.97 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.675.044-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.384.043 2.683.074 3.788.074 6.163 0 15.685-.748 15.685-.748 3.174-.187 3.55 4.475.376 4.86 0 0-3.188.376-6.737.55l21.423 63.69 12.865-38.608-9.158-25.081c-3.175-.175-6.174-.55-6.174-.55-3.174-.187-2.797-5.049.375-4.86 0 0 9.703.748 15.486.748 6.162 0 15.685-.748 15.685-.748 3.176-.187 3.55 4.475.377 4.86 0 0-3.202.376-6.737.55l21.272 63.244 5.879-19.64c2.548-8.164 4.334-14.034 4.334-19.088z" />
      <path d="M62.184 65.508l-17.647 51.266c5.264 1.55 10.837 2.403 16.59 2.403 6.865 0 13.439-1.18 19.551-3.316.145-.104.274-.229.394-.364z" />
      <path d="M107.376 36.046c.226 1.674.354 3.471.354 5.404 0 5.333-.996 11.328-3.996 18.824l-16.028 46.328c15.563-9.08 26.039-26.003 26.039-45.345.002-9.137-2.333-17.729-6.369-25.211z" />
      <path d="M61.262 0C27.465 0 0 27.461 0 61.26c0 33.802 27.465 61.262 61.262 61.262 33.798 0 61.26-27.46 61.26-61.262C122.523 27.461 95.06 0 61.262 0zm0 119.715c-32.256 0-58.452-26.201-58.452-58.455 0-32.252 26.196-58.45 58.452-58.45 32.248 0 58.452 26.198 58.452 58.45 0 32.254-26.204 58.455-58.452 58.455z" />
    </svg>
  );
}

function CardIcon({
  type,
  className,
}: {
  type: CmsHostingTypeCard["icon"];
  className?: string;
}) {
  if (type === "cloud")
    return <Cloud className={className} strokeWidth={1.8} />;
  if (type === "cart")
    return <ShoppingCart className={className} strokeWidth={1.8} />;
  if (type === "wordpress") return <WordPressMark className={className} />;
  return <UserRound className={className} strokeWidth={1.8} />;
}

function CardImageVisual({ card }: { card: CmsHostingTypeCard }) {
  const isBlue = card.accent === "blue";
  const soft = isBlue
    ? "border-[#3b82f6]/40 bg-[#0b1730]/85 text-[#93c5fd]"
    : "border-[#a855f7]/40 bg-[#160b28]/85 text-[#d8b4fe]";

  return (
    <div className="relative mt-5 h-[148px] overflow-hidden rounded-2xl border border-white/10 bg-black/30 sm:h-[156px]">
      {card.imageUrl ? (
        <Image
          src={card.imageUrl}
          alt={card.imageAlt || card.title}
          fill
          unoptimized={isRuntimeMediaSrc(card.imageUrl)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#07122a]/55 via-transparent to-[#07122a]/20"
      />

      {card.overlayStyle === "cloud" ? (
        <div className="absolute inset-0 flex flex-col justify-end gap-2 p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold backdrop-blur-md",
                soft,
              )}
            >
              <Globe2 className="size-3" aria-hidden />
              {card.overlayCaption || "www"}
            </span>
            <span
              className={cn(
                "rounded-xl border px-2.5 py-1.5 text-[11px] font-extrabold text-white backdrop-blur-md",
                soft,
              )}
            >
              {card.overlayStat || "↑ 85.2%"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(card.overlayPills.length
              ? card.overlayPills
              : ["UPTIME", "RELIABILITY", "SECURITY"]
            ).map((label, i) => {
              const Icon = i === 0 ? Zap : i === 1 ? Shield : Lock;
              return (
                <span
                  key={`${label}-${i}`}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-extrabold tracking-wide uppercase backdrop-blur-md",
                    soft,
                  )}
                >
                  <Icon className="size-2.5" aria-hidden />
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {card.overlayStyle === "shop" ? (
        <>
          <span className="absolute top-2.5 right-2.5 inline-flex size-8 items-center justify-center rounded-xl border border-[#a855f7]/50 bg-[#160b28]/80 text-[#d8b4fe] shadow-[0_0_16px_rgba(168,85,247,0.35)] backdrop-blur-md">
            <ShoppingBag className="size-3.5" aria-hidden />
            <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-[#a855f7] text-[8px] font-extrabold text-white">
              1
            </span>
          </span>
          <span className="absolute right-2.5 bottom-2.5 rounded-lg border border-white/15 bg-black/55 px-2.5 py-1 text-[12px] font-extrabold text-white backdrop-blur-md">
            {card.overlayStat || "109.00"}
          </span>
        </>
      ) : null}

      {card.overlayStyle === "gallery" ? (
        <div className="absolute top-2 right-2 bottom-2 flex w-9 flex-col items-center gap-1.5 rounded-xl border border-white/15 bg-[#0b1730]/75 p-1.5 backdrop-blur-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="size-5 rounded-md border border-[#3b82f6]/35 bg-[#3b82f6]/20"
            />
          ))}
          <span className="mt-auto grid size-6 place-items-center rounded-full bg-white text-[#21759b]">
            <WordPressMark className="size-3.5" />
          </span>
        </div>
      ) : null}

      {card.overlayStyle === "studio" ? (
        <div className="absolute inset-0 flex flex-col justify-between p-2.5">
          <p className="text-[11px] font-extrabold tracking-wide text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
            {card.overlayCaption || "Sage. Botanical Studio"}
          </p>
          <div className="flex gap-1.5 self-end">
            {(card.overlayPills.length
              ? card.overlayPills
              : ["Aa", "Aa", "Aa"]
            ).map((label, i) => (
              <span
                key={`${label}-${i}`}
                className={cn(
                  "rounded-full border px-2 py-1 text-[10px] font-extrabold backdrop-blur-md",
                  i === 0 && "border-white/20 bg-white/15 text-white",
                  i === 1 && "border-white/10 bg-black/55 text-white",
                  i >= 2 && soft,
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HostingTypesSection({
  content,
}: {
  content?: CmsHostingTypesContent;
}) {
  const reduceMotion = useReducedMotion();
  const cards = (content?.cards ?? [])
    .filter((card) => card.visible !== false)
    .sort((a, b) => a.order - b.order);

  if (content?.visible === false || cards.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden bg-[#07122a] px-4 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-5 lg:px-8 lg:pt-6 lg:pb-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-40 w-[60%] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(59,130,246,0.12),transparent_70%)] blur-2xl" />
        <div className="absolute right-[8%] bottom-0 h-32 w-[40%] bg-[radial-gradient(ellipse,rgba(168,85,247,0.1),transparent_70%)] blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {cards.map((card, index) => {
            const styles = accentMap[card.accent as Accent] ?? accentMap.blue;
            return (
              <motion.article
                key={card.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  delay: 0.04 + index * 0.06,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-[22px] border bg-[rgba(10,18,38,0.48)] p-5 backdrop-blur-2xl transition-[border-color,box-shadow,transform] duration-200",
                  styles.border,
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
                    styles.flare,
                  )}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-8 -right-6 size-24 rounded-full bg-white/10 blur-2xl"
                />

                <span
                  className={cn(
                    "inline-flex size-12 items-center justify-center rounded-full border",
                    styles.icon,
                  )}
                >
                  <CardIcon
                    type={card.icon}
                    className={
                      card.icon === "wordpress" ? "size-[22px]" : "size-5"
                    }
                  />
                </span>

                <h3 className="mt-4 text-[18px] font-extrabold tracking-tight text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/65">
                  {card.description}
                </p>

                <Link
                  href={card.href}
                  className={cn(
                    "mt-4 inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.08em] uppercase transition hover:brightness-110",
                    styles.cta,
                  )}
                >
                  {card.ctaLabel || "View Plans"}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>

                <div className="mt-auto">
                  <CardImageVisual card={card} />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
