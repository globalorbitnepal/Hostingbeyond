export type MarginRow = {
  tld: string;
  supplierRegister: number | null;
  retailRegister: number | null;
  registerMarginUsd: number | null;
  registerShortfallUsd: number | null;
  note: string;
};

/** Compare supplier vs retail registration (1yr USD). Does not imply production DB. */
export function computeRegisterMargin(
  tld: string,
  supplierRegister: number | null,
  retailRegister: number | null,
): MarginRow {
  if (supplierRegister == null || retailRegister == null) {
    return {
      tld,
      supplierRegister,
      retailRegister,
      registerMarginUsd: null,
      registerShortfallUsd: null,
      note: "Insufficient data for margin.",
    };
  }
  const delta = retailRegister - supplierRegister;
  const roundUsd = (n: number) => Math.round(n * 100) / 100;
  return {
    tld,
    supplierRegister,
    retailRegister,
    registerMarginUsd: delta >= 0 ? roundUsd(delta) : null,
    registerShortfallUsd: delta < 0 ? roundUsd(Math.abs(delta)) : null,
    note:
      delta >= 0
        ? "Retail covers supplier registration at listed catalogue prices."
        : "Retail registration is below supplier catalogue — review promo, term, or admin retail.",
  };
}
