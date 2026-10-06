const SENSITIVE_KEYS = new Set([
  "apiKey",
  "apikey",
  "token",
  "password",
  "authorization",
  "x-api-key",
  "__reseller",
  "DOMAIN_API_TEST_KEY",
  "DOMAIN_API_LIVE_KEY",
]);

function redact(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return {};
  if (typeof value !== "object") return { value };
  if (Array.isArray(value)) return { items: value.map(redact) };
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(key.toLowerCase())) {
      out[key] = "[redacted]";
    } else {
      out[key] = redact(val);
    }
  }
  return out;
}

/** Server-side domain provider logging (no credentials). */
export function logDomainProvider(
  event: string,
  meta: Record<string, unknown> = {},
) {
  console.info(
    JSON.stringify({
      scope: "domains",
      event,
      at: new Date().toISOString(),
      ...redact(meta),
    }),
  );
}
