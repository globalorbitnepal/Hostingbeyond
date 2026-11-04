"use client";

import Image from "next/image";

import { BEYOND_MASTER_BRAND_NAME } from "@/lib/beyond-master/copy";

export function AiAgentBadge({
  variant = "header",
}: {
  variant?: "header" | "panel" | "compact";
}) {
  return (
    <span
      className={`hb-ai-badge hb-ai-badge-${variant} notranslate`}
      translate="no"
    >
      <Image
        src="/brand/ai-agent-neon-badge.png"
        alt=""
        width={1146}
        height={391}
        unoptimized
      />
      <span className="hb-ai-badge-sheen" aria-hidden="true" />
      <span className="sr-only">{BEYOND_MASTER_BRAND_NAME}</span>
    </span>
  );
}
