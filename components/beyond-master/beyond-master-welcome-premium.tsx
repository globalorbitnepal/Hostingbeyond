"use client";

import Image from "next/image";
import { ArrowRight, Globe, Headphones, Layers } from "lucide-react";

import { HOSTINGBEYOND_AI_ROBOT_SRC } from "@/components/shared/ai-robot";

const PREMIUM_ACTIONS = [
  {
    id: "compare-plans",
    label: "Compare plans",
    prompt: "Show me your hosting plans and prices.",
    Icon: Layers,
  },
  {
    id: "find-domain",
    label: "Find a domain",
    prompt: "Help me find and register a domain.",
    Icon: Globe,
  },
  {
    id: "talk-expert",
    label: "Talk to an expert",
    prompt: "I need to talk to a human support agent about my account.",
    Icon: Headphones,
  },
] as const;

export function BeyondMasterWelcomePremium({
  disabled,
  onPrompt,
}: {
  disabled?: boolean;
  onPrompt: (prompt: string) => void;
}) {
  return (
    <div className="hb-bmai-welcome hb-bmai-welcome--premium">
      <div className="hb-bmai-premium-hero" aria-hidden>
        <span className="hb-bmai-premium-hero-glow" />
        <span className="hb-bmai-premium-hero-orbit" />
        <span className="hb-bmai-premium-mascot-wrap">
          <Image
            src={HOSTINGBEYOND_AI_ROBOT_SRC}
            alt=""
            width={200}
            height={200}
            className="hb-bmai-premium-mascot"
            priority
          />
        </span>
      </div>
      <h2 className="hb-bmai-premium-title">
        Hi, I&apos;m your{" "}
        <span className="hb-bmai-premium-brand">HostingBeyond</span> AI
        consultant.
      </h2>
      <p className="hb-bmai-premium-lead">
        I can help with domains, hosting, and business email.
      </p>
      <div className="hb-bmai-premium-actions" role="list">
        {PREMIUM_ACTIONS.map(({ id, label, prompt, Icon }) => (
          <button
            key={id}
            type="button"
            role="listitem"
            className="hb-bmai-premium-action"
            disabled={disabled}
            onClick={() => onPrompt(prompt)}
          >
            <span className="hb-bmai-premium-action-icon">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <span className="hb-bmai-premium-action-label">{label}</span>
            <ArrowRight
              className="hb-bmai-premium-action-arrow size-4"
              aria-hidden
            />
          </button>
        ))}
      </div>
    </div>
  );
}
