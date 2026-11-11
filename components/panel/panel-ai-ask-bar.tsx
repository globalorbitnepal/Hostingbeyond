"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { LayoutList, Send } from "lucide-react";

import { BeyondMasterVoiceButton } from "@/components/beyond-master/voice-bar";
import { HOSTINGBEYOND_AI_ROBOT_SRC } from "@/components/shared/ai-robot";
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
      <button
        type="button"
        className="hb-ds-ask-robot"
        aria-label="Open HostingBeyond AI"
        onClick={() => openBeyondMasterAi()}
      >
        <Image
          src={HOSTINGBEYOND_AI_ROBOT_SRC}
          alt=""
          width={40}
          height={40}
          className="size-full object-cover"
        />
      </button>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={BEYOND_MASTER_INPUT_PLACEHOLDER}
        aria-label="Ask HostingBeyond AI"
      />
      <div className="hb-ds-ask-actions">
        <BeyondMasterVoiceButton
          forceVisible
          className="hb-ds-ask-mic"
          onBeforeStart={() => openBeyondMasterAi()}
        />
        <button type="submit" data-primary="true" aria-label="Send">
          <Send className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Open conversation history"
          onClick={() => openBeyondMasterAi("history")}
        >
          <LayoutList className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
