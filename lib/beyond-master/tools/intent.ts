import {
  extractDomainQuery,
  wantsDomainHelp,
} from "@/lib/beyond-master/domain-intent";
import { mentionedDomain } from "@/lib/beyond-master/account/intent";
import type {
  AgentToolCall,
  ReadOnlyAgentTool,
} from "@/lib/beyond-master/tools/types";

const PERSONAL =
  /\b(my|mine|i own|i have|do i have|mes|mis|mon|ma|mi|mein|meine|mijn|мои|мой|моя|我的|私の|내|আমার|میرا|मेरा|मेरी|मेरो)\b|मेरा|मेरी|मेरो|আমার|میرا/i;

const INVOICE =
  /invoice|invoices|factura|facture|rechnung|fatura|fattura|счёт|счет|ইনভয়েস|فاکٹر|इनभ्वाइस|बिल/i;
const HOSTING =
  /hosting|hébergement|hebergement|hospedagem|хостинг|হোস্টিং|होस्टिङ|होस्टिंग|vps|wordpress plan/i;
const DOMAIN_OWN =
  /my domains?|domains? i own|registered domains?|mes domaines|mis dominios|meine domains?|мои домены|আমার ডোমেইন|میرے ڈومین|मेरे डोमेन/i;
const ORDERS =
  /my orders?|order history|mis pedidos|mes commandes|meine bestellungen|мои заказы|আমার অর্ডার|मेरे ऑर्डर/i;
const HOSTING_ORDER_REF = /\bHST-[A-F0-9]{10}\b/i;
const HOSTING_STATUS =
  /hosting order status|order status|payment.*hosting|provisioning|is my hosting active|hosting active/i;

const TICKETS =
  /my tickets?|support tickets?|mes tickets|mis tickets|meine tickets|мои тикеты|supportanfragen|আমার টিকেট|मेरे टिकट/i;
const DNS_READ =
  /dns records?|show dns|list dns|nameservers?|name servers?|registros dns|enregistrements dns|dns-einträge|записи dns|dns রেকর্ড|dns रिकॉर्ड/i;
const PLANS =
  /hosting plans?|compare plans?|plan prices?|pricing|precios|tarifs|preise|preços|тарифы|প্লান|प्लान|कीमत|मूल्य/i;
const PRICING_TLD =
  /\.([a-z]{2,12})\b.*(?:price|pricing|cost|precio|prix|preis|कीमत|मूल्य)|(?:price|pricing|cost).+\.([a-z]{2,12})\b/i;

const FQDN =
  /\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|net|org|io|co|in|np|dev|app|shop|online|store|xyz|info|biz|me|ai|site|cloud|tech|pro))\b/i;

function pushUnique(
  calls: AgentToolCall[],
  tool: ReadOnlyAgentTool,
  args: Record<string, unknown>,
) {
  if (calls.some((row) => row.tool === tool)) return;
  calls.push({ tool, args });
}

export function planReadOnlyTools(message: string): AgentToolCall[] {
  const text = message.trim();
  if (!text) return [];
  const calls: AgentToolCall[] = [];
  const personal = PERSONAL.test(text);
  const domainQuery = wantsDomainHelp(text) ? extractDomainQuery(text) : null;
  const fqdn = text.match(FQDN)?.[1]?.toLowerCase() ?? null;

  if (domainQuery && !/\bbulk\b/i.test(text)) {
    pushUnique(calls, "search_domain", { query: domainQuery });
    if (FQDN.test(text)) {
      pushUnique(calls, "check_domain_availability", {
        domain: fqdn ?? domainQuery,
      });
    }
  } else if (fqdn && wantsDomainHelp(text)) {
    pushUnique(calls, "check_domain_availability", { domain: fqdn });
  }

  const tldMatch = text.match(PRICING_TLD);
  const tld = tldMatch?.[1] ?? tldMatch?.[2];
  if (
    tld &&
    /price|pricing|cost|precio|prix|preis|कीमत|मूल्य|renew|transfer|register/i.test(
      text,
    )
  ) {
    pushUnique(calls, "get_domain_pricing", {
      tlds: [`.${tld.toLowerCase()}`],
    });
  }

  if (PLANS.test(text) && !personal) {
    pushUnique(calls, "get_hosting_plans", {});
  }

  if (personal || DOMAIN_OWN.test(text)) {
    if (DOMAIN_OWN.test(text) || /\bdomain/i.test(text)) {
      pushUnique(calls, "get_my_domains", { domain: mentionedDomain(text) });
    }
  }

  if (personal && HOSTING.test(text)) {
    pushUnique(calls, "get_my_hosting", {});
  }

  if (personal && INVOICE.test(text)) {
    pushUnique(calls, "get_my_invoices", {});
  }

  if (personal && ORDERS.test(text)) {
    pushUnique(calls, "get_my_orders", {});
  }

  const hostingRef = text.match(HOSTING_ORDER_REF)?.[0];
  if (personal && hostingRef) {
    pushUnique(calls, "get_hosting_order_status", {
      orderReference: hostingRef.toUpperCase(),
    });
  } else if (personal && HOSTING_STATUS.test(text) && HOSTING.test(text)) {
    pushUnique(calls, "get_my_orders", {});
  }

  if (personal && TICKETS.test(text)) {
    pushUnique(calls, "get_my_tickets", {});
  }

  if (personal && DNS_READ.test(text)) {
    const domain = mentionedDomain(text) ?? fqdn;
    if (domain) {
      pushUnique(calls, "get_dns_records", { domain });
    }
  }

  return calls;
}
