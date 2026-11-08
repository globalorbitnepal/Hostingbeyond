export function BeyondMasterIcon({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <ellipse
        className="hb-bmai-orbit-a"
        cx="16"
        cy="16"
        rx="13.6"
        ry="5.2"
        fill="none"
        stroke="#a855f7"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <ellipse
        className="hb-bmai-orbit-b"
        cx="16"
        cy="16"
        rx="13.6"
        ry="5.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.92"
      />
      <circle cx="16" cy="16" r="4.35" fill="#ffffff" />
      <circle cx="14.85" cy="14.7" r="1.45" fill="#fff" opacity="0.92" />
    </svg>
  );
}
