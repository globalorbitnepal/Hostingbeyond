import { catalogIntent } from "@/lib/beyond-master/knowledge/catalog";
import { retrieveBeyondMasterKnowledge } from "@/lib/beyond-master/knowledge/retrieve";
import {
  extractDomainQuery,
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
    text: `Public hosting pages:\n• Web Hosting — /web-hosting\n• WordPress — /web-hosting/wordpress\n• eCommerce — /web-hosting/ecommerce\n• Business / cloud — /cloud-hosting\n• VPS — /kvm-vps, /nvme-vps, /linux-vps, /managed-vps\n• Pricing overview — /pricing\nTell me the stack (WordPress, Node.js, a shop, or a VPS) and I will narrow this.`,
  },
  {
    test: /email|mailbox|webmail|mx/,
    text: `Business email setup starts at /business-email. You will need a domain you control, then mailbox name and password. DNS (MX, and often SPF/DKIM/DMARC) is copied from that product page — I will not invent mail-host values.`,
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
): Promise<GroundedReply> {
  const text = question.trim();
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
      text: "I can help with domains, hosting, websites, business email, DNS, SSL, and billing on HostingBeyond. Tell me what you want to do, or send a domain like example.com to search it.",
      domains: [],
    };
  }
  return { text: parts.join("\n\n"), domains: [] };
}
