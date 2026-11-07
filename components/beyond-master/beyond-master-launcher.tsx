"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  BEYOND_MASTER_BRAND_NAME,
  BEYOND_MASTER_DOCK_PROMPT,
  BEYOND_MASTER_DOCK_PROMPTS,
} from "@/lib/beyond-master/copy";
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
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    const start = window.setTimeout(
      () => setLine(BEYOND_MASTER_DOCK_PROMPTS[0]),
      1200,
    );
    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    if (line === null) return;
    let index = 0;
    const tick = window.setInterval(() => {
      index = (index + 1) % BEYOND_MASTER_DOCK_PROMPTS.length;
      setLine(BEYOND_MASTER_DOCK_PROMPTS[index]);
    }, 3200);
    return () => window.clearInterval(tick);
  }, [line !== null]);

  const togglePanel = () => {
    if (open) closeBeyondMasterAi();
    else openBeyondMasterAi();
    onOpen?.();
  };

  const dock = (
    <button
      type="button"
      className="hb-bmai-launch"
      aria-expanded={open}
      aria-controls="beyond-master-ai-panel"
      aria-label={`${BEYOND_MASTER_BRAND_NAME}. ${BEYOND_MASTER_DOCK_PROMPT}`}
      data-open={open ? "true" : "false"}
      data-compact={compact ? "true" : "false"}
      data-menu={menu ? "true" : "false"}
      onClick={togglePanel}
    >
      {open ? null : (
        <span className="hb-bmai-dock-bubble">
          {line ? (
            <span key={line} className="hb-bmai-dock-hello">
              {line}
            </span>
          ) : (
            <span className="hb-bmai-dock-wait" aria-hidden="true">
              ---
            </span>
          )}
        </span>
      )}
      <span className="hb-bmai-agent" aria-hidden="true">
        <BeyondMasterIcon size={64} />
      </span>
    </button>
  );

  if (typeof document === "undefined") return dock;
  return createPortal(dock, document.body);
}
