import { catalogIntent } from "@/lib/beyond-master/knowledge/catalog";
import { retrieveBeyondMasterKnowledge } from "@/lib/beyond-master/knowledge/retrieve";
import { BEYOND_MASTER_GREETING_REPLY } from "@/lib/beyond-master/copy";
import {
  extractDomainQuery,
  isAgentGreeting,
  wantsBulkDomainSearch,
  wantsDomainHelp,
} from "@/lib/beyond-master/domain-intent";
import {
  formatDomainSearchForCustomer,
  searchDomainsForAgent,
  type AgentDomainSearch,
  type AgentDomainSuggestion,
} from "@/lib/beyond-master/domain-search";

export type GroundedReply = {
  text: string;
  domains: AgentDomainSuggestion[];
};

const CUSTOMER_GUIDES: Array<{ test: RegExp; text: string }> = [
  {
    test: /dns|nameserver|a record|mx|cname|spf|dkim|dmarc/,
    text: `You can edit A, AAAA, CNAME, MX, TXT, NS, and SRV records from the domain in /account/my-domains. Default TTL in the panel is 3600 seconds. MX and SRV use a priority; the others do not.\nThis chat does not change DNS until you review and confirm a proposal. If you want a specific record changed, tell me the domain, type, host, and value.`,
  },
  {
    test: /hosting|wordpress|vps|website|plan|price|cost|compare/,
    text: `I can help you pick HostingBeyond hosting for a site, WordPress, a shop, or a VPS.\nStart here:\n• Web Hosting — /web-hosting\n• WordPress — /web-hosting/wordpress\n• eCommerce — /web-hosting/ecommerce\n• VPS — /kvm-vps\n• All plans — /pricing\nTell me what you are building and I will point to the matching plan. I will not guess a price unless the live catalog lists it.`,
  },
  {
    test: /email|mailbox|webmail|mx/,
    text: `Business email on your own domain starts at /business-email. Pick a plan, connect a domain you already own or register one here, then choose the mailbox name. I will not invent mailbox prices or MX hosts — those stay on that page.`,
  },
  {
    test: /ssl|https|certificate|security/,
    text: `SSL is included on active HostingBeyond hosting plans that list it. Issue or renew it from the hosting service in your account after the domain points at our nameservers. I cannot flip SSL from this chat.`,
  },
  {
    test: /bill|invoice|payment|wallet|refund/,
    text: `Invoices, wallet, and payment history are in your HostingBeyond account billing pages after you sign in. I will not invent a balance, invoice number, or refund. If you are signed in, ask about a specific invoice and I can read stored account records only.`,
  },
  {
    test: /support|ticket|help desk|technical/,
    text: `I can draft a support request from this chat. You still submit it with the ticket card — I will not invent a ticket number or say a live person is on the line.`,
  },
];

export async function groundedBeyondMasterReply(
  question: string,
  search: (query: string) => Promise<AgentDomainSearch> = searchDomainsForAgent,
  firstName?: string | null,
): Promise<GroundedReply> {
  const text = question.trim();
  const who = firstName?.trim();
  if (isAgentGreeting(text)) {
    const hello = who
      ? `Hi ${who}! Tell me what you'd like to get started with — a domain, hosting, business email, or your website — or describe it in your own words.`
      : BEYOND_MASTER_GREETING_REPLY;
    return { text: hello, domains: [] };
  }
  if (wantsBulkDomainSearch(text)) {
    return {
      text: "Bulk domain search is at /bulk-domain-search. You can check up to 10 names together there. Send me one name in this chat, like bakery.com, if you want a live availability check right now.",
      domains: [],
    };
  }
  if (wantsDomainHelp(text)) {
    const query = extractDomainQuery(text);
    if (!query) {
      return {
        text: "Tell me the name you want — for example bakery.com or just bakery — and I will check live availability and nearby extensions. You can also search at /domain-name-search.",
        domains: [],
      };
    }
    const found = await search(query);
    return {
      text: formatDomainSearchForCustomer(found),
      domains: found.results,
    };
  }

  const haystack = text.toLowerCase();
  const guide = CUSTOMER_GUIDES.find((row) => row.test.test(haystack));
  const parts: string[] = [];
  if (guide) parts.push(guide.text);

  const retrieval = retrieveBeyondMasterKnowledge(text);
  if (!guide && retrieval.articles[0]) {
    parts.push(
      `Related help: ${retrieval.articles[0].title}. Open the matching HostingBeyond page in this reply if one is listed, or tell me the next step you want.`,
    );
  }

  const intent = catalogIntent(text);
  if (intent.hostingSlugs.length > 0 || intent.tlds.length > 0) {
    try {
      const { readLiveCatalogForAgent } =
        await import("@/lib/beyond-master/knowledge/build");
      const catalog = await readLiveCatalogForAgent(intent);
      if (catalog) parts.push(catalog);
    } catch {
      parts.push(
        "Live catalog prices could not be read just now. Use /pricing and /domain-name-search instead of guessed amounts.",
      );
    }
  }

  if (parts.length === 0) {
    return {
      text: `${who ? `${who}, I` : "I"} can check a domain, run you through bulk search, compare hosting, or set up business email. Tell me which one, or send a name like example.com.`,
      domains: [],
    };
  }
  return { text: parts.join("\n\n"), domains: [] };
}
