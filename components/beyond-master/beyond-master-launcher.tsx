"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";

import { BEYOND_MASTER_BRAND_NAME } from "@/lib/beyond-master/copy";
import {
  closeBeyondMasterAi,
  openBeyondMasterAi,
  useBeyondMasterAi,
} from "@/lib/beyond-master/ui-store";

import "@/styles/beyond-master.css";

const DOCK_PROMPTS = ["Hello", "Can I help you?"] as const;

function useDockTypewriter(active: boolean) {
  const reduceMotion = useReducedMotion();
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) {
      setText("");
      return;
    }

    const full = DOCK_PROMPTS[lineIndex];
    if (reduceMotion) {
      setText(full);
      const hold = window.setTimeout(() => {
        setLineIndex((i) => (i + 1) % DOCK_PROMPTS.length);
      }, 3200);
      return () => window.clearTimeout(hold);
    }

    setText("");
    let char = 0;
    const stepMs = full.length > 6 ? 48 : 72;
    const typeId = window.setInterval(() => {
      char += 1;
      setText(full.slice(0, char));
      if (char >= full.length) window.clearInterval(typeId);
    }, stepMs);

    const holdMs = full.length * stepMs + (lineIndex === 0 ? 1400 : 2600);

    const nextId = window.setTimeout(() => {
      setLineIndex((i) => (i + 1) % DOCK_PROMPTS.length);
    }, holdMs);

    return () => {
      window.clearInterval(typeId);
      window.clearTimeout(nextId);
    };
  }, [active, lineIndex, reduceMotion]);

  return { text, lineIndex };
}

/** Fixed bottom dock — mascot orb with a typewritten greeting bubble on the left. */
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
  const reduceMotion = useReducedMotion();
  const { text, lineIndex } = useDockTypewriter(!open);
  const currentLine = DOCK_PROMPTS[lineIndex];
  const showCaret =
    !reduceMotion && text.length > 0 && text.length < currentLine.length;

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
      aria-label={`${BEYOND_MASTER_BRAND_NAME}. ${DOCK_PROMPTS.join(". ")}. Ask about domains, hosting or email.`}
      data-open={open ? "true" : "false"}
      data-compact={compact ? "true" : "false"}
      data-menu={menu ? "true" : "false"}
      onClick={togglePanel}
    >
      {!open ? (
        <span className="hb-bmai-dock-bubble" aria-hidden>
          <span key={lineIndex} className="hb-bmai-dock-hello">
            {text}
            {showCaret ? (
              <span className="hb-bmai-dock-caret" aria-hidden>
                |
              </span>
            ) : null}
          </span>
        </span>
      ) : null}
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
