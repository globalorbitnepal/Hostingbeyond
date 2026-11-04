"use client";

import { BEYOND_MASTER_BRAND_NAME } from "@/lib/beyond-master/copy";
import {
  closeBeyondMasterAi,
  openBeyondMasterAi,
  useBeyondMasterAi,
} from "@/lib/beyond-master/ui-store";

import "@/styles/beyond-master.css";
import { BeyondMasterIcon } from "./beyond-master-icon";

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

  if (menu) {
    return (
      <button
        type="button"
        className="hb-bmai-launch hb-bmai-launch-menu"
        aria-expanded={open}
        aria-controls="beyond-master-ai-panel"
        data-open={open ? "true" : "false"}
        onClick={togglePanel}
      >
        <span className="hb-bmai-launch-mark">
          <BeyondMasterIcon size={16} />
        </span>
        <span className="hb-bmai-launch-text notranslate" translate="no">
          {BEYOND_MASTER_BRAND_NAME}
        </span>
        <span className="hb-bmai-ai-chip notranslate" translate="no">
          AI
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={
        compact
          ? "hb-bmai-launch hb-bmai-launch-compact"
          : "hb-bmai-launch hb-bmai-launch-wide"
      }
      aria-expanded={open}
      aria-controls="beyond-master-ai-panel"
      aria-label={BEYOND_MASTER_BRAND_NAME}
      data-open={open ? "true" : "false"}
      onClick={togglePanel}
    >
      <span className="hb-bmai-launch-mark">
        <BeyondMasterIcon size={16} />
      </span>
      <span className="hb-bmai-launch-text notranslate" translate="no">
        {BEYOND_MASTER_BRAND_NAME}
      </span>
      <span className="hb-bmai-ai-chip notranslate" translate="no">
        AI
      </span>
    </button>
  );
}
