/** User-uploaded media (not build-time public assets). */
export function isRuntimeMediaSrc(src: string | null | undefined) {
  if (!src) return false;
  return (
    src.startsWith("/uploads/") ||
    src.startsWith("/api/uploads/") ||
    src.includes("/uploads/")
  );
}

export function resolveCmsImage(
  src: string | null | undefined,
  fallback: string,
) {
  const value = typeof src === "string" ? src.trim() : "";
  return value || fallback;
}
