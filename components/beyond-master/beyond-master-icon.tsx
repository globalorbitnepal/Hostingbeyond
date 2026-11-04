export function BeyondMasterIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 4.5 26.5 10v12L16 27.5 5.5 22V10L16 4.5Z"
        fill="none"
        stroke="white"
        strokeWidth="1.7"
      />
      <circle cx="16" cy="16" r="3.1" fill="white" />
      <path
        d="M16 8.2v4.2M16 19.6v4.2M8.8 12.2l3.5 2M19.7 17.8l3.5 2M8.8 19.8l3.5-2M19.7 14.2l3.5-2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
