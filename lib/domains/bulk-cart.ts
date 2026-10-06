import { validateDomainForRegistration } from "@/lib/domains/validate-registration";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";

const MAX_BULK = 50;

export type BulkCartItem = {
  domain: string;
  status: string;
  register: number;
  renew: number;
  transfer: number;
  currency: string;
};

export async function validateDomainsForBulkCart(domains: string[]): Promise<{
  items: BulkCartItem[];
  rejected: Array<{ input: string; error: string }>;
}> {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of domains) {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    unique.push(trimmed);
    if (unique.length >= MAX_BULK) break;
  }

  const items: BulkCartItem[] = [];
  const rejected: Array<{ input: string; error: string }> = [];

  for (const input of unique) {
    const normalized = normalizeDomainSearchInput(input);
    if (!normalized.ok) {
      rejected.push({ input, error: normalized.error });
      continue;
    }
    const validated = await validateDomainForRegistration(normalized.query);
    if (!validated.ok) {
      rejected.push({ input, error: validated.error });
      continue;
    }
    const { result } = validated;
    if (result.status !== "available" && result.status !== "premium") {
      rejected.push({
        input,
        error: "Domain is not available to register.",
      });
      continue;
    }
    if (result.register == null) {
      rejected.push({
        input,
        error: "Pricing unavailable for this extension.",
      });
      continue;
    }
    items.push({
      domain: result.domain,
      status: result.status,
      register: result.register,
      renew: result.renew ?? 0,
      transfer: result.transfer ?? 0,
      currency: "USD",
    });
  }

  return { items, rejected };
}
