"use client";

import Image from "next/image";
import { Globe2, MessageCircle, ShieldCheck } from "lucide-react";

import { DomainPremiumVideoLayer } from "@/components/domains/domain-premium-media";
import { isVideoMediaSrc } from "@/lib/domains/media";
import { isRuntimeMediaSrc } from "@/lib/orbit/media-url";
import { cn } from "@/lib/utils";

export type ShowcaseLayout =
  | "registrar"
  | "privacy"
  | "support"
  | "setup"
  | "what"
  | "transfer"
  | "hosting";

export function DomainShowcaseMedia({
  layout,
  image,
  video,
  badge,
  className,
}: {
  layout: ShowcaseLayout;
  image?: string;
  video?: string;
  badge?: string;
  className?: string;
}) {
  const videoSrc = isVideoMediaSrc(video) ? video!.trim() : "";
  const imageSrc = image?.trim() ?? "";

  if (videoSrc) {
    return (
      <div
        className={cn(
          "relative h-full min-h-[200px] w-full overflow-hidden",
          className,
        )}
      >
        <DomainPremiumVideoLayer src={videoSrc} playing />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
        />
      </div>
    );
  }

  if (imageSrc) {
    return (
      <div
        className={cn(
          "relative h-full min-h-[200px] w-full overflow-hidden",
          className,
        )}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          unoptimized={isRuntimeMediaSrc(imageSrc)}
          className="object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full min-h-[200px] w-full overflow-hidden",
        className,
      )}
    >
      {layout === "registrar" ? <RegistrarArt /> : null}
      {layout === "privacy" ? <PrivacyArt /> : null}
      {layout === "support" ? <SupportArt badge={badge} /> : null}
      {layout === "setup" ? <SetupArt /> : null}
      {layout === "what" ? <WhatDomainArt /> : null}
      {layout === "transfer" ? <TransferArt /> : null}
      {layout === "hosting" ? <HostingBundleArt /> : null}
    </div>
  );
}

function RegistrarArt() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#ede9fe] via-[#f5f3ff] to-[#dbeafe]">
      <div className="absolute inset-x-6 top-[22%] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_20px_50px_-28px_rgba(47,28,106,0.35)]">
        <div className="flex items-center gap-2 rounded-xl bg-[#f4f5ff] px-3 py-2.5 ring-1 ring-[#e0e7ff]">
          <Globe2 className="size-5 text-[#673de6]" />
          <span className="text-[13px] font-bold text-[#2f1c6a]">
            yourbrand.com
          </span>
          <span className="ml-auto rounded-lg bg-[#673de6] px-2 py-1 text-[10px] font-extrabold text-white">
            Search
          </span>
        </div>
        <p className="mt-3 text-[11px] font-semibold text-slate-500">
          300+ extensions · renewal shown upfront
        </p>
      </div>
    </div>
  );
}

function PrivacyArt() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_55%)]"
      />
      <div className="absolute inset-x-5 top-6 bottom-16 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(103,61,230,0.15),transparent)]" />
      </div>
      <div className="absolute right-6 bottom-8 w-[58%] space-y-2">
        <div className="rounded-xl border border-white/20 bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#2f1c6a]">
              WHOIS privacy
            </span>
            <span className="rounded-full bg-[#673de6] px-2 py-0.5 text-[10px] font-extrabold text-white">
              On
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span className="text-[11px] font-bold text-[#2f1c6a]">
              SSL · Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportArt({ badge }: { badge?: string }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#dbeafe] via-[#e0e7ff] to-[#f5f3ff]">
      <div className="absolute inset-x-0 top-[18%] bottom-0 bg-gradient-to-t from-[#c7d2fe]/40 to-transparent" />
      <div className="absolute top-5 left-5 max-w-[85%] rounded-2xl border border-white/80 bg-white p-3 shadow-lg">
        <div className="flex items-start gap-2">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#673de6] text-white">
            <MessageCircle className="size-4" />
          </span>
          <p className="text-[12px] leading-snug font-medium text-[#2f1c6a]">
            {badge ||
              "Hi — I need help pointing my domain to HostingBeyond hosting."}
          </p>
        </div>
      </div>
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 h-[55%] w-[70%] -translate-x-1/2 rounded-t-[40%] bg-gradient-to-t from-[#94a3b8] to-[#cbd5e1]"
      />
    </div>
  );
}

function SetupArt() {
  const steps = ["Buy", "Register", "Go online"];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f8f7ff] to-[#eef2ff] p-6">
      <div className="w-full max-w-[220px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md">
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-[11px] font-extrabold",
                  index < 2
                    ? "bg-[#673de6] text-white"
                    : "border-2 border-[#673de6] text-[#673de6]",
                )}
              >
                {index < 2 ? "✓" : index + 1}
              </span>
              <span className="text-[13px] font-bold text-[#2f1c6a]">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function WhatDomainArt() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1035] to-[#312e81] p-5">
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
        {[".com", ".shop", ".ai"].map((tld) => (
          <div
            key={tld}
            className="rounded-lg bg-white/10 px-3 py-2 text-[11px] font-bold text-white/80"
          >
            yourbrand{tld}
          </div>
        ))}
        <div className="rounded-lg bg-[#673de6] px-3 py-2 text-center text-[12px] font-extrabold text-white">
          yourbrand.online
        </div>
      </div>
    </div>
  );
}

function TransferArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95]">
      <div className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-[15px] font-extrabold text-white shadow-[0_0_0_12px_rgba(103,61,230,0.15)]">
        yourbrand.com ⇄ HostingBeyond
      </div>
    </div>
  );
}

function HostingBundleArt() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1035] to-[#2563eb]/40 p-4">
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-white/10 p-2 text-[10px] font-bold text-white">
          .com
        </div>
        <div className="rounded-xl bg-[#673de6] px-3 py-2 text-[12px] font-extrabold text-white">
          + hosting
        </div>
      </div>
      <p className="mt-4 text-[11px] text-white/75">Free SSL · One panel</p>
    </div>
  );
}
