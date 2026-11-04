"use client";

import { BEYOND_MASTER_BRAND_NAME } from "@/lib/beyond-master/copy";
import {
  closeBeyondMasterAi,
  openBeyondMasterAi,
  useBeyondMasterAi,
} from "@/lib/beyond-master/ui-store";

import "@/styles/beyond-master.css";
import { AiAgentBadge } from "./ai-agent-badge";

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

  return (
    <button
      type="button"
      className={
        menu
          ? "hb-bmai-launch hb-bmai-launch-menu"
          : compact
            ? "hb-bmai-launch hb-bmai-launch-compact"
            : "hb-bmai-launch hb-bmai-launch-wide"
      }
      aria-expanded={open}
      aria-controls="beyond-master-ai-panel"
      aria-label={BEYOND_MASTER_BRAND_NAME}
      data-open={open ? "true" : "false"}
      onClick={togglePanel}
    >
      <AiAgentBadge variant={compact ? "compact" : "header"} />
    </button>
  );
}
