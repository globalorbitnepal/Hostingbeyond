"use client";

import { useId } from "react";

/**
 * Isometric server rack on a glowing pedestal with a floating cloud badge.
 * Pure SVG (gradients only) so it stays sharp at every size and never needs an image.
 */
export function HostingCheckoutPlanArt({ className }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const front = `${uid}-front`;
  const top = `${uid}-top`;
  const side = `${uid}-side`;
  const bay = `${uid}-bay`;
  const halo = `${uid}-halo`;
  const pad = `${uid}-pad`;
  const cloud = `${uid}-cloud`;
  const badge = `${uid}-badge`;

  return (
    <svg
      className={className}
      viewBox="0 0 260 216"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id={halo} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b9a4ff" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#c9b8ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d9ccff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={front} x1="58" y1="52" x2="134" y2="172">
          <stop offset="0%" stopColor="#a888ff" />
          <stop offset="46%" stopColor="#8257f7" />
          <stop offset="100%" stopColor="#6435e6" />
        </linearGradient>
        <linearGradient id={top} x1="70" y1="30" x2="150" y2="60">
          <stop offset="0%" stopColor="#d9c9ff" />
          <stop offset="100%" stopColor="#b9a1ff" />
        </linearGradient>
        <linearGradient id={side} x1="134" y1="40" x2="164" y2="170">
          <stop offset="0%" stopColor="#7a4bf0" />
          <stop offset="100%" stopColor="#4a22b8" />
        </linearGradient>
        <linearGradient id={bay} x1="66" y1="60" x2="132" y2="70">
          <stop offset="0%" stopColor="#3f22b0" />
          <stop offset="100%" stopColor="#2c1487" />
        </linearGradient>
        <linearGradient id={pad} x1="34" y1="170" x2="164" y2="196">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={cloud} x1="150" y1="86" x2="246" y2="150">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f3efff" />
          <stop offset="100%" stopColor="#ddd3ff" />
        </linearGradient>
        <linearGradient id={badge} x1="176" y1="112" x2="216" y2="152">
          <stop offset="0%" stopColor="#6d8bff" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {/* ambient glow behind the rack */}
      <ellipse cx="102" cy="96" rx="92" ry="84" fill={`url(#${halo})`} />

      {/* pedestal */}
      <ellipse cx="100" cy="182" rx="76" ry="20" fill="#cbb9ff" opacity="0.3" />
      <ellipse cx="100" cy="178" rx="66" ry="17" fill="#d6c7ff" opacity="0.5" />
      <ellipse cx="100" cy="174" rx="56" ry="14" fill={`url(#${pad})`} />
      <ellipse
        cx="100"
        cy="172"
        rx="44"
        ry="10.5"
        fill="#ffffff"
        opacity="0.38"
      />
      <ellipse cx="100" cy="171" rx="26" ry="6" fill="#8b5cf6" opacity="0.45" />

      {/* side + top faces give the isometric depth */}
      <path
        d="M134 52 158 36v120l-24 16Z"
        fill={`url(#${side})`}
        stroke="#5b2ed6"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M58 52 82 36h76l-24 16Z"
        fill={`url(#${top})`}
        stroke="#c3aeff"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* front face */}
      <rect
        x="58"
        y="52"
        width="76"
        height="120"
        rx="15"
        fill={`url(#${front})`}
        stroke="#6c3ce8"
        strokeWidth="1"
      />
      <rect
        x="63"
        y="57"
        width="9"
        height="110"
        rx="4.5"
        fill="#ffffff"
        opacity="0.16"
      />

      {/* three server bays */}
      <g>
        <rect
          x="68"
          y="63"
          width="56"
          height="27"
          rx="10"
          fill={`url(#${bay})`}
        />
        <rect x="75" y="71" width="30" height="9" rx="4.5" fill="#c4b1ff" />
        <circle cx="114" cy="75" r="3.6" fill="#4ade80" />
      </g>
      <g>
        <rect
          x="68"
          y="97"
          width="56"
          height="27"
          rx="10"
          fill={`url(#${bay})`}
        />
        <rect x="75" y="105" width="36" height="9" rx="4.5" fill="#7dd3fc" />
        <circle cx="114" cy="109" r="3.6" fill="#22d3ee" />
      </g>
      <g>
        <rect
          x="68"
          y="131"
          width="56"
          height="27"
          rx="10"
          fill={`url(#${bay})`}
        />
        <rect x="75" y="139" width="26" height="9" rx="4.5" fill="#a5b4fc" />
        <circle cx="114" cy="143" r="3.6" fill="#e879f9" />
      </g>

      {/* floating cloud + upload badge */}
      <g>
        <ellipse
          cx="200"
          cy="152"
          rx="30"
          ry="7"
          fill="#b7a4ff"
          opacity="0.25"
        />
        <path
          d="M164 138a15 15 0 0 1 .6-30 24 24 0 0 1 45.4 4 17 17 0 0 1-2 33Z"
          fill={`url(#${cloud})`}
        />
        <path
          d="M164 138a15 15 0 0 1 .6-30"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <rect
          x="188"
          y="112"
          width="40"
          height="40"
          rx="13"
          fill={`url(#${badge})`}
        />
        <rect
          x="188"
          y="112"
          width="40"
          height="40"
          rx="13"
          fill="#ffffff"
          opacity="0.12"
        />
        <path
          d="M208 143v-17"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="m201 132 7-7 7 7"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
