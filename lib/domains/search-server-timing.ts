export function buildServerTimingHeader(
  parts: Record<string, number | undefined>,
): string {
  return Object.entries(parts)
    .filter((entry): entry is [string, number] => {
      const dur = entry[1];
      return typeof dur === "number" && Number.isFinite(dur) && dur >= 0;
    })
    .map(([name, dur]) => `${name};dur=${Math.round(dur)}`)
    .join(", ");
}
