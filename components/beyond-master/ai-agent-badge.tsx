"use client";

import { useId } from "react";

import { BEYOND_MASTER_BRAND_NAME } from "@/lib/beyond-master/copy";
import { BeyondMasterIcon } from "./beyond-master-icon";

function HbMonogram({ gid }: { gid: string }) {
  return (
    <svg
      className="hb-ai-badge-hb"
      viewBox="0 0 88 88"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gid}-b`} x1="0.15" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="42%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`${gid}-stem`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="32%" stopColor="#c084fc" />
          <stop offset="68%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`${gid}-ribbon`} x1="0" y1="0.2" x2="1" y2="0.85">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="48%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id={`${gid}-shine`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gid}-b)`}
        fillRule="evenodd"
        d="M38.5 8.2c19.4-2.2 38.2 6.4 38.2 22.8 0 9.8-7.8 16.4-19.6 18.8 14 2.4 24.4 11.4 24.4 24.2 0 16.8-20 24.6-41.8 20.6L34.2 10.6c1.2-1.6 2.8-2.4 4.3-2.4Zm10.6 11.2c10.2.2 15.2 5.8 15.2 12.2 0 6.8-5.6 11.6-15.4 11.6H41.2l-.2-23.8h8.1Zm-1.4 35.4c13.8.6 21.2 8.6 21.2 17.6 0 9.8-8.8 15.6-21.6 13.8l-7.6-1.4.5-29.6 7.5-.4Z"
      />
      <path
        fill={`url(#${gid}-stem)`}
        d="M7.8 16.4C7.2 9.2 12 5.4 19.6 4.6L32.2 3.4l6.4 74.2c.4 5-3.2 8.6-9.6 9.2L13.4 88.4C7.2 89 4.6 84.4 5.4 77.8Z"
      />
      <path
        fill={`url(#${gid}-shine)`}
        d="M20.4 7.6 26.8 76.2c.4 2.2-.8 3.4-2.8 3.6l-2.2.2L15.8 10.2c1.4-1 3-2 4.6-2.6Z"
      />
      <path
        fill={`url(#${gid}-ribbon)`}
        d="M8.6 49.2c15.2-16.8 33.8-21.2 56.2-8.4 2.6 1.4 2.8 4 .2 5.6-15.2 10.2-30.4 14.4-47.4 14.8-3.4.1-5.2-2.6-3.2-6.2 2.8-4.8 3.4-6.4-5.8-5.8Z"
      />
    </svg>
  );
}

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
        <HbMonogram gid={gid} />
        <span className="hb-ai-badge-rule" />
        <span className="hb-ai-badge-copy">
          <span className="hb-ai-badge-ai">AI</span>
          <span className="hb-ai-badge-agent">Agent</span>
        </span>
        <span className="hb-ai-badge-orb" aria-hidden="true">
          <BeyondMasterIcon size={13} />
        </span>
      </span>
      <span className="sr-only">{BEYOND_MASTER_BRAND_NAME}</span>
    </span>
  );
}
