const WORDS_PER_MINUTE = 220;

export function estimateReadingTimeMinutes(
  htmlOrText: string,
  override?: number | null,
): number {
  if (override != null && override > 0) return override;
  const text = htmlOrText
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 1;
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
