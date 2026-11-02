import { cn } from "@/lib/utils";

/**
 * Cover artwork used when an article has no uploaded image yet.
 *
 * A plain coloured block looks unfinished on a public blog, so this renders a
 * deterministic gradient plus a subtle grid and the category label. It is pure
 * CSS — the site is image-free by design for hosting pages, and article covers
 * should still look intentional.
 */

const PALETTES = [
  "from-[#4f46e5] via-[#6d28d9] to-[#312e81]",
  "from-[#0ea5e9] via-[#2563eb] to-[#1e1b4b]",
  "from-[#7c3aed] via-[#a855f7] to-[#4c1d95]",
  "from-[#0f766e] via-[#0891b2] to-[#1e293b]",
  "from-[#be123c] via-[#9333ea] to-[#312e81]",
];

function paletteFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return PALETTES[hash % PALETTES.length];
}

export function PostCoverFallback({
  category,
  title,
  size = "card",
  className,
}: {
  category: string | null;
  title: string;
  size?: "card" | "hero";
  className?: string;
}) {
  const gradient = paletteFor(category ?? title);
  const label = category ?? "Editorial";
  const initials = title
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br text-white",
        gradient,
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="absolute -top-16 -right-10 size-44 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-12 size-52 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col items-center gap-1.5 px-6 text-center">
        <span
          className={cn(
            "font-extrabold tracking-tight drop-shadow-sm",
            size === "hero" ? "text-4xl" : "text-3xl",
          )}
        >
          {initials || "HB"}
        </span>
        <span
          className={cn(
            "font-semibold tracking-[0.26em] text-white/85 uppercase",
            size === "hero" ? "text-[11px]" : "text-[10px]",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
