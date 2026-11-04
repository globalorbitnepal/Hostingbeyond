import { consumeRateLimit } from "@/lib/http/fixed-window-rate-limit";
import {
  proposeDnsChange,
  type DnsPorts,
  type DnsProposalView,
  type DnsStore,
} from "@/lib/beyond-master/dns/workflow";
import type { DnsProposalAction } from "@/lib/beyond-master/dns/validate";
import type { ProviderDnsRecord } from "@/lib/domains/providers/provider";

export type DnsCard =
  | {
      kind: "records";
      domain: string;
      records: ProviderDnsRecord[];
      note: string;
    }
  | { kind: "notice"; message: string }
  | {
      kind: "proposal";
      proposal: DnsProposalView;
      state: "confirmation_required";
    };

const DOMAIN = /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})\b/i;
const TYPE = /\b(aaaa|cname|srv|txt|ns|mx|a)\b/i;
const AMBIGUOUS =
  /\b(all records|every record|fix my dns|delete all|remove all)\b/i;

export function dnsPromptBlock(card: DnsCard) {
  if (card.kind === "records") {
    return [
      "Verified DNS records returned by the registrar for this request. Quote only these rows.",
      `Domain: ${card.domain}`,
      ...card.records.map(
        (record) =>
          `${record.type} ${record.host} ${record.value} ttl ${record.ttl} distance ${record.distance}`,
      ),
      card.note,
    ].join("\n");
  }
  if (card.kind === "proposal") {
    return [
      "A DNS proposal is waiting for the customer to click Confirm DNS Changes.",
      "Do not say the change was made.",
      `Proposal ${card.proposal.publicId} ${card.proposal.action} ${card.proposal.type} ${card.proposal.host} ${card.proposal.value}`,
    ].join("\n");
  }
  return `DNS notice: ${card.message}`;
}

export async function dnsEventForChat(input: {
  message: string;
  userId: string | null;
  ports: DnsPorts;
  store: DnsStore;
}): Promise<DnsCard | null> {
  const message = input.message.trim();
  if (!looksLikeDns(message)) return null;
  if (/\bhow (do|to|can)\b/i.test(message) && !DOMAIN.test(message))
    return null;
  const personal = /\b(my|mine|i own)\b/i.test(message);
  const action = dnsAction(message);
  const domain = message.match(DOMAIN)?.[1]?.toLowerCase() ?? null;
  if (!personal && !action && !domain) return null;
  if (!input.userId) {
    return {
      kind: "notice",
      message:
        "Sign in to see DNS records or prepare a DNS change. General DNS questions do not show private records.",
    };
  }
  if (
    !consumeRateLimit(`beyond-master-dns:${input.userId}`, 20, 10 * 60 * 1000)
  ) {
    return {
      kind: "notice",
      message: "Too many DNS requests. Please try again shortly.",
    };
  }
  if (AMBIGUOUS.test(message)) {
    return {
      kind: "notice",
      message:
        "Name one record type, host, and domain. Ambiguous DNS requests are not turned into changes.",
    };
  }
  if (!domain) {
    return { kind: "notice", message: "Name the domain you want to check." };
  }
  if (!action) return readDns(input.userId, domain, message, input.ports);
  const type = message.match(TYPE)?.[1]?.toUpperCase();
  if (!type) {
    return {
      kind: "notice",
      message: "Name the record type: A, AAAA, CNAME, MX, TXT, NS, or SRV.",
    };
  }
  const host =
    message.match(/\b(?:host|for)\s+(@|[a-z0-9*][a-z0-9.-]*)/i)?.[1] ?? "@";
  const value =
    message.match(/\b(?:to|value)\s+(\S+)/i)?.[1]?.replace(/[.,]$/, "") ?? "";
  const ttl = numberAfter(message, "ttl");
  const priority = numberAfter(message, "priority");
  if (action !== "delete" && !value) {
    return {
      kind: "notice",
      message: "Include the record value before a proposal can be reviewed.",
    };
  }
  let proposed: Awaited<ReturnType<typeof proposeDnsChange>>;
  try {
    proposed = await proposeDnsChange({
      userId: input.userId,
      domain,
      action,
      type,
      host,
      value: action === "delete" ? value || "delete" : value,
      ttl,
      priority,
      ports: input.ports,
      store: input.store,
    });
  } catch {
    return {
      kind: "notice",
      message: "DNS proposals are temporarily unavailable.",
    };
  }
  if (!proposed.ok) return { kind: "notice", message: proposed.error };
  return {
    kind: "proposal",
    proposal: proposed.proposal,
    state: "confirmation_required",
  };
}

async function readDns(
  userId: string,
  domain: string,
  message: string,
  ports: DnsPorts,
): Promise<DnsCard> {
  const listed = await ports.list(userId, domain);
  if (!listed.ok) return { kind: "notice", message: listed.error };
  const type = message.match(TYPE)?.[1]?.toUpperCase();
  const nameservers = /\bnameservers?\b/i.test(message);
  const records = listed.records.filter((record) => {
    if (nameservers) return record.type.toUpperCase() === "NS";
    if (type) return record.type.toUpperCase() === type;
    return true;
  });
  return {
    kind: "records",
    domain,
    records,
    note: "These are the records the registrar returned. DNS answers elsewhere can still differ until propagation finishes.",
  };
}

function looksLikeDns(message: string) {
  return /\b(dns|nameserver|a record|aaaa|cname|mx|txt record|srv)\b/i.test(
    message,
  );
}

function dnsAction(message: string): DnsProposalAction | null {
  if (/\b(add|create)\b/i.test(message) && /\brecord\b/i.test(message))
    return "add";
  if (/\b(update|change)\b/i.test(message) && /\brecord\b/i.test(message))
    return "update";
  if (/\b(delete|remove)\b/i.test(message) && /\brecord\b/i.test(message))
    return "delete";
  return null;
}

function numberAfter(message: string, label: string) {
  const match = message.match(new RegExp(`\\b${label}\\s+(\\d+)`, "i"));
  return match ? Number(match[1]) : null;
}
