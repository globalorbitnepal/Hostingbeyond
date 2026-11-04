"use client";

import Image from "next/image";

import { CANONICAL_HEADER_LOGO_SRC } from "@/components/shared/logo";
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
      <span className="hb-ai-badge-inner">
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
