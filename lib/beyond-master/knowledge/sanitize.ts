const INJECTION =
  /ignore (all |any )?(previous|prior|above) (instructions|rules)|you are now|system prompt|new instructions|reveal (the )?(api key|secret|system)|<\s*\/?\s*system\s*>/i;

const SECRET = /\b(sk-[a-z0-9-]{8,}|api[_-]?key\s*[:=]\s*\S+)\b/i;

export function sanitizeKnowledgeText(input: string): string {
  const cleaned = input
    .replace(/\u0000/g, "")
    .replace(/<<<\s*\/?\s*knowledge\s*>>>/gi, "")
    .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*\/?\s*script\b[^>]*>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/<[^>]*>/g, "")
    .split(/\r?\n/)
    .map((line) =>
      INJECTION.test(line) || SECRET.test(line) ? "" : line.trim(),
    )
    .join("\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  return cleaned.slice(0, 1800);
}
