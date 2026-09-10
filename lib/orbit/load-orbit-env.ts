import { readFileSync } from "fs";
import { resolve } from "path";

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
 * Load Orbit secrets from `.env` at request time.
 * The file is the source of truth so a stale process env cannot keep an
 * old access key after `.env` is updated. Never logs values.
 */
export function hydrateOrbitEnvFromFile() {
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

    let enrollment = "";
    let session = "";
    for (const line of text.split(/\r?\n/)) {
      const pair = parseEnvLine(line);
      if (!pair) continue;
      const value = pair[1].trim();
      if (!value) continue;
      if (pair[0] === "ORBIT_ENROLLMENT_SECRET") enrollment = value;
      if (pair[0] === "ORBIT_SESSION_SECRET") session = value;
    }

    if (enrollment) process.env.ORBIT_ENROLLMENT_SECRET = enrollment;
    if (session) process.env.ORBIT_SESSION_SECRET = session;
    if (enrollment || session) return;
  }
}
