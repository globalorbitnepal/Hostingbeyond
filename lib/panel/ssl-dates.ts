const LETS_ENCRYPT_DAYS = 90;

export function letsEncryptPeriodMs() {
  return LETS_ENCRYPT_DAYS * 24 * 60 * 60 * 1000;
}

export function nextLetsEncryptExpiry(
  anchorIso: string | null,
  now = new Date(),
): string {
  const anchor = anchorIso ? new Date(anchorIso) : now;
  const start = Number.isFinite(anchor.getTime()) ? anchor : now;
  const periodMs = letsEncryptPeriodMs();
  const elapsed = Math.max(0, now.getTime() - start.getTime());
  if (elapsed > 0 && elapsed % periodMs === 0) {
    return now.toISOString();
  }
  const cycles = Math.floor(elapsed / periodMs);
  return new Date(start.getTime() + (cycles + 1) * periodMs).toISOString();
}
