/** Browser-only guest cart until the customer signs in (merged server-side on login). */

export type GuestCartLine = {
  domain: string;
  status: string;
  register: number;
  renew: number;
  currency: string;
  addedAt: number;
};

const STORAGE_KEY = "hb-guest-domain-cart-v1";
const MAX_ITEMS = 50;

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

export function readGuestDomainCart(): GuestCartLine[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line) => line?.domain && typeof line.register === "number",
    );
  } catch {
    return [];
  }
}

export function writeGuestDomainCart(lines: GuestCartLine[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(lines.slice(0, MAX_ITEMS)),
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearGuestDomainCart(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function addGuestDomainLine(line: Omit<GuestCartLine, "addedAt">): {
  ok: true;
  duplicate: boolean;
  count: number;
} {
  const existing = readGuestDomainCart();
  const domain = line.domain.trim().toLowerCase();
  if (existing.some((item) => item.domain === domain)) {
    return { ok: true, duplicate: true, count: existing.length };
  }
  if (existing.length >= MAX_ITEMS) {
    return { ok: true, duplicate: false, count: existing.length };
  }
  const next = [...existing, { ...line, domain, addedAt: Date.now() }];
  writeGuestDomainCart(next);
  return { ok: true, duplicate: false, count: next.length };
}

export function removeGuestDomainLine(domain: string): number {
  const domainKey = domain.trim().toLowerCase();
  const next = readGuestDomainCart().filter(
    (item) => item.domain !== domainKey,
  );
  writeGuestDomainCart(next);
  return next.length;
}

export function guestCartSnapshot() {
  const items = readGuestDomainCart();
  const total = items.reduce((sum, item) => sum + item.register, 0);
  return {
    items,
    count: items.length,
    total: Math.round(total * 100) / 100,
    currency: "USD" as const,
  };
}
