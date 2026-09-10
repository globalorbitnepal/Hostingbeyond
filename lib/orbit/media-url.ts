/** User-uploaded media (not build-time public assets). */
export function isRuntimeMediaSrc(src: string | null | undefined) {
  if (!src) return false;
  return (
    src.startsWith("/uploads/") ||
    src.startsWith("/api/uploads/") ||
    src.includes("/uploads/")
  );
}
