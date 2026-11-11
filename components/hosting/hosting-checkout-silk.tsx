/** Corner silk ribbons — CSS/SVG only, transparent centre keeps text crisp. */
export function HostingCheckoutSilk() {
  return (
    <svg
      className="hb-checkout-silk"
      viewBox="0 0 1440 1000"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="hb-silk-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hb-silk-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.88" />
          <stop offset="45%" stopColor="#818cf8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hb-silk-c" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.72" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M-160 160C40-90 240 230 520 70C720-30 860 90 980-60L-160-140Z"
        fill="url(#hb-silk-a)"
      />
      <path
        d="M1600-90C1440 110 1280 10 1080 130C940 210 860 90 760-50L1600-140Z"
        fill="url(#hb-silk-b)"
      />
      <path
        d="M-160 1120C40 920 240 1100 460 980C640 880 780 1020 900 1120Z"
        fill="url(#hb-silk-c)"
      />
      <path
        d="M1600 1140C1420 940 1260 1060 1060 980C900 910 820 1030 760 1140Z"
        fill="url(#hb-silk-b)"
        opacity="0.9"
      />
    </svg>
  );
}
