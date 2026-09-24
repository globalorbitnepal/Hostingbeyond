import Image from "next/image";

import { cn } from "@/lib/utils";

const logoSrc: Record<string, string> = {
  chatgpt: "/images/ai-assistant/chatgpt.svg",
  openai: "/images/ai-assistant/chatgpt.svg",
  gemini: "/images/ai-assistant/gemini.svg",
  claude: "/images/ai-assistant/claude.svg",
  grok: "/images/ai-assistant/grok.svg",
};

export function AiModelBrandIcon({
  id,
  className,
  size = 32,
}: {
  id: string;
  className?: string;
  size?: number;
}) {
  const src = logoSrc[id] ?? logoSrc.chatgpt;
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("object-contain", className)}
      aria-hidden
    />
  );
}

export const pricingModelRow = [
  { id: "chatgpt", name: "ChatGPT", provider: "OpenAI" },
  { id: "gemini", name: "Gemini", provider: "Google" },
  { id: "claude", name: "Claude", provider: "Anthropic" },
  { id: "grok", name: "Grok", provider: "xAI" },
] as const;
