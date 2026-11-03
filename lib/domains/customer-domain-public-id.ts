/**
 * Domain order and transfer public ids are generated server-side as
 * `DOM-XXXXXX` / `TRF-XXXXXX` (6 uppercase base36 chars). Reject malformed
 * values before database lookup to reduce probing noise.
 */
const DOMAIN_ORDER_PUBLIC_ID_RE = /^DOM-[A-Z0-9]{6}$/;
const TRANSFER_PUBLIC_ID_RE = /^TRF-[A-Z0-9]{6}$/;

function parsePrefixedPublicId(
  raw: string | null | undefined,
  re: RegExp,
): string | null {
  if (raw == null) return null;
  if (typeof raw !== "string") return null;
  if (/[\r\n\t]/.test(raw)) return null;
  const id = raw.trim();
  if (!id || id.length > 64) return null;
  if (!re.test(id)) return null;
  return id;
}

export function parseCustomerDomainOrderPublicId(
  raw: string | null | undefined,
): string | null {
  return parsePrefixedPublicId(raw, DOMAIN_ORDER_PUBLIC_ID_RE);
}

export function parseCustomerTransferPublicId(
  raw: string | null | undefined,
): string | null {
  return parsePrefixedPublicId(raw, TRANSFER_PUBLIC_ID_RE);
}
