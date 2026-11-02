const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;

/** Hostname labels only — not IPs, URLs, or header-injection payloads. */
export function isValidNameserverHost(raw: string): boolean {
  const ns = raw.trim().toLowerCase();
  if (!ns || ns.length > 253) return false;
  if (/[\r\n\s\\/:]/.test(ns)) return false;
  if (ns.includes("..") || ns.startsWith(".") || ns.endsWith(".")) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ns)) return false;
  if (!ns.includes(".")) return false;
  return ns.split(".").every((label) => LABEL.test(label));
}

export function normalizeNameserverList(nameservers: string[]):
  | {
      ok: true;
      nameservers: string[];
    }
  | { ok: false; error: string } {
  const cleaned: string[] = [];
  const seen = new Set<string>();
  for (const raw of nameservers) {
    const ns = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (!ns) continue;
    if (!isValidNameserverHost(ns)) {
      return { ok: false, error: "Enter at least two valid nameservers." };
    }
    if (seen.has(ns)) continue;
    seen.add(ns);
    cleaned.push(ns);
  }
  if (cleaned.length < 2 || cleaned.length > 13) {
    return { ok: false, error: "Enter at least two valid nameservers." };
  }
  return { ok: true, nameservers: cleaned };
}
