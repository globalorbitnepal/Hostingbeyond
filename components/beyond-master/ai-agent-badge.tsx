"use client";

import Image from "next/image";

import { CANONICAL_HEADER_LOGO_SRC } from "@/components/shared/logo";
import { BEYOND_MASTER_BRAND_NAME } from "@/lib/beyond-master/copy";
import { BeyondMasterIcon } from "./beyond-master-icon";

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
        <span className="hb-ai-badge-copy">
          <span className="hb-ai-badge-ai">AI</span>
          <span className="hb-ai-badge-agent">Agent</span>
        </span>
        <span className="hb-ai-badge-orb" aria-hidden="true">
          <BeyondMasterIcon size={14} />
        </span>
      </span>
      <span className="sr-only">{BEYOND_MASTER_BRAND_NAME}</span>
    </span>
  );
}
