import type {
  TicketCategory,
  TicketPriority,
} from "@/lib/beyond-master/tickets/types";
import {
  needsDomain,
  plainTicketText,
} from "@/lib/beyond-master/tickets/validate";

const EXPLICIT =
  /speak to a human|human assistance|contact (technical )?support|connect me with support|forward my complaint|open a ticket|submit a ticket|i want to complain|please contact support|i need (a )?human/i;

const HANDOFF =
  /speak to a human|human assistance|connect me with support|forward my complaint|i need (a )?human/i;

const PROBLEM =
  /website is down|domain is not connecting|email is not working|billing problem|not connecting|not working/i;

export type SupportIntent =
  | { kind: "none" }
  | {
      kind: "offer" | "prepare";
      handoff: boolean;
      category: TicketCategory;
      priority: TicketPriority;
      subject: string;
      description: string;
      domainName: string | null;
      missing: string[];
    };

export function classifySupportIntent(message: string): SupportIntent {
  const text = message.trim();
  const explicit = EXPLICIT.test(text);
  if (!explicit && !PROBLEM.test(text)) return { kind: "none" };
  const category = categoryFor(text);
  const domainName = findDomain(text);
  const description = plainTicketText(text, 4000) ?? "";
  const subject = description.slice(0, 80);
  const missing: string[] = [];
  if (description.length < 10) missing.push("description");
  if (needsDomain(category) && !domainName) missing.push("domain");
  return {
    kind: explicit ? "prepare" : "offer",
    handoff: HANDOFF.test(text),
    category,
    priority: /down|urgent|not working|not connecting/i.test(text)
      ? "high"
      : "normal",
    subject: subject.length >= 4 ? subject : "Support request",
    description,
    domainName,
    missing,
  };
}

function categoryFor(text: string): TicketCategory {
  if (/dns|nameserver|a record|mx record/i.test(text)) return "dns";
  if (/email|mailbox/i.test(text)) return "business-email";
  if (/ssl|https|certificate/i.test(text)) return "ssl";
  if (/vps/i.test(text)) return "vps";
  if (/node|laravel|django|developer hosting/i.test(text))
    return "developer-hosting";
  if (/billing|invoice|refund/i.test(text)) return "billing";
  if (/payment|stripe|card/i.test(text)) return "payment";
  if (/website is down|site is down|not loading/i.test(text)) return "website";
  if (/domain/i.test(text)) return "domain";
  if (/hosting/i.test(text)) return "hosting";
  if (/account|login|password/i.test(text)) return "account";
  return "other";
}

function findDomain(text: string): string | null {
  const match = text.match(
    /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24})\b/i,
  );
  return match?.[1]?.toLowerCase() ?? null;
}
