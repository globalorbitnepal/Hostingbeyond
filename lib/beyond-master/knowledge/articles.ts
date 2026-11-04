import type { BeyondMasterKnowledgeCategory } from "@/lib/beyond-master/knowledge/categories";

export type BeyondMasterKnowledgeArticle = {
  slug: string;
  category: BeyondMasterKnowledgeCategory;
  title: string;
  body: string;
  keywords: string[];
  published: boolean;
  source: "builtin" | "database";
};

/**
 * Verified from application routes, the hosting product registry, the DNS
 * writer’s allowed types, and the support-ticket gate. Prices and plan
 * specifications are not stored here.
 */
export const BEYOND_MASTER_BUILTIN_ARTICLES: BeyondMasterKnowledgeArticle[] = [
  {
    slug: "domain-management",
    category: "domain-management",
    title: "Domain management",
    published: true,
    source: "builtin",
    keywords: [
      "manage domain",
      "my domains",
      "nameserver",
      "nameservers",
      "domain panel",
      "डोमेन",
      "नेमसर्भर",
      "नेमसर्वर",
      "डोमेन व्यवस्थापन",
    ],
    body: `Customers manage domains they already hold at /account/my-domains.
Nameserver and DNS changes for a domain are done from that domain in the customer account.
This chat cannot see which domains a customer owns, their expiry dates, or their current nameservers.
Do not invent a nameserver hostname. If the customer needs the values HostingBeyond expects, they must read them on the domain page in the account.
Searching for a new name is a different task and starts at /domain-name-search.`,
  },
  {
    slug: "domain-registration-renewal",
    category: "domain-registration",
    title: "Domain registration and renewal",
    published: true,
    source: "builtin",
    keywords: [
      "register domain",
      "buy domain",
      "renew domain",
      "domain transfer",
      "tld",
      "domain price",
      "domain search",
      ".com",
      ".net",
      ".org",
      ".io",
      "डोमेन दर्ता",
      "डोमेन रिन्यू",
      "डोमेन खरिद",
      "स्थानान्तरण",
    ],
    body: `New domain search is at /domain-name-search. Bulk search is at /bulk-domain-search. Transfer starts at /domain-transfer.
The cart is /cart and domain checkout is /get-started.
Retail register, renew, and transfer amounts are stored per extension in the domain price catalog. Quote a price only when a live catalog block in this prompt lists that extension, currency, and amount. Otherwise say the price is on the domain search page and do not guess it.
This chat can check live availability for a name the customer provides and suggest nearby extensions. It cannot complete registration, renewal, or transfer; those finish on /domain-name-search, /domain-transfer, or /cart.
A transfer does not by itself change DNS. The existing website and mail keep using the current nameservers and records until those are changed in the domain panel.`,
  },
  {
    slug: "dns-configuration",
    category: "dns",
    title: "DNS configuration",
    published: true,
    source: "builtin",
    keywords: [
      "dns",
      "a record",
      "aaaa",
      "cname",
      "mx",
      "txt",
      "spf",
      "dkim",
      "dmarc",
      "srv",
      "ttl",
      "डीएनएस",
      "डिएनएस",
      "रिकॉर्ड",
      "रेकर्ड",
    ],
    body: `The domain panel can edit these DNS types: A, AAAA, CNAME, MX, TXT, NS, and SRV.
The default TTL used by the panel is 3600 seconds. MX and SRV use a priority; other types do not.
An A value must be an IPv4 address. An AAAA value must be an IPv6 address. CNAME and MX values must be hostnames. TXT is the type used for SPF, DKIM, and DMARC.
Do not invent SPF, DKIM, DMARC, or mail-host values. The customer copies those from the email service they are connecting.
This chat cannot read or change the zone. The customer edits records from the domain in /account/my-domains.
DNS changes are not instant. This knowledge base does not state a propagation guarantee.`,
  },
  {
    slug: "shared-hosting",
    category: "shared-hosting",
    title: "Shared hosting",
    published: true,
    source: "builtin",
    keywords: [
      "shared hosting",
      "web hosting",
      "wordpress hosting",
      "ecommerce hosting",
      "cloud hosting",
      "business hosting",
      "वेब होस्टिंग",
      "साझा होस्टिंग",
      "वर्डप्रेस",
    ],
    body: `Shared and website hosting products in the catalog are Web Hosting (/web-hosting), WordPress Hosting (/web-hosting/wordpress), eCommerce Hosting (/web-hosting/ecommerce), and Business Hosting (/cloud-hosting).
Comparison of public prices is also linked from /pricing.
Plan name, monthly price, yearly price, currency, storage, bandwidth, websites, databases, email accounts, SSL text, and backup text come only from a live catalog block in this prompt. If that block is absent or a field is empty, say the figure is not in the retrieved catalog and link the product page. Do not fill the gap from memory.
This chat cannot create a hosting order or change an existing hosting service.`,
  },
  {
    slug: "developer-hosting",
    category: "developer-hosting",
    title: "Developer hosting",
    published: true,
    source: "builtin",
    keywords: [
      "developer hosting",
      "python hosting",
      "laravel",
      "django",
      "nestjs",
      "पाइथन",
      "लारावेल",
    ],
    body: `Developer hosting product pages are Node.js (/nodejs-hosting), Python (/web-hosting/python), Laravel (/laravel-hosting), Django (/django-hosting), and NestJS (/nestjs-hosting).
Which runtime, SSH access, database, or price is included depends on the active plan row. Use only a live catalog block for those specifications. Do not claim a plan tier includes Node.js, SSH, or a database unless that catalog row says so.
This chat cannot deploy code or open a shell.`,
  },
  {
    slug: "vps-hosting",
    category: "vps",
    title: "VPS hosting",
    published: true,
    source: "builtin",
    keywords: [
      "vps",
      "kvm",
      "nvme vps",
      "linux vps",
      "managed vps",
      "virtual server",
      "भीपीएस",
    ],
    body: `VPS product pages are KVM VPS (/kvm-vps), NVMe VPS (/nvme-vps), Linux VPS (/linux-vps), and Managed VPS (/managed-vps). The VPS index is /vps.
CPU, memory, disk, traffic, and price must come from a live catalog block. If the catalog block is missing, send the customer to the matching product page and do not invent a server size.
This chat cannot provision, resize, reboot, or reinstall a VPS.`,
  },
  {
    slug: "nodejs-hosting",
    category: "nodejs",
    title: "Node.js hosting",
    published: true,
    source: "builtin",
    keywords: ["node.js", "nodejs", "node hosting", "नोड", "नोडजेएस"],
    body: `The Node.js hosting product page is /nodejs-hosting.
Do not state which plan includes a Node.js runtime, npm, or SSH unless the live catalog block for nodejs-hosting says so. Entry-level marketing copy is not a specification.
This chat cannot install Node.js, start a process, or deploy an application.`,
  },
  {
    slug: "git-deployment",
    category: "git-deployment",
    title: "Git deployment",
    published: true,
    source: "builtin",
    keywords: [
      "git",
      "github",
      "gitlab",
      "deploy",
      "deployment",
      "गिट",
      "डिप्लॉय",
    ],
    body: `The hosting product registry has no Git deployment product and no one-click GitHub or GitLab deploy action.
Do not invent a deploy key, webhook URL, branch, or build command.
For application hosting, use the developer hosting pages: /nodejs-hosting, /web-hosting/python, /laravel-hosting, /django-hosting, and /nestjs-hosting.
This chat cannot pull a repository or deploy a site.`,
  },
  {
    slug: "ssl-security",
    category: "ssl",
    title: "SSL and security",
    published: true,
    source: "builtin",
    keywords: [
      "ssl",
      "tls",
      "https",
      "certificate",
      "एसएसएल",
      "प्रमाणपत्र",
      "सर्टिफिकेट",
    ],
    body: `The public SSL page is /web-hosting/ssl.
A hosting plan may store an SSL note in the catalog. Repeat that note only when the live catalog block includes it. Do not promise automatic issuance, a wildcard certificate, or a renewal interval unless that same catalog text says so.
This chat cannot issue, upload, or renew a certificate.
Account sign-in security settings are at /account/security. This chat cannot change passwords or sessions.`,
  },
  {
    slug: "business-email",
    category: "business-email",
    title: "Business email",
    published: true,
    source: "builtin",
    keywords: [
      "business email",
      "mailbox",
      "email hosting",
      "ईमेल",
      "इमेल",
      "व्यवसायिक इमेल",
    ],
    body: `Business email is a hosting add-on named Business Email (slug business-email) described as professional email for your domain.
The public page is /business-email. Checkout for that product is /checkout/business-email. Mailboxes for a signed-in customer are managed at /account/email.
The default add-on is eligible for website and business hosting categories and uses the hosting billing mode. Do not quote a mailbox price unless a live catalog block in this prompt lists it. This knowledge base does not contain a mailbox price.
Mail delivery also needs MX and usually TXT records on the domain. Copy those values from the email setup screen. Do not invent them.
This chat cannot create a mailbox or edit DNS.`,
  },
  {
    slug: "website-troubleshooting",
    category: "troubleshooting",
    title: "Website troubleshooting",
    published: true,
    source: "builtin",
    keywords: [
      "website down",
      "not loading",
      "error 500",
      "404",
      "troubleshoot",
      "site not working",
      "वेबसाइट",
      "साइट डाउन",
      "खुल्दैन",
    ],
    body: `This chat cannot open the customer's website, hosting logs, or DNS zone.
Useful checks the customer can do themselves: confirm the domain is in /account/my-domains, confirm the A or CNAME record points where the hosting page says, and confirm HTTPS only after a certificate exists for that hostname.
Do not claim the site was checked, that a record is correct, or that an error code has a single cause.
If the customer needs a person to look at the account, use the support article.`,
  },
  {
    slug: "billing-invoices",
    category: "billing",
    title: "Billing and invoices",
    published: true,
    source: "builtin",
    keywords: [
      "invoice",
      "billing",
      "payment",
      "refund",
      "wallet",
      "receipt",
      "बिल",
      "इनभ्वाइस",
      "भुक्तानी",
      "रिफण्ड",
    ],
    body: `Signed-in billing pages are /account/billing, /account/invoices, /account/orders, /account/hosting-orders, and /account/wallet.
This chat cannot see invoice numbers, balances, payment status, or wallet amounts, and it cannot take a payment.
No refund policy is stored in this knowledge base. Do not describe refund windows, partial refunds, or guarantees. Tell the customer that the knowledge base does not contain a refund policy and that billing questions about an existing charge belong on the invoice page or with support.`,
  },
  {
    slug: "technical-support",
    category: "support",
    title: "Technical support",
    published: true,
    source: "builtin",
    keywords: [
      "support",
      "ticket",
      "contact",
      "human",
      "help desk",
      "सहायता",
      "सहयोग",
      "टिकट",
      "सपोर्ट",
    ],
    body: `A support ticket is created only after the customer reviews the request in Beyond Master AI and presses Submit Ticket. A sentence in chat is not authorization.
Live chat with a support agent is not connected. The ticket is marked for a person to review later.
If the ticket cannot be saved, email hello@hostingbeyond.com. Do not invent a ticket number or say that an email was delivered.
The account support page is /account/support and the public contact page is /contact.
The older account ticket API remains unavailable and is separate from Beyond Master tickets.`,
  },
];
