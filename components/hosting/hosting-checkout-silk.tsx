/** Full-page silk ribbons — CSS/SVG only. */
export function HostingCheckoutSilk() {
  return (
    <svg
      className="hb-checkout-silk"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="hb-silk-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="hb-silk-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.55" />
          <stop offset="40%" stopColor="#a78bfa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="hb-silk-c" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#c4b5fd" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M-80 210C140-40 280 260 520 90C740-50 900 210 1180 40C1280-20 1380 70 1520 20L1520-80L-80-80Z"
        fill="url(#hb-silk-a)"
      />
      <path
        d="M-80 280C180 40 340 300 580 140C820-10 980 250 1280 90C1380 30 1460 120 1560 80L1560-40L-80-40Z"
        fill="url(#hb-silk-b)"
        opacity="0.7"
      />
      <path
        d="M-60 820C180 620 360 900 620 740C860 600 1040 880 1320 700C1420 640 1500 780 1600 740L1600 980L-60 980Z"
        fill="url(#hb-silk-c)"
      />
      <path
        d="M720 980C980 780 1120 920 1440 760C1520 720 1560 800 1600 780L1600 980Z"
        fill="#c7d2fe"
        opacity="0.45"
      />
    </svg>
  );
}
