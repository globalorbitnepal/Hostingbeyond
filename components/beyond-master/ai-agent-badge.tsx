"use client";

import { useId } from "react";
import Image from "next/image";

import { CANONICAL_HEADER_LOGO_SRC } from "@/components/shared/logo";
import { BEYOND_MASTER_BRAND_NAME } from "@/lib/beyond-master/copy";

export function AiAgentBadge({
  variant = "header",
}: {
  variant?: "header" | "panel" | "compact";
}) {
  const gid = useId().replace(/:/g, "");

  return (
    <span
      className={`hb-ai-badge hb-ai-badge-${variant} notranslate`}
      translate="no"
    >
      <span className="hb-ai-badge-inner">
        <span className="hb-ai-badge-gloss" aria-hidden="true" />
        <svg
          className="hb-ai-badge-wave"
          viewBox="0 0 480 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${gid}-wave`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e879f9" stopOpacity="0.35" />
              <stop offset="42%" stopColor="#38bdf8" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#${gid}-wave)`}
            d="M0 52C48 34 78 70 128 50C178 30 214 22 262 42C314 64 360 72 410 46C440 32 462 28 480 36V90H0Z"
          />
        </svg>
        <span className="hb-ai-badge-sheen" aria-hidden="true" />
        <span className="hb-ai-badge-hb" aria-hidden="true">
          <Image
            src={CANONICAL_HEADER_LOGO_SRC}
            alt=""
            width={981}
            height={182}
            unoptimized
          />
        </span>
        <span className="hb-ai-badge-rule" />
        <span className="hb-ai-badge-copy">{BEYOND_MASTER_BRAND_NAME}</span>
      </span>
    </span>
  );
}
