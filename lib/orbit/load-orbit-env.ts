import { readFileSync } from "fs";
import { resolve } from "path";

const ORBIT_ENV_KEYS = ["ORBIT_ENROLLMENT_SECRET"] as const;

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    value = value.slice(1, -1);
  }
  return [key, value];
}

/**
 * Fill missing Orbit secrets from `.env` at request time.
 * Next.js only loads `.env` at process start, and only if the process user
 * can read the file — this recovers when those conditions were not met.
 * Never overwrites variables already present in the process environment.
 * Never logs values.
 */
export function hydrateOrbitEnvFromFile() {
  const missing = ORBIT_ENV_KEYS.filter(
    (key) => !process.env[key]?.trim(),
  );
  if (missing.length === 0) return;

  const paths = [
    resolve(process.cwd(), ".env"),
    "/srv/apps/hostingbeyond/.env",
  ];

  for (const filePath of paths) {
    let text: string;
    try {
      text = readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const parsed = new Map<string, string>();
    for (const line of text.split(/\r?\n/)) {
      const pair = parseEnvLine(line);
      if (pair) parsed.set(pair[0], pair[1]);
    }

    for (const key of missing) {
      const value = parsed.get(key)?.trim();
      if (value && !process.env[key]?.trim()) {
        process.env[key] = value;
      }
    }
    break;
  }
}
