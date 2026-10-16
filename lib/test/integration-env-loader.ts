import { existsSync, readFileSync } from "node:fs";

const INTEGRATION_ENV = ".env.integration.local";

if (existsSync(INTEGRATION_ENV)) {
  const text = readFileSync(INTEGRATION_ENV, "utf8");
  const m = text.match(/^DATABASE_URL=(.*)$/m);
  if (m) {
    let url = m[1].trim();
    if (
      (url.startsWith('"') && url.endsWith('"')) ||
      (url.startsWith("'") && url.endsWith("'"))
    ) {
      url = url.slice(1, -1);
    }
    const host = new URL(url).hostname;
    if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
      throw new Error("integration env refused: non-local host");
    }
    process.env.DATABASE_URL = url;
  }
}
