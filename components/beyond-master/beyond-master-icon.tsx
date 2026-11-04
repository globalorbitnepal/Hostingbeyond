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
        d="M16 2.2c.7 4.8 2.9 7.4 7.4 8.6L16 16 8.6 10.8C13.1 9.6 15.3 7 16 2.2Zm6.8 7.4C21.6 13.1 24.2 15.3 29 16L16 16l5.2-7.4c.6.3 1.1.6 1.6 1Zm2.4 13C21.6 21.4 19 23.6 16 29.8 15.3 25 13.1 22.4 8.6 21.2L16 16l6.8 6.6c.6-.3 1.1-.6 1.6-1ZM9.2 22.4C10.4 18.9 7.8 16.7 3 16L16 16 10.8 23.4c-.6-.3-1.1-.6-1.6-1Z"
      />
    </svg>
  );
}
