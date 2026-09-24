import Image from "next/image";

import { cn } from "@/lib/utils";

const svgLogo: Record<string, string> = {
  chatgpt: "/images/ai-assistant/chatgpt.svg",
  openai: "/images/ai-assistant/chatgpt.svg",
  gemini: "/images/ai-assistant/gemini.svg",
  claude: "/images/ai-assistant/claude.svg",
};

type Variant = "row" | "inline";

export function AiModelBrandIcon({
  id,
  className,
  size = 32,
  variant = "row",
}: {
  id: string;
  className?: string;
  size?: number;
  variant?: Variant;
}) {
  if (id === "grok") {
    const dim = variant === "row" ? 44 : size;
    return (
      <div
        className={cn(
          variant === "row" &&
            "flex size-[72px] items-center justify-center rounded-full border border-[#e9e4ff] bg-white shadow-[0_8px_24px_-12px_rgba(47,28,106,0.2)] sm:size-[76px]",
          className,
        )}
      >
        <Image
          src="/images/ai-assistant/grok.png"
          alt=""
          width={dim}
          height={dim}
          className="object-contain"
          aria-hidden
          unoptimized
        />
      </div>
    );
  }

  if (id === "openrouter") {
    const dim = variant === "row" ? 36 : size;
    return (
      <div
        className={cn(
          variant === "row" &&
            "flex size-[72px] items-center justify-center overflow-hidden rounded-full bg-[#050505] shadow-[0_8px_24px_-10px_rgba(0,0,0,0.55)] ring-1 ring-[#1f2937] sm:size-[76px]",
          className,
        )}
      >
        <Image
          src="/images/ai-assistant/openrouter-icon.svg"
          alt=""
          width={dim}
          height={dim}
          className="object-contain"
          aria-hidden
        />
      </div>
    );
  }

  const src = svgLogo[id] ?? svgLogo.chatgpt;
  const dim = variant === "row" ? 40 : size;
  const inner = (
    <Image
      src={src}
      alt=""
      width={dim}
      height={dim}
      className="object-contain"
      aria-hidden
    />
  );

  if (variant === "row") {
    return (
      <div
        className={cn(
          "flex size-[72px] items-center justify-center rounded-full border border-[#e9e4ff] bg-white shadow-[0_8px_24px_-12px_rgba(47,28,106,0.2)] sm:size-[76px]",
          className,
        )}
      >
        {inner}
      </div>
    );
  }

  return <span className={className}>{inner}</span>;
}

export const pricingModelRow = [
  { id: "chatgpt", name: "ChatGPT", provider: "OpenAI" },
  { id: "gemini", name: "Gemini", provider: "Google" },
  { id: "claude", name: "Claude", provider: "Anthropic" },
  { id: "grok", name: "Grok", provider: "xAI" },
  { id: "openrouter", name: "OpenRouter", provider: "OpenRouter" },
] as const;
