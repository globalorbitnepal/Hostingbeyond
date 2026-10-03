const BENTO_PREFIX = "/images/domains/videos/bento-";

/** Stock bento MP4s replaced by in-browser motion; Orbit uploads still play as video. */
export function isBuiltInBentoVideo(src: string | null | undefined) {
  const s = src?.trim() ?? "";
  if (!s) return true;
  return s.includes(BENTO_PREFIX);
}
