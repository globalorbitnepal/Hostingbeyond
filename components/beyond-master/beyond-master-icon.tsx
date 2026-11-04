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
      <path
        fill="currentColor"
        d="M16 2.4c.55 5.2 3.15 8.4 8.2 9.6-5.05 1.2-7.65 4.4-8.2 9.6-.55-5.2-3.15-8.4-8.2-9.6C12.85 10.8 15.45 7.6 16 2.4Z"
      />
      <path
        fill="currentColor"
        opacity="0.88"
        d="M16 8.2c.28 3.1 1.86 4.95 4.9 5.8-3.04.85-4.62 2.7-4.9 5.8-.28-3.1-1.86-4.95-4.9-5.8 3.04-.85 4.62-2.7 4.9-5.8Z"
      />
    </svg>
  );
}
