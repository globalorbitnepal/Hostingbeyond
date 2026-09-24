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
    { id: "chatgpt", src: "/images/ai-assistant/chatgpt.svg", rot: -8, x: 0 },
    { id: "gemini", src: "/images/ai-assistant/gemini.svg", rot: 4, x: 28 },
    { id: "claude", src: "/images/ai-assistant/claude.svg", rot: -4, x: 56 },
    { id: "grok", src: "/images/ai-assistant/grok.png", rot: 10, x: 84 },
  ] as const;
  return (
    <div className={className}>
      <div className="relative h-[72px] w-[120px]">
        {tiles.map((t, i) => (
          <div
            key={t.id}
            className="absolute top-2 flex size-14 items-center justify-center rounded-2xl border border-white/80 bg-white/95 shadow-[0_12px_28px_-8px_rgba(47,28,106,0.35)] backdrop-blur-sm"
            style={{
              left: t.x,
              zIndex: i + 1,
              transform: `rotate(${t.rot}deg)`,
            }}
          >
            <img src={t.src} alt="" className="size-8 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FreeDeployCloudIcon({
  className,
  dark,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <defs>
        <linearGradient id="fdCloud" x1="4" y1="20" x2="28" y2="8">
          <stop offset="0%" stopColor={dark ? "#6ee7b7" : "#34d399"} />
          <stop offset="100%" stopColor={dark ? "#2dd4bf" : "#10b981"} />
        </linearGradient>
      </defs>
      <path
        fill="url(#fdCloud)"
        d="M24 22.5H10.5a5.5 5.5 0 0 1-.35-11A7 7 0 0 1 23.5 9.5 5.5 5.5 0 0 1 24 22.5Z"
      />
      <path
        fill={dark ? "#ecfdf5" : "#ffffff"}
        fillOpacity={dark ? 0.35 : 0.55}
        d="M12 14.5a4 4 0 0 1 7.8-1.2 3.5 3.5 0 0 1 3.2 5.2H13a2.5 2.5 0 0 1-1-4Z"
      />
      <path
        stroke={dark ? "#a7f3d0" : "#059669"}
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M16 18v5M16 23l-2.5-2.5M16 23l2.5-2.5"
      />
    </svg>
  );
}

export function OnDemandCoins({ className }: { className?: string }) {
  return (
    <div className={className}>
      <CoinStack variant="gold" className="h-14 w-[72px]" />
    </div>
  );
}
