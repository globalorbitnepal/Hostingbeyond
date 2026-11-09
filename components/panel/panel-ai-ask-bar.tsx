"use client";

import { FormEvent, useState } from "react";
import { LayoutList, Mic, Send } from "lucide-react";

import { BEYOND_MASTER_INPUT_PLACEHOLDER } from "@/lib/beyond-master/copy";
import {
  openBeyondMasterAi,
  sendBeyondMasterMessage,
  setBeyondMasterDraft,
} from "@/lib/beyond-master/ui-store";

export function PanelAiAskBar() {
  const [value, setValue] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = value.trim();
    if (!text) {
      openBeyondMasterAi();
      return;
    }
    setBeyondMasterDraft(text);
    openBeyondMasterAi();
    setValue("");
    await sendBeyondMasterMessage(text);
  }

  return (
    <form className="hb-ds-ask" onSubmit={onSubmit}>
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-[11px] font-black text-white"
      >
        ✦
      </span>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={BEYOND_MASTER_INPUT_PLACEHOLDER}
        aria-label="Ask HostingBeyond AI"
      />
      <div className="hb-ds-ask-actions">
        <button type="button" aria-label="Voice input" disabled>
          <Mic className="h-4 w-4" />
        </button>
        <button type="submit" data-primary="true" aria-label="Send">
          <Send className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Open assistant"
          onClick={() => openBeyondMasterAi()}
        >
          <LayoutList className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
