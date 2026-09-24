/** Decorative SVGs aligned with Beyond AI pricing mockup */

export function CoinStack({
  variant = "blue",
  className,
}: {
  variant?: "blue" | "gold";
  className?: string;
}) {
  const top = variant === "gold" ? "#FCD34D" : "#93C5FD";
  const mid = variant === "gold" ? "#F59E0B" : "#60A5FA";
  const base = variant === "gold" ? "#D97706" : "#3B82F6";
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden fill="none">
      <ellipse cx="24" cy="30" rx="18" ry="6" fill={base} opacity="0.35" />
      <ellipse cx="24" cy="26" rx="16" ry="5.5" fill={mid} />
      <ellipse cx="24" cy="22" rx="14" ry="5" fill={top} />
      <ellipse cx="24" cy="18" rx="12" ry="4.5" fill={mid} opacity="0.9" />
      <ellipse cx="24" cy="14" rx="10" ry="4" fill={top} />
    </svg>
  );
}

export function PlanCornerCube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="cubeSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="cubeFace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <path
        d="M24 6L42 16v20L24 46 6 36V16L24 6z"
        fill="url(#cubeSide)"
        opacity="0.25"
      />
      <path d="M24 6 42 16 24 26 6 16 24 6z" fill="url(#cubeTop)" />
      <path d="M6 16v20l18 10V26L6 16z" fill="url(#cubeFace)" />
      <path d="M42 16v20L24 46V26l18-10z" fill="url(#cubeSide)" />
    </svg>
  );
}

export function PlanCornerCrown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="crownGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path
        fill="url(#crownGold)"
        d="M8 34h32l-2-14 8 6-6-18-8 10-6-10-6 10-8-10 6 18 8-6-2 14z"
      />
      <circle cx="14" cy="28" r="2" fill="#FEF3C7" />
      <circle cx="24" cy="26" r="2.2" fill="#FEF3C7" />
      <circle cx="34" cy="28" r="2" fill="#FEF3C7" />
    </svg>
  );
}

export function ModelLogoStack({ className }: { className?: string }) {
  const tiles = [
    { id: "chatgpt", rot: -8, x: 0 },
    { id: "gemini", rot: 4, x: 28 },
    { id: "claude", rot: -4, x: 56 },
    { id: "grok", rot: 10, x: 84 },
  ] as const;
  return (
    <div className={className}>
      <div className="relative h-[72px] w-[120px]">
        {tiles.map((t, i) => (
          <div
            key={t.id}
            className="absolute top-2 flex size-14 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-[0_12px_28px_-8px_rgba(47,28,106,0.35)] backdrop-blur-sm"
            style={{
              left: t.x,
              zIndex: i + 1,
              transform: `rotate(${t.rot}deg)`,
            }}
          >
            <img
              src={`/images/ai-assistant/${t.id === "chatgpt" ? "chatgpt" : t.id}.svg`}
              alt=""
              className="size-8 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OnDemandCoins({ className }: { className?: string }) {
  return (
    <div className={className}>
      <CoinStack variant="gold" className="h-14 w-[72px]" />
    </div>
  );
}
