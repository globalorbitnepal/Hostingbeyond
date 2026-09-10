"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
};

/**
 * Premium crisp SVG — HB monogram with house-roof + HostingBeyond wordmark.
 * Transparent, sharp at any DPR — light glass header.
 */
export function HostingBeyondLogo({
  className,
  title = "HostingBeyond",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const markGrad = `hb-g-mark-${uid}`;
  const textGrad = `hb-g-text-${uid}`;

  return (
    <svg
      viewBox="0 0 372 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-auto shrink-0 overflow-visible", className)}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient
          id={markGrad}
          x1="0"
          y1="2"
          x2="54"
          y2="54"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#D946EF" />
          <stop offset="28%" stopColor="#A855F7" />
          <stop offset="62%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient
          id={textGrad}
          x1="200"
          y1="8"
          x2="360"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#C026D3" />
          <stop offset="40%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Monogram group */}
      <g fill={`url(#${markGrad})`}>
        {/* H left stem */}
        <path d="M4 11.5c0-2.5 2-4.5 4.5-4.5h4c2.5 0 4.5 2 4.5 4.5v33c0 2.5-2 4.5-4.5 4.5h-4c-2.5 0-4.5-2-4.5-4.5v-33z" />

        {/* H right stem / B spine */}
        <path d="M27 11.5c0-2.5 2-4.5 4.5-4.5h5c2.5 0 4.5 2 4.5 4.5v33c0 2.5-2 4.5-4.5 4.5h-5c-2.5 0-4.5-2-4.5-4.5v-33z" />

        {/* House roof peak as H crossbar */}
        <path d="M14.8 24.8 27.4 10.8a3.2 3.2 0 0 1 4.6 0l12.6 14c1.6 1.8.3 4.6-2.1 4.6h-3.4v3.6c0 1.5-1.2 2.7-2.7 2.7H23c-1.5 0-2.7-1.2-2.7-2.7v-3.6h-3.4c-2.4 0-3.7-2.8-2.1-4.6z" />

        {/* B upper + lower bowls */}
        <path d="M40.5 10h8.2c7.2 0 12.3 4.2 12.3 10.6 0 3.9-1.9 6.9-5.1 8.5 4.4 1.5 7.4 5.1 7.4 10.1 0 7-5.6 11.3-13.4 11.3h-9.4V10zm10.2 6.8h-5.4v8.8h4.4c3.5 0 5.6-1.8 5.6-4.5s-1.9-4.3-4.6-4.3zm-5.4 14.8v10h5.8c3.9 0 6.3-2 6.3-5.1 0-3-2.3-4.9-6-4.9h-6.1z" />
      </g>

      <text
        x="68"
        y="37.5"
        fontFamily="var(--font-sans), Manrope, ui-sans-serif, system-ui, sans-serif"
        fontSize="31"
        fontWeight="800"
        letterSpacing="-0.038em"
      >
        <tspan fill="#0F172A">Hosting</tspan>
        <tspan fill={`url(#${textGrad})`}>Beyond</tspan>
      </text>
    </svg>
  );
}
