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
          <stop offset="0%" stopColor="#b18cff" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#a78bfa" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hb-silk-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#c4b5fd" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hb-silk-c" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#a5b4fc" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* top-left */}
      <path
        d="M-120 120C70-70 210 190 470 60C640-24 760 60 830-40L-120-120Z"
        fill="url(#hb-silk-a)"
      />
      {/* top-right */}
      <path
        d="M1560-80C1430 90 1290 20 1120 110C1000 172 930 96 860-40L1560-120Z"
        fill="url(#hb-silk-b)"
      />
      {/* bottom-left */}
      <path
        d="M-120 1090C40 940 210 1080 400 980C560 896 680 1000 760 1090Z"
        fill="url(#hb-silk-c)"
      />
      {/* bottom-right */}
      <path
        d="M1560 1100C1420 940 1270 1040 1090 980C940 930 880 1010 830 1100Z"
        fill="url(#hb-silk-b)"
        opacity="0.8"
      />
    </svg>
  );
}
