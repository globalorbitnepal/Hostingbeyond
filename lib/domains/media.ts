/** True when the CMS path points at a loopable video asset. */
export function isVideoMediaSrc(src: string | null | undefined) {
  if (!src?.trim()) return false;
  return /\.(mp4|webm)(\?|#|$)/i.test(src.trim());
}
