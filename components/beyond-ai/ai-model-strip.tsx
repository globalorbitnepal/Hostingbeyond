import { cn } from "@/lib/utils";
import { beyondAiModelShowcase } from "@/config/beyond-ai-plans";

export function AiModelStrip({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className,
      )}
    >
      <span
        className={cn(
          "text-[12px] font-bold tracking-wide uppercase sm:text-[13px]",
          tone === "dark" ? "text-white/55" : "text-[#64748b]",
        )}
      >
        Models you can use
      </span>
      {beyondAiModelShowcase.map((m) => (
        <span
          key={m.id}
          className={cn(
            "inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-xl border border-[#e9e4ff] bg-gradient-to-br px-3 text-[13px] font-extrabold shadow-sm",
            m.accent,
          )}
        >
          {m.label}
        </span>
      ))}
    </div>
  );
}
