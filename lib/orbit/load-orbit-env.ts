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

const ISOLATED_STAGING_PORT = "55432";
const ISOLATED_STAGING_DATABASE = "hostingbeyond_integration_test";
const PRODUCTION_DATABASE_ROLE = "hostingbeyond_user";

/**
 * True only for the private staging database. Production URLs, missing URLs,
 * and unparseable URLs stay false so file secrets still apply.
 */
export function isIsolatedStagingDatabase(
  databaseUrl: string | undefined,
): boolean {
  if (!databaseUrl) return false;
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    return false;
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  const loopback =
    host === "127.0.0.1" || host === "localhost" || host === "::1";
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  const role = decodeURIComponent(parsed.username);
  return (
    loopback &&
    parsed.port === ISOLATED_STAGING_PORT &&
    database === ISOLATED_STAGING_DATABASE &&
    role.length > 0 &&
    role !== PRODUCTION_DATABASE_ROLE
  );
}

/**
 * Load Orbit secrets from `.env` at request time.
 * The file is the source of truth so a stale process env cannot keep an
 * old access key after `.env` is updated. Never logs values.
 * The isolated staging database is the exception: its process secrets are
 * left untouched so a checkout `.env` cannot replace them.
 */
export function hydrateOrbitEnvFromFile(options?: {
  paths?: string[];
  databaseUrl?: string;
}) {
  const databaseUrl = options?.databaseUrl ?? process.env.DATABASE_URL;
  if (isIsolatedStagingDatabase(databaseUrl)) return;

  const paths = options?.paths ?? [
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
