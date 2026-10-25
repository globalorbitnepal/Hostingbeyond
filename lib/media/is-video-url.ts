/** True for site paths ending in .mp4 / .webm (query/hash allowed). */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return /\.(mp4|webm)(\?|#|$)/i.test(url.trim());
}
