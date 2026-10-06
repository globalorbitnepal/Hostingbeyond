import { routes } from "@/config/routes";

export function parseDomainListFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): string[] {
  const rawDomains = params.domains;
  const rawDomain = params.domain;
  const list: string[] = [];

  if (typeof rawDomains === "string" && rawDomains.trim()) {
    list.push(
      ...rawDomains
        .split(/[\s,]+/)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean),
    );
  } else if (Array.isArray(rawDomains)) {
    for (const chunk of rawDomains) {
      list.push(
        ...chunk
          .split(/[\s,]+/)
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean),
      );
    }
  }

  if (typeof rawDomain === "string" && rawDomain.trim()) {
    list.unshift(rawDomain.trim().toLowerCase());
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const domain of list) {
    if (seen.has(domain)) continue;
    seen.add(domain);
    unique.push(domain);
    if (unique.length >= 50) break;
  }
  return unique;
}

export function domainCheckoutPath(domains: string[]): string {
  if (domains.length === 1) {
    return `${routes.domainCheckout}?domain=${encodeURIComponent(domains[0]!)}`;
  }
  return `${routes.domainCheckout}?domains=${encodeURIComponent(domains.join(","))}`;
}

export function loginPathForDomainCheckout(domains: string[]): string {
  const next = domainCheckoutPath(domains);
  return `${routes.login}?next=${encodeURIComponent(next)}`;
}

export function signupPathForDomainCheckout(domains: string[]): string {
  const next = domainCheckoutPath(domains);
  return `${routes.signup}?next=${encodeURIComponent(next)}`;
}
