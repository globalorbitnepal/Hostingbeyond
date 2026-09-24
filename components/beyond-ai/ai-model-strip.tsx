import { beyondAiModelsConfig } from "@/config/beyond-ai-product";
import { cn } from "@/lib/utils";

export function AiModelStrip({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const featured = beyondAiModelsConfig.filter((m) => m.featured);
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
      {featured.map((m) => (
        <span
          key={m.id}
          className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-xl border border-[#e9e4ff] bg-gradient-to-br from-[#f4f0ff] to-white px-3 text-[13px] font-extrabold text-[#673de6]"
        >
          {m.shortLabel}
        </span>
      ))}
      <span className="inline-flex h-9 items-center rounded-xl border border-dashed border-[#c4b5fd] px-3 text-[13px] font-extrabold text-[#673de6]">
        + More models
      </span>
    </div>
  );
}
