import {
  readAgentHostingPlans,
  readAgentTldPrices,
  type AgentHostingPlan,
} from "@/lib/beyond-master/catalog-read";
import {
  extractDomainQuery,
  isAgentGreeting,
  wantsBulkDomainSearch,
  wantsDomainHelp,
} from "@/lib/beyond-master/domain-intent";
import {
  domainSearchHref,
  formatDomainSearchForCustomer,
  searchDomainsForAgent,
  type AgentDomainSearch,
  type AgentDomainSuggestion,
} from "@/lib/beyond-master/domain-search";
import {
  detectAgentLanguage,
  type AgentLanguage,
} from "@/lib/beyond-master/language";
import { agentCopy } from "@/lib/beyond-master/replies";

export type GroundedReply = {
  text: string;
  domains: AgentDomainSuggestion[];
  language: AgentLanguage;
};

type Topic =
  "dns" | "hosting" | "email" | "ssl" | "billing" | "support" | "website";

const TOPIC_TESTS: Array<{ topic: Topic; test: RegExp }> = [
  {
    topic: "dns",
    test: /dns|nameserver|name server|a record|aaaa|cname|\bmx\b|\btxt\b|spf|dkim|dmarc|\bsrv\b|\bttl\b|नेमसर्भर|नेमसर्वर|डीएनएस|डिएनएस|रिकॉर्ड|रेकर्ड/i,
  },
  {
    topic: "email",
    test: /e-?mail|mailbox|webmail|mail server|इमेल|ईमेल|मेलबक्स|मेलबॉक्स/i,
  },
  {
    topic: "ssl",
    test: /\bssl\b|https|certificate|सर्टिफिकेट|प्रमाणपत्र/i,
  },
  {
    topic: "billing",
    test: /invoice|billing|payment|wallet|refund|इनभ्वाइस|बिलिङ|भुक्तानी|भुगतान|वॉलेट|रिफंड|बैलेंस|ब्यालेन्स/i,
  },
  {
    topic: "support",
    test: /support|ticket|help ?desk|सहयोग|टिकट|सपोर्ट/i,
  },
  {
    topic: "hosting",
    test: /hosting|wordpress|vps|server|plan|price|pricing|cost|compare|होस्टिङ|होस्टिंग|प्लान|मूल्य|कीमत|दाम|सर्भर|सर्वर/i,
  },
  {
    topic: "website",
    test: /website|web site|site down|error 5\d\d|not opening|वेबसाइट|साइट|वेबसाईट/i,
  },
];

const GENERIC_TLDS = ["com", "net", "org", "io", "dev", "shop", "online"];

function detectTopic(text: string): Topic | null {
  return TOPIC_TESTS.find((row) => row.test.test(text))?.topic ?? null;
}

function formatPlans(plans: AgentHostingPlan[]): string {
  return plans
    .slice(0, 6)
    .map((plan) => {
      const specs = [
        plan.storage,
        plan.websiteLimit ? `${plan.websiteLimit} sites` : null,
        plan.emailAccounts ? `${plan.emailAccounts} mailboxes` : null,
      ].filter(Boolean);
      const specText = specs.length ? ` — ${specs.join(", ")}` : "";
      return `• ${plan.product} ${plan.planName}: ${plan.monthly} ${plan.currency}/mo or ${plan.yearly} ${plan.currency}/yr${specText} · ${plan.path}`;
    })
    .join("\n");
}

export async function groundedBeyondMasterReply(
  question: string,
  search: (query: string) => Promise<AgentDomainSearch> = searchDomainsForAgent,
  firstName?: string | null,
): Promise<GroundedReply> {
  const text = question.trim();
  const language = detectAgentLanguage(text);
  const copy = agentCopy(language);
  const who = firstName?.trim() || null;

  if (isAgentGreeting(text)) {
    return { text: copy.greeting(who), domains: [], language };
  }

  if (wantsBulkDomainSearch(text)) {
    return { text: copy.bulkSearch, domains: [], language };
  }

  if (wantsDomainHelp(text)) {
    const query = extractDomainQuery(text);
    if (!query) {
      return { text: copy.askDomainName, domains: [], language };
    }
    const found = await search(query);
    return {
      text: formatDomainSearchForCustomer(found, language),
      domains: found.results,
      language,
    };
  }

  const topic = detectTopic(text);
  if (topic === "dns") return { text: copy.dns, domains: [], language };
  if (topic === "email") return { text: copy.email, domains: [], language };
  if (topic === "ssl") return { text: copy.ssl, domains: [], language };
  if (topic === "billing") return { text: copy.billing, domains: [], language };
  if (topic === "support") return { text: copy.support, domains: [], language };
  if (topic === "website") {
    return { text: copy.website, domains: [], language };
  }

  if (topic === "hosting") {
    const tlds = [...text.matchAll(/\.([a-z]{2,12})\b/gi)]
      .map((match) => match[1]!.toLowerCase())
      .filter((tld) => GENERIC_TLDS.includes(tld));
    if (tlds.length > 0 && !/hosting|vps|wordpress|plan/i.test(text)) {
      const prices = await readAgentTldPrices(tlds);
      if (prices.length === 0) {
        return { text: copy.domainPriceNone, domains: [], language };
      }
      const lines = prices.map(
        (price) =>
          `• ${price.tld}: register ${price.register} ${price.currency}, renew ${price.renew} ${price.currency}, transfer ${price.transfer} ${price.currency}`,
      );
      return {
        text: `${copy.domainPriceHeading(
          tlds.map((tld) => `.${tld}`).join(", "),
        )}\n${lines.join("\n")}\n\n${copy.domainFooter(
          domainSearchHref(tlds[0]!),
        )}`,
        domains: [],
        language,
      };
    }
    const plans = await readAgentHostingPlans();
    if (plans.length === 0) {
      return { text: copy.hostingNoCatalog, domains: [], language };
    }
    return {
      text: `${copy.hostingHeading}\n${formatPlans(plans)}\n\n${copy.hostingFooter}`,
      domains: [],
      language,
    };
  }

  return { text: copy.fallback(who), domains: [], language };
}
