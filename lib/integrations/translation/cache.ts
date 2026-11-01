const MAX_ENTRIES = 5_000;

/** Process-local memo so repeat page views skip the upstream translate call. */
const cache = new Map<string, string>();

function key(language: string, text: string): string {
  return `${language}\u0000${text}`;
}

export function readTranslationCache(
  language: string,
  text: string,
): string | undefined {
  return cache.get(key(language, text));
}

export function writeTranslationCache(
  language: string,
  text: string,
  translated: string,
): void {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  cache.set(key(language, text), translated);
}

export function translationCacheStats(): { size: number; max: number } {
  return { size: cache.size, max: MAX_ENTRIES };
}
