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

/** Greeting first, then the help offer — never shown on top of each other. */
const DOCK_PROMPTS = ["Hi", "Can I help you?"] as const;

function useDockTypewriter(active: boolean) {
  const reduceMotion = useReducedMotion();
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");
  const [bubbleHidden, setBubbleHidden] = useState(false);

  useEffect(() => {
    if (!active) {
      setText("");
      setBubbleHidden(false);
      setLineIndex(0);
      return;
    }

    const full = DOCK_PROMPTS[lineIndex];
    if (reduceMotion) {
      setBubbleHidden(false);
      setText(full);
      const hold = window.setTimeout(
        () => {
          setBubbleHidden(true);
        },
        lineIndex === 0 ? 2200 : 3000,
      );
      const next = window.setTimeout(
        () => {
          setLineIndex((i) => (i + 1) % DOCK_PROMPTS.length);
        },
        lineIndex === 0 ? 2480 : 3280,
      );
      return () => {
        window.clearTimeout(hold);
        window.clearTimeout(next);
      };
    }

    setBubbleHidden(false);
    setText("");
    let char = 0;
    const stepMs = full.length > 6 ? 48 : 72;
    const typeId = window.setInterval(() => {
      char += 1;
      setText(full.slice(0, char));
      if (char >= full.length) window.clearInterval(typeId);
    }, stepMs);

    const typeMs = full.length * stepMs;
    const holdAfterTypeMs = lineIndex === 0 ? 1400 : 2200;
    const fadeMs = 260;

    const hideId = window.setTimeout(() => {
      setBubbleHidden(true);
      setText("");
    }, typeMs + holdAfterTypeMs);

    const nextId = window.setTimeout(
      () => {
        setLineIndex((i) => (i + 1) % DOCK_PROMPTS.length);
      },
      typeMs + holdAfterTypeMs + fadeMs,
    );

    return () => {
      window.clearInterval(typeId);
      window.clearTimeout(hideId);
      window.clearTimeout(nextId);
    };
  }, [active, lineIndex, reduceMotion]);

  return { text, lineIndex, bubbleHidden };
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
  const { text, lineIndex, bubbleHidden } = useDockTypewriter(!open);
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
      {!open && !bubbleHidden ? (
        <span
          key={lineIndex}
          className="hb-bmai-dock-bubble"
          data-line={lineIndex === 0 ? "hi" : "help"}
          aria-hidden
        >
          <span className="hb-bmai-dock-hello">
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
