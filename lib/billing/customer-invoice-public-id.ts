/**
 * Invoice public ids are generated in `lib/billing/invoice-builder.ts` as
 * `inv_<32 hex chars>` (underscore included), so the accepted alphabet must
 * allow `_`. Rejects path traversal, separators, whitespace, and overlong input
 * before any database lookup.
 */
const INVOICE_PUBLIC_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

/** Rejects malformed ids before database lookup (reduces probing noise). */
export function parseCustomerInvoicePublicId(
  raw: string | null | undefined,
): string | null {
  const id = raw?.trim() ?? "";
  if (!id || id.length > 64) return null;
  if (!INVOICE_PUBLIC_ID_RE.test(id)) return null;
  return id;
}
