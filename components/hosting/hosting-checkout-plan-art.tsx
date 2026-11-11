/** Decorative rack + cloud — no photos, scales with the plan card. */
export function HostingCheckoutPlanArt({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 168"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="hb-rack-body" x1="40" y1="20" x2="180" y2="150">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="hb-rack-glow" x1="70" y1="0" x2="180" y2="80">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="hb-cloud-fill" x1="120" y1="90" x2="210" y2="160">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#ddd6fe" />
        </linearGradient>
      </defs>
      <ellipse
        cx="118"
        cy="148"
        rx="62"
        ry="10"
        fill="#5b21b6"
        opacity="0.12"
      />
      <rect
        x="58"
        y="18"
        width="92"
        height="118"
        rx="16"
        fill="url(#hb-rack-body)"
      />
      <rect
        x="66"
        y="28"
        width="76"
        height="22"
        rx="6"
        fill="#1e1b4b"
        opacity="0.55"
      />
      <rect
        x="66"
        y="56"
        width="76"
        height="22"
        rx="6"
        fill="#1e1b4b"
        opacity="0.55"
      />
      <rect
        x="66"
        y="84"
        width="76"
        height="22"
        rx="6"
        fill="#1e1b4b"
        opacity="0.55"
      />
      <rect x="72" y="34" width="36" height="10" rx="3" fill="#a78bfa" />
      <rect x="72" y="62" width="42" height="10" rx="3" fill="#818cf8" />
      <rect x="72" y="90" width="30" height="10" rx="3" fill="#67e8f9" />
      <circle cx="128" cy="39" r="3" fill="#4ade80" />
      <circle cx="128" cy="67" r="3" fill="#22d3ee" />
      <circle cx="128" cy="95" r="3" fill="#c084fc" />
      <path
        d="M70 8c18-14 52-10 68 8 8-4 22 2 22 16H62c0-12 4-20 8-24Z"
        fill="url(#hb-rack-glow)"
        opacity="0.55"
      />
      <g transform="translate(118 86)">
        <ellipse cx="42" cy="48" rx="36" ry="22" fill="url(#hb-cloud-fill)" />
        <circle cx="22" cy="38" r="16" fill="#f8fafc" />
        <circle cx="48" cy="32" r="20" fill="#eef2ff" />
        <circle cx="64" cy="42" r="14" fill="#f5f3ff" />
        <rect
          x="30"
          y="28"
          width="26"
          height="26"
          rx="8"
          fill="url(#hb-rack-body)"
        />
        <path
          d="M43 36v12"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M37 42l6-6 6 6"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
