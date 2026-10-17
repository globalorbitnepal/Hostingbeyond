import { Prisma } from "@prisma/client";

export function decimal(
  value: string | number | Prisma.Decimal,
): Prisma.Decimal {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

/** Round half-up to 2 decimal places (currency). */
export function roundMoney(value: Prisma.Decimal): Prisma.Decimal {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function moneyEquals(
  a: Prisma.Decimal,
  b: Prisma.Decimal,
  tolerance = "0.01",
): boolean {
  return a.sub(b).abs().lessThanOrEqualTo(new Prisma.Decimal(tolerance));
}
