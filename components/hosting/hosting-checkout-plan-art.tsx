"use client";

import { useId } from "react";

/** Flat rack + cloud drawn to the checkout mock — vector only, no photos. */
export function HostingCheckoutPlanArt({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const body = `${uid}-body`;
  const bay = `${uid}-bay`;
  const glow = `${uid}-glow`;

  return (
    <svg
      className={className}
      viewBox="0 0 240 200"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={body} x1="70" y1="8" x2="150" y2="170">
          <stop offset="0%" stopColor="#9b6cff" />
          <stop offset="42%" stopColor="#7c4dff" />
          <stop offset="100%" stopColor="#5b35e8" />
        </linearGradient>
        <linearGradient id={bay} x1="70" y1="40" x2="160" y2="40">
          <stop offset="0%" stopColor="#4c2fd4" />
          <stop offset="100%" stopColor="#3b1fb8" />
        </linearGradient>
        <radialGradient id={glow} cx="28%" cy="18%" r="55%">
          <stop offset="0%" stopColor="#efe6ff" stopOpacity="1" />
          <stop offset="70%" stopColor="#d8c8ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d8c8ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="78" cy="52" rx="78" ry="58" fill={`url(#${glow})`} />

      <rect
        x="52"
        y="22"
        width="112"
        height="142"
        rx="30"
        fill={`url(#${body})`}
      />
      <rect
        x="58"
        y="28"
        width="100"
        height="54"
        rx="24"
        fill="#c4b5fd"
        opacity="0.22"
      />

      <g>
        <rect
          x="66"
          y="42"
          width="84"
          height="26"
          rx="13"
          fill={`url(#${bay})`}
        />
        <rect x="76" y="50" width="48" height="10" rx="5" fill="#c9b6ff" />
        <circle cx="136" cy="55" r="4" fill="#4ade80" />
      </g>
      <g>
        <rect
          x="66"
          y="78"
          width="84"
          height="26"
          rx="13"
          fill={`url(#${bay})`}
        />
        <rect x="76" y="86" width="52" height="10" rx="5" fill="#7dd3fc" />
        <circle cx="136" cy="91" r="4" fill="#22d3ee" />
      </g>
      <g>
        <rect
          x="66"
          y="114"
          width="84"
          height="26"
          rx="13"
          fill={`url(#${bay})`}
        />
        <rect x="76" y="122" width="40" height="10" rx="5" fill="#818cf8" />
        <circle cx="136" cy="127" r="4" fill="#e879f9" />
      </g>

      <g>
        <ellipse cx="176" cy="148" rx="42" ry="26" fill="#f4f1ff" />
        <circle cx="152" cy="140" r="20" fill="#ffffff" />
        <circle cx="178" cy="128" r="24" fill="#f8f6ff" />
        <circle cx="202" cy="142" r="18" fill="#efeaff" />
        <rect x="164" y="124" width="34" height="34" rx="10" fill="#6d3df0" />
        <path
          d="M181 135v14"
          stroke="#fff"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M174.5 142.5 181 135l6.5 7.5"
          stroke="#fff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
