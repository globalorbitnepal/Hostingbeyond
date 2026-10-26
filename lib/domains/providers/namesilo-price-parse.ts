/** Result of parsing a single NameSilo getPrices money field. */
export type NameSiloParsedPrice =
  | { kind: "missing" }
  | { kind: "invalid"; raw: string }
  | { kind: "valid"; amount: number };

/**
 * Parse NameSilo supplier price fields without coercing bad data to zero.
 * Valid zero (explicit 0) is allowed when the API returns a numeric zero.
 */
export function parseNameSiloSupplierPrice(
  value: unknown,
): NameSiloParsedPrice {
  if (value === null || value === undefined) {
    return { kind: "missing" };
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return { kind: "missing" };
    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
      return { kind: "invalid", raw: trimmed };
    }
    if (n < 0) return { kind: "invalid", raw: trimmed };
    return { kind: "valid", amount: n };
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return { kind: "invalid", raw: String(value) };
    }
    if (value < 0) return { kind: "invalid", raw: String(value) };
    return { kind: "valid", amount: value };
  }
  return { kind: "invalid", raw: JSON.stringify(value) };
}

export function nameSiloParsedToNullable(
  parsed: NameSiloParsedPrice,
): number | null {
  return parsed.kind === "valid" ? parsed.amount : null;
}

export function isUsableSupplierCost(
  parsed: NameSiloParsedPrice,
): parsed is { kind: "valid"; amount: number } {
  return parsed.kind === "valid" && Number.isFinite(parsed.amount);
}
