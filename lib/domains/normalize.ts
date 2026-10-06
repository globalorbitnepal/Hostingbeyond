import { splitDomain } from "@/lib/domains/tlds";

export type NormalizedDomainInput =
  | { ok: true; query: string; name: string; tld: string }
  | { ok: false; error: string };

/** Cleans user input (URL, www, spaces, case) before lookup. */
export function normalizeDomainSearchInput(raw: string): NormalizedDomainInput {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter a domain name." };
  }

  const { name, tld } = splitDomain(trimmed);
  if (!name) {
    return { ok: false, error: "Please enter a valid domain name." };
  }

  if (name.length < 2 || name.length > 63) {
    return {
      ok: false,
      error: "Domain names must be between 2 and 63 characters.",
    };
  }

  if (name.startsWith("-") || name.endsWith("-")) {
    return {
      ok: false,
      error: "Domain names cannot start or end with a hyphen.",
    };
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    return {
      ok: false,
      error: "Please enter a valid domain name.",
    };
  }

  const query = tld ? `${name}${tld}` : name;
  return { ok: true, query, name, tld };
}
