"use client";

import { BEYOND_MASTER_LAUNCHER_LABEL } from "@/lib/beyond-master/copy";
import {
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
  const openPanel = () => {
    openBeyondMasterAi();
    onOpen?.();
  };

  if (menu) {
    return (
      <button
        type="button"
        className="hb-bmai-launch hb-bmai-launch-menu"
        aria-expanded={open}
        aria-controls="beyond-master-ai-panel"
        onClick={openPanel}
      >
        <span className="hb-bmai-launch-mark">
          <BeyondMasterIcon size={14} />
        </span>
        <span className="notranslate" translate="no">
          {BEYOND_MASTER_LAUNCHER_LABEL}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={
        compact ? "hb-bmai-launch hb-bmai-launch-compact" : "hb-bmai-launch"
      }
      aria-expanded={open}
      aria-controls="beyond-master-ai-panel"
      aria-label={BEYOND_MASTER_LAUNCHER_LABEL}
      onClick={openPanel}
    >
      <span className="hb-bmai-launch-mark">
        <BeyondMasterIcon size={compact ? 13 : 14} />
      </span>
      <span className="notranslate" translate="no">
        {BEYOND_MASTER_LAUNCHER_LABEL}
      </span>
    </button>
  );
}
