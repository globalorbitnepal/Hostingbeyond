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
        d="M16 1.6c.9 6.4 4.2 9.8 10.4 11.2C20.2 14.2 16.9 17.6 16 24c-.9-6.4-4.2-9.8-10.4-11.2C11.8 11.4 15.1 8 16 1.6Z"
      />
      <path
        fill="currentColor"
        opacity="0.9"
        d="M25.2 4.2c.35 2.2 1.45 3.4 3.6 3.9-2.15.5-3.25 1.7-3.6 3.9-.35-2.2-1.45-3.4-3.6-3.9 2.15-.5 3.25-1.7 3.6-3.9Z"
      />
    </svg>
  );
}
