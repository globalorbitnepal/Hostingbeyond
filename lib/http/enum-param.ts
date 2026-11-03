/**
 * Strict enum parsing for query/body params.
 *
 * Several Orbit admin routes passed client strings straight into Prisma enum
 * columns via `as never`, so a typo such as `?status=PUBLISHEDD` reached the
 * database and surfaced as an unhandled 500. These helpers reject unknown
 * values up front so routes can answer 400 with a stable contract.
 *
 * No database access and no imports from `@prisma/client` — callers pass the
 * allowed values, which keeps this module safe under the unit-test policy.
 */

export type EnumParseResult<T extends string> =
  { ok: true; value: T } | { ok: false; reason: "missing" | "unknown" };

export function parseEnumParam<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
): EnumParseResult<T> {
  const value = raw?.trim() ?? "";
  if (!value) return { ok: false, reason: "missing" };
  return (allowed as readonly string[]).includes(value)
    ? { ok: true, value: value as T }
    : { ok: false, reason: "unknown" };
}

/**
 * Optional variant: an absent parameter means "no filter", but a present and
 * unknown one is still an error rather than a silent unfiltered query.
 */
export function parseOptionalEnumParam<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
): { ok: true; value: T | undefined } | { ok: false; reason: "unknown" } {
  const value = raw?.trim() ?? "";
  if (!value) return { ok: true, value: undefined };
  return (allowed as readonly string[]).includes(value)
    ? { ok: true, value: value as T }
    : { ok: false, reason: "unknown" };
}

/** Integer within an inclusive range; used for bounded admin form fields. */
export function parseOptionalBoundedInt(
  raw: unknown,
  min: number,
  max: number,
): { ok: true; value: number | undefined } | { ok: false } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: undefined };
  }
  if (typeof raw === "number") {
    return Number.isInteger(raw) && raw >= min && raw <= max
      ? { ok: true, value: raw }
      : { ok: false };
  }
  if (typeof raw === "string" && /^-?\d+$/.test(raw.trim())) {
    const parsed = Number.parseInt(raw.trim(), 10);
    return parsed >= min && parsed <= max
      ? { ok: true, value: parsed }
      : { ok: false };
  }
  return { ok: false };
}
