"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutList, Send } from "lucide-react";

import { BeyondMasterVoiceButton } from "@/components/beyond-master/voice-bar";
import { HOSTINGBEYOND_AI_ROBOT_SRC } from "@/components/shared/ai-robot";
import { routes } from "@/config/routes";
import {
  openBeyondMasterAi,
  sendBeyondMasterMessage,
  setBeyondMasterDraft,
} from "@/lib/beyond-master/ui-store";

const CHIPS = [
  { label: "Set DNS", prompt: "Help me set DNS on my domain." },
  { label: "Check SSL", prompt: "Check SSL on my domains and hosting." },
  { label: "Open a ticket", prompt: "I need to open a support ticket." },
] as const;

export function DashboardAgentSearch() {
  const [value, setValue] = useState("");

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      openBeyondMasterAi();
      return;
    }
    setBeyondMasterDraft(trimmed);
    openBeyondMasterAi();
    setValue("");
    await sendBeyondMasterMessage(trimmed);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await ask(value);
  }

  return (
    <section className="hb-dash-agent">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hb-dash-agent__robot">
            <Image
              src={HOSTINGBEYOND_AI_ROBOT_SRC}
              alt=""
              width={52}
              height={52}
              className="size-full object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="hb-eyebrow">AI Agent</p>
            <h3 className="hb-h2 mt-0.5">Ask anything about this account</h3>
            <p className="hb-muted mt-0.5 text-sm">
              DNS, WordPress, hosting, SSL, and tickets — live on your panel.
            </p>
          </div>
        </div>
        <Link
          href={routes.accountAiAgent}
          className="hb-btn hb-btn-ghost hb-btn-sm"
        >
          Full workspace
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <form className="hb-dash-agent__form" onSubmit={onSubmit}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask the AI Agent…"
          aria-label="Ask the AI Agent"
        />
        <BeyondMasterVoiceButton
          forceVisible
          className="hb-ds-ask-mic"
          onBeforeStart={() => openBeyondMasterAi()}
        />
        <button type="submit" className="hb-dash-agent__send" aria-label="Send">
          <Send className="size-4" />
        </button>
        <button
          type="button"
          className="hb-dash-agent__hist"
          aria-label="Open conversation history"
          onClick={() => openBeyondMasterAi("history")}
        >
          <LayoutList className="size-4" />
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className="hb-dash-agent__chip"
            onClick={() => void ask(chip.prompt)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  );
}
