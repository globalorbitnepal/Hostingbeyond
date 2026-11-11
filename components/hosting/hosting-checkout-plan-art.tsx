"use client";

import { useId } from "react";

/**
 * Generated 3D hosting machine + cloud (SVG only, no photos).
 * Isometric rack, cyan LED bays, fluffy cloud, upload tile, glow pedestal.
 */
export function HostingCheckoutPlanArt({ className }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const halo = `${uid}-halo`;
  const front = `${uid}-front`;
  const side = `${uid}-side`;
  const top = `${uid}-top`;
  const bay = `${uid}-bay`;
  const cyan = `${uid}-cyan`;
  const mag = `${uid}-mag`;
  const cloud = `${uid}-cloud`;
  const tile = `${uid}-tile`;
  const glow = `${uid}-glow`;
  const soft = `${uid}-soft`;

  return (
    <svg
      className={className}
      viewBox="0 0 320 260"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={soft} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <radialGradient id={halo} cx="40%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#ddd6fe" stopOpacity="1" />
          <stop offset="38%" stopColor="#c4b5fd" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={front} x1="52" y1="52" x2="160" y2="210">
          <stop offset="0%" stopColor="#d8c8ff" />
          <stop offset="28%" stopColor="#a78bfa" />
          <stop offset="62%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id={side} x1="160" y1="36" x2="206" y2="206">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#1e0b4b" />
        </linearGradient>
        <linearGradient id={top} x1="70" y1="24" x2="200" y2="58">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="45%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={bay} x1="72" y1="0" x2="148" y2="0">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id={cyan} x1="80" y1="0" x2="140" y2="0">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={mag} x1="80" y1="0" x2="120" y2="0">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id={cloud} x1="170" y1="90" x2="300" y2="190">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f8f5ff" />
          <stop offset="100%" stopColor="#ddd6fe" />
        </linearGradient>
        <linearGradient id={tile} x1="214" y1="108" x2="270" y2="164">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      <ellipse cx="138" cy="122" rx="128" ry="108" fill={`url(#${halo})`} />

      {/* glow pedestal */}
      <ellipse
        cx="128"
        cy="228"
        rx="96"
        ry="18"
        fill="#a78bfa"
        opacity="0.22"
      />
      <ellipse cx="128" cy="222" rx="78" ry="15" fill="#c4b5fd" opacity="0.4" />
      <ellipse
        cx="128"
        cy="218"
        rx="62"
        ry="12"
        fill="#7c3aed"
        opacity="0.55"
      />
      <ellipse cx="128" cy="216" rx="44" ry="8" fill="#fff" opacity="0.45" />

      {/* isometric right face */}
      <path d="M160 58 204 32v148l-44 26Z" fill={`url(#${side})`} />
      {/* isometric top */}
      <path d="M52 58 96 32h108L160 58Z" fill={`url(#${top})`} />
      {/* front chassis */}
      <rect
        x="52"
        y="58"
        width="108"
        height="148"
        rx="20"
        fill={`url(#${front})`}
      />
      <rect
        x="58"
        y="64"
        width="14"
        height="136"
        rx="7"
        fill="#fff"
        opacity="0.2"
      />
      <rect
        x="54"
        y="58"
        width="104"
        height="18"
        rx="20"
        fill="#fff"
        opacity="0.12"
      />

      {[
        { y: 78, bar: 52, fill: cyan, led: "#4ade80" },
        { y: 112, bar: 58, fill: cyan, led: "#22d3ee" },
        { y: 146, bar: 48, fill: cyan, led: "#67e8f9" },
        { y: 180, bar: 36, fill: mag, led: "#e879f9" },
      ].map((row) => (
        <g key={row.y}>
          <rect
            x="76"
            y={row.y}
            width="68"
            height="24"
            rx="9"
            fill={`url(#${bay})`}
          />
          <rect
            x="84"
            y={row.y + 8}
            width={row.bar}
            height="8"
            rx="4"
            fill={`url(#${row.fill})`}
          />
          <circle
            cx="132"
            cy={row.y + 12}
            r="7"
            fill={row.led}
            opacity="0.35"
            filter={`url(#${glow})`}
          />
          <circle cx="132" cy={row.y + 12} r="3.6" fill={row.led} />
        </g>
      ))}

      {/* side LEDs receding */}
      <g opacity="0.7">
        <rect x="172" y="78" width="18" height="8" rx="3" fill="#22d3ee" />
        <rect x="176" y="112" width="16" height="8" rx="3" fill="#22d3ee" />
        <rect x="180" y="146" width="14" height="8" rx="3" fill="#e879f9" />
      </g>

      {/* fluffy 3D cloud overlapping the rack */}
      <g filter={`url(#${soft})`}>
        <ellipse
          cx="236"
          cy="186"
          rx="42"
          ry="10"
          fill="#8b5cf6"
          opacity="0.22"
        />
        <circle cx="196" cy="148" r="26" fill={`url(#${cloud})`} />
        <circle cx="228" cy="128" r="34" fill={`url(#${cloud})`} />
        <circle cx="262" cy="146" r="24" fill={`url(#${cloud})`} />
        <circle cx="218" cy="162" r="28" fill="#ffffff" />
        <circle cx="250" cy="164" r="22" fill="#f5f3ff" />
        <ellipse cx="230" cy="168" rx="48" ry="18" fill="#ffffff" />
        <ellipse cx="218" cy="132" rx="16" ry="8" fill="#fff" opacity="0.7" />
      </g>

      {/* upload tile sitting on the cloud */}
      <g>
        <rect
          x="214"
          y="108"
          width="52"
          height="52"
          rx="16"
          fill={`url(#${tile})`}
        />
        <rect
          x="214"
          y="108"
          width="52"
          height="20"
          rx="16"
          fill="#fff"
          opacity="0.22"
        />
        <path
          d="M240 146V118"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="m229 130 11-12 11 12"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
