import { Prisma } from "@prisma/client";

export type RetailPriceFields = {
  retailRegister?: number;
  retailRenew?: number;
  retailTransfer?: number;
  retailRestore?: number | null;
  retailRegisterByYear?: Record<string, number> | null;
  retailRenewByYear?: Record<string, number> | null;
  promoRegister?: number | null;
  promoEndsAt?: Date | null;
  minMarginPercent?: number;
  premiumMarkupPercent?: number | null;
  enabled?: boolean;
};

export type PricingValidationError = { field: string; message: string };

const RETAIL_MONEY_FIELDS = [
  "retailRegister",
  "retailRenew",
  "retailTransfer",
  "retailRestore",
  "promoRegister",
] as const;

/** Validates a single retail money field when present in the payload. */
export function validateRetailMoney(
  field: string,
  value: unknown,
  { allowNull = false }: { allowNull?: boolean } = {},
): PricingValidationError | null {
  if (value === undefined) return null;
  if (value === null) {
    return allowNull ? null : { field, message: "Value is required." };
  }
  if (typeof value === "string" && !value.trim()) {
    return { field, message: "Invalid number." };
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return { field, message: "Invalid number." };
  }
  if (n < 0) {
    return { field, message: "Price cannot be negative." };
  }
  return null;
}

export function validateRetailPricePayload(
  body: Record<string, unknown>,
  options: { partial: boolean } = { partial: true },
): PricingValidationError[] {
  const errors: PricingValidationError[] = [];
  for (const field of RETAIL_MONEY_FIELDS) {
    if (!(field in body)) continue;
    const err = validateRetailMoney(field, body[field], {
      allowNull: field === "retailRestore" || field === "promoRegister",
    });
    if (err) errors.push(err);
  }
  if ("minMarginPercent" in body && body.minMarginPercent !== undefined) {
    const err = validateRetailMoney("minMarginPercent", body.minMarginPercent);
    if (err) errors.push(err);
  }
  if (
    "premiumMarkupPercent" in body &&
    body.premiumMarkupPercent !== undefined &&
    body.premiumMarkupPercent !== null
  ) {
    const err = validateRetailMoney(
      "premiumMarkupPercent",
      body.premiumMarkupPercent,
    );
    if (err) errors.push(err);
  }
  if ("enabled" in body && body.enabled !== undefined) {
    if (typeof body.enabled !== "boolean") {
      errors.push({ field: "enabled", message: "Must be true or false." });
    }
  }
  if (!options.partial) {
    for (const field of ["retailRegister", "retailRenew", "retailTransfer"]) {
      if (!(field in body)) {
        errors.push({ field, message: "Required field missing." });
      }
    }
  }
  return errors;
}

export function validateBulkRetailItem(
  item: Record<string, unknown>,
): PricingValidationError[] {
  const errors: PricingValidationError[] = [];
  const tld = String(item.tld ?? "").trim();
  if (!tld) {
    errors.push({ field: "tld", message: "TLD required." });
  }
  for (const field of ["retailRegister", "retailRenew", "retailTransfer"]) {
    if (!(field in item)) continue;
    const err = validateRetailMoney(field, item[field]);
    if (err) errors.push(err);
  }
  return errors;
}

/** Build Prisma update data — only keys explicitly sent in the JSON body. */
export function pickRetailUpdateData(
  body: Record<string, unknown>,
): RetailPriceFields {
  const data: RetailPriceFields = {};
  const assign = <K extends keyof RetailPriceFields>(
    key: K,
    value: RetailPriceFields[K],
  ) => {
    data[key] = value;
  };
  if ("retailRegister" in body) {
    assign("retailRegister", Number(body.retailRegister));
  }
  if ("retailRenew" in body) {
    assign("retailRenew", Number(body.retailRenew));
  }
  if ("retailTransfer" in body) {
    assign("retailTransfer", Number(body.retailTransfer));
  }
  if ("retailRestore" in body) {
    assign(
      "retailRestore",
      body.retailRestore === null ? null : Number(body.retailRestore),
    );
  }
  if ("retailRegisterByYear" in body) {
    assign(
      "retailRegisterByYear",
      body.retailRegisterByYear as Record<string, number> | null,
    );
  }
  if ("retailRenewByYear" in body) {
    assign(
      "retailRenewByYear",
      body.retailRenewByYear as Record<string, number> | null,
    );
  }
  if ("promoRegister" in body) {
    assign(
      "promoRegister",
      body.promoRegister === null ? null : Number(body.promoRegister),
    );
  }
  if ("minMarginPercent" in body) {
    assign("minMarginPercent", Number(body.minMarginPercent));
  }
  if ("premiumMarkupPercent" in body) {
    assign(
      "premiumMarkupPercent",
      body.premiumMarkupPercent === null
        ? null
        : Number(body.premiumMarkupPercent),
    );
  }
  if ("enabled" in body) {
    assign("enabled", Boolean(body.enabled));
  }
  return data;
}

export function pickBulkRetailUpdateData(item: Record<string, unknown>) {
  const data: Pick<
    RetailPriceFields,
    "retailRegister" | "retailRenew" | "retailTransfer"
  > = {};
  if ("retailRegister" in item)
    data.retailRegister = Number(item.retailRegister);
  if ("retailRenew" in item) data.retailRenew = Number(item.retailRenew);
  if ("retailTransfer" in item) {
    data.retailTransfer = Number(item.retailTransfer);
  }
  return data;
}

/** Map validated retail fields to Prisma update input (JSON null semantics). */
export function toPrismaRetailUpdateData(
  data: RetailPriceFields,
): Prisma.DomainTldPriceUpdateInput {
  const out: Prisma.DomainTldPriceUpdateInput = {};
  if (data.retailRegister !== undefined)
    out.retailRegister = data.retailRegister;
  if (data.retailRenew !== undefined) out.retailRenew = data.retailRenew;
  if (data.retailTransfer !== undefined)
    out.retailTransfer = data.retailTransfer;
  if (data.retailRestore !== undefined) {
    out.retailRestore = data.retailRestore;
  }
  if (data.retailRegisterByYear !== undefined) {
    out.retailRegisterByYear =
      data.retailRegisterByYear === null
        ? Prisma.JsonNull
        : data.retailRegisterByYear;
  }
  if (data.retailRenewByYear !== undefined) {
    out.retailRenewByYear =
      data.retailRenewByYear === null
        ? Prisma.JsonNull
        : data.retailRenewByYear;
  }
  if (data.promoRegister !== undefined) out.promoRegister = data.promoRegister;
  if (data.promoEndsAt !== undefined) out.promoEndsAt = data.promoEndsAt;
  if (data.minMarginPercent !== undefined) {
    out.minMarginPercent = data.minMarginPercent;
  }
  if (data.premiumMarkupPercent !== undefined) {
    out.premiumMarkupPercent = data.premiumMarkupPercent;
  }
  if (data.enabled !== undefined) out.enabled = data.enabled;
  return out;
}
