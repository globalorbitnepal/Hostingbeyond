"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function DomainWhyPrivacyPanel({
  title,
  description,
  linkLabel,
  linkHref,
  className,
}: {
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-[#312e81]/20 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] p-5 text-white shadow-[0_24px_60px_-36px_rgba(30,27,75,0.65)] sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(129,140,248,0.25),transparent_55%)]"
      />
      <div className="relative flex gap-4">
        <span
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"
          aria-hidden
        >
          <ShieldCheck className="size-6 text-[#a5b4fc]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-extrabold tracking-tight sm:text-[18px]">
            {title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/85 sm:text-[14px]">
            {description}
          </p>
        </div>
      </div>
      <ul className="relative mt-5 space-y-2.5" aria-label="Privacy features">
        <li className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
          <span className="flex items-center gap-2 text-[12px] font-bold">
            <Lock className="size-4 text-[#c4b5fd]" aria-hidden />
            WHOIS privacy
          </span>
          <span className="rounded-full bg-[#673de6] px-2.5 py-0.5 text-[10px] font-extrabold">
            Eligible TLDs
          </span>
        </li>
        <li className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-[12px] font-bold">
          <ShieldCheck className="size-4 text-emerald-300" aria-hidden />
          SSL with HostingBeyond hosting
        </li>
        <li className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-[11px] leading-snug text-white/80">
          Contact details stay private on supported extensions. SSL is issued
          when you add our hosting — not bundled with every domain alone.
        </li>
      </ul>
      <Link
        href={linkHref}
        className="relative mt-5 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#c4b5fd] transition hover:text-white"
      >
        {linkLabel}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
