"use client";

import Image from "next/image";
import { createPortal } from "react-dom";

import {
  BEYOND_MASTER_BRAND_NAME,
  BEYOND_MASTER_DOCK_PROMPT,
} from "@/lib/beyond-master/copy";
import {
  closeBeyondMasterAi,
  openBeyondMasterAi,
  useBeyondMasterAi,
} from "@/lib/beyond-master/ui-store";

import "@/styles/beyond-master.css";

export function BeyondMasterAiLauncher({
  compact = false,
  menu = false,
  onOpen,
}: {
  compact?: boolean;
  menu?: boolean;
  onOpen?: () => void;
}) {
  const { open } = useBeyondMasterAi();

  const togglePanel = () => {
    if (open) closeBeyondMasterAi();
    else openBeyondMasterAi();
    onOpen?.();
  };

  const dock = (
    <button
      type="button"
      className="hb-bmai-launch hb-bmai-launch--mascot"
      aria-expanded={open}
      aria-controls="beyond-master-ai-panel"
      aria-label={`${BEYOND_MASTER_BRAND_NAME}. ${BEYOND_MASTER_DOCK_PROMPT}`}
      data-open={open ? "true" : "false"}
      data-compact={compact ? "true" : "false"}
      data-menu={menu ? "true" : "false"}
      onClick={togglePanel}
    >
      <span className="hb-bmai-agent" aria-hidden="true">
        <span className="hb-bmai-agent-ring" />
        <Image
          src="/brand/hostingbeyond-ai-robot.png"
          alt=""
          width={88}
          height={88}
          className="hb-bmai-agent-mascot"
          priority
        />
      </span>
    </button>
  );

  if (typeof document === "undefined") return dock;
  return createPortal(dock, document.body);
}
