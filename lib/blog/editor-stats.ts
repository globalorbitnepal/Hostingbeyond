import { estimateReadingTimeMinutes } from "./reading-time";

export function editorContentStats(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").filter(Boolean).length : 0;
  const characters = text.length;
  const readingTimeMinutes = estimateReadingTimeMinutes(html);
  return { words, characters, readingTimeMinutes };
}
