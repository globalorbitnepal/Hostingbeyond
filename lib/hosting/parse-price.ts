/** Parse display prices like "$4.80" or "Billed $28.80 annually" to numbers. */
export function parseUsdPrice(label: string): number {
  const match = label.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}
