export type CmsEditorialLink = { label: string; href: string };

export type CmsEditorialSection = {
  id: string;
  title: string;
  body: string;
  bullets: string[];
};

export type CmsEditorialFaq = { id: string; question: string; answer: string };

export type CmsEditorialPageContent = {
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  eyebrow: string;
  heroTitle: string;
  heroLead: string;
  primaryCta: CmsEditorialLink;
  secondaryCta: CmsEditorialLink;
  sections: CmsEditorialSection[];
  faqs: CmsEditorialFaq[];
};

export const EDITORIAL_PAGES = [
  {
    slug: "careers",
    path: "/about/careers",
    label: "Careers",
    category: "company" as const,
  },
  {
    slug: "affiliates",
    path: "/about/affiliates",
    label: "Affiliate program",
    category: "company" as const,
  },
  {
    slug: "partners",
    path: "/about/partners",
    label: "Partner with us",
    category: "company" as const,
  },
  {
    slug: "infrastructure",
    path: "/about/infrastructure",
    label: "Our infrastructure",
    category: "company" as const,
  },
  {
    slug: "help",
    path: "/resources/help",
    label: "Help Center",
    category: "resources" as const,
  },
  {
    slug: "status",
    path: "/resources/status",
    label: "System status",
    category: "resources" as const,
  },
  {
    slug: "knowledge-base",
    path: "/resources/knowledge-base",
    label: "Knowledge Base",
    category: "resources" as const,
  },
  {
    slug: "guides",
    path: "/resources/guides",
    label: "Hosting guides",
    category: "resources" as const,
  },
  {
    slug: "security",
    path: "/resources/security",
    label: "Website security",
    category: "resources" as const,
  },
  {
    slug: "wordpress-tutorials",
    path: "/resources/wordpress",
    label: "WordPress tutorials",
    category: "resources" as const,
  },
] as const;

export type EditorialSlug = (typeof EDITORIAL_PAGES)[number]["slug"];

export function isEditorialSlug(value: string): value is EditorialSlug {
  return EDITORIAL_PAGES.some((page) => page.slug === value);
}

export function editorialPageBySlug(slug: string) {
  return EDITORIAL_PAGES.find((page) => page.slug === slug);
}

export function editorialCmsSlug(slug: EditorialSlug) {
  return `editorial-${slug}`;
}

function page(partial: CmsEditorialPageContent): CmsEditorialPageContent {
  return {
    ...partial,
    sections: partial.sections.map((section, index) => ({
      ...section,
      id: section.id || `section-${index}`,
      bullets: section.bullets ?? [],
    })),
    faqs: partial.faqs.map((faq, index) => ({
      ...faq,
      id: faq.id || `faq-${index}`,
    })),
  };
}

export function defaultEditorialPageContent(
  slug: EditorialSlug,
): CmsEditorialPageContent {
  return CATALOG[slug];
}

export function mergeEditorialPageContent(
  slug: EditorialSlug,
  stored?: Partial<CmsEditorialPageContent> | null,
): CmsEditorialPageContent {
  const fallback = defaultEditorialPageContent(slug);
  if (!stored) return fallback;
  const sections = Array.isArray(stored.sections)
    ? stored.sections
        .filter((row) => row && typeof row.title === "string")
        .map((row, index) => ({
          id: row.id || `section-${index}`,
          title:
            row.title.trim() || fallback.sections[index]?.title || "Section",
          body: row.body?.trim() || "",
          bullets: Array.isArray(row.bullets)
            ? row.bullets.map((item) => String(item)).filter(Boolean)
            : [],
        }))
    : fallback.sections;
  const faqs = Array.isArray(stored.faqs)
    ? stored.faqs
        .filter((row) => row && typeof row.question === "string")
        .map((row, index) => ({
          id: row.id || `faq-${index}`,
          question: row.question.trim(),
          answer: row.answer?.trim() || "",
        }))
    : fallback.faqs;
  return {
    seoTitle: stored.seoTitle?.trim() || fallback.seoTitle,
    seoDescription: stored.seoDescription?.trim() || fallback.seoDescription,
    keywords: stored.keywords?.trim() || fallback.keywords,
    eyebrow: stored.eyebrow?.trim() || fallback.eyebrow,
    heroTitle: stored.heroTitle?.trim() || fallback.heroTitle,
    heroLead: stored.heroLead?.trim() || fallback.heroLead,
    primaryCta: {
      label: stored.primaryCta?.label?.trim() || fallback.primaryCta.label,
      href: stored.primaryCta?.href?.trim() || fallback.primaryCta.href,
    },
    secondaryCta: {
      label: stored.secondaryCta?.label?.trim() || fallback.secondaryCta.label,
      href: stored.secondaryCta?.href?.trim() || fallback.secondaryCta.href,
    },
    sections: sections.length ? sections : fallback.sections,
    faqs: faqs.length ? faqs : fallback.faqs,
  };
}

const CATALOG: Record<EditorialSlug, CmsEditorialPageContent> = {
  careers: page({
    seoTitle: "Careers — Hosting, Domains & Customer Support | HostingBeyond",
    seoDescription:
      "Careers at HostingBeyond: support, engineering and writing roles on live web hosting, domains, SSL, business email and the customer panel. How to apply.",
    keywords:
      "HostingBeyond careers, hosting jobs, web hosting support jobs, domain registrar jobs, customer support hosting, remote hosting jobs",
    eyebrow: "Careers",
    heroTitle: "Build the hosting panel customers actually use.",
    heroLead:
      "HostingBeyond sells web hosting, WordPress, domains, SSL and business email on hosting.theglobalorbit.com. We hire people who can ship, support and explain those products. This page is the full hiring brief — not a wall of invented openings.",
    primaryCta: { label: "Send your profile", href: "/contact" },
    secondaryCta: { label: "About the company", href: "/about" },
    sections: [
      {
        id: "fit",
        title: "Who this is for",
        body: "Roles stay on the live catalog: web hosting plans, WordPress, developer stacks, domain search, transfers, SSL, business email, checkout, invoices and the customer panel. If you have never used a hosting control panel, nameservers or a mailbox DNS record, this is probably not the team.",
        bullets: [
          "Support that can follow one ticket from DNS to SSL to mailbox.",
          "Engineers who have shipped Next.js, Postgres or hosting automation.",
          "Writers who document a real checkout, not generic cloud copy.",
        ],
      },
      {
        id: "support",
        title: "Customer support",
        body: "Support owns the path a paying customer is stuck on. A typical ticket is nameservers that have not propagated, an SSL certificate that is not on the hostname, a mailbox whose MX still points at the old host, or a Stripe checkout that did not finish. You write the answer in the panel ticket so the account history stays attached to the order.",
        bullets: [
          "Read the order, the domain and the invoice before you reply.",
          "Emergency SSL and downtime tickets come before billing questions.",
          "Never ask a customer to paste a password into chat.",
          "Written English is required. More languages are a plus.",
        ],
      },
      {
        id: "engineering",
        title: "Engineering",
        body: "The product is a Next.js application, a Postgres database, Stripe for cards, and registrar APIs for domain search and lifecycle. Orbit is the staff CMS. The customer panel lives at /account. You will fix checkout bugs, search timeouts, SSL inventory and CMS editors that the public site actually renders.",
        bullets: [
          "Production changes land on main and deploy through GitHub Actions.",
          "Do not invent uptime graphs, prices or registrar status.",
          "A paid trial task is scoped, time-boxed and paid.",
        ],
      },
      {
        id: "writing",
        title: "Writing and documentation",
        body: "Public pages, help articles and the knowledge base have to match the panel. If a screenshot disagrees with the live UI, the panel wins and the article gets fixed. We do not publish a careers portal full of roles that are not open.",
        bullets: [
          "Hosting guides, SSL, DNS and business-email DNS are the core topics.",
          "Use current plan names and the live annual discount, not last year’s screenshot.",
          "Developer docs stay separate from the customer knowledge base.",
        ],
      },
      {
        id: "apply",
        title: "How to apply",
        body: "Write from the contact page. Put the seat you want in the first line, attach a short CV or a GitHub link, and add two examples of hosting, domain or support work you have done. We reply when there is a real seat. There is no application form that pretends every role is open.",
        bullets: [
          "Subject line: the role, then your name.",
          "One paragraph on the product area you already know.",
          "Links beat a five-page CV.",
        ],
      },
      {
        id: "week",
        title: "What a week looks like",
        body: "A normal week is production. Checkout edge cases, registrar tickets, SSL renewals, WordPress moves, and edits in Orbit. You talk to customers who have already paid. There is no separate innovation lab that is disconnected from the panel.",
        bullets: [
          "Morning: tickets and failed checkouts from the last day.",
          "Midday: the change you are shipping on main.",
          "Later: docs or CMS copy so the public page matches the panel.",
        ],
      },
      {
        id: "pay",
        title: "How the work is paid",
        body: "Seats are paid. We do not run equity-only internships. A trial, when we use one, has a written scope and a fee agreed before you start. Payout details are in the note we send after we decide there is a seat — this page will not invent a salary band.",
        bullets: [
          "Remote for most seats.",
          "Some infrastructure work needs overlap with the live site’s hours.",
          "Support coverage includes weekends for emergency SSL and downtime.",
        ],
      },
      {
        id: "no",
        title: "What we will not hire for",
        body: "We do not hire people to post fake reviews, to bid on another host’s brand, or to write “unlimited and 99.999%” claims that the product pages do not make. If your portfolio is only that kind of copy, do not apply.",
        bullets: [
          "No link-exchange partnerships dressed up as a job.",
          "No unpaid content mills.",
          "No access to production until the seat is agreed.",
        ],
      },
    ],
    faqs: [
      {
        id: "remote",
        question: "Are HostingBeyond roles remote?",
        answer:
          "Yes for most seats. Support and engineering can work remotely. Some infrastructure work needs overlap with the hours the live site is operated. We say which overlap we need in the reply, not as a vague “hybrid culture” line.",
      },
      {
        id: "open",
        question: "Where is the jobs board?",
        answer:
          "Open seats are named on this page when they exist. If you do not see a named vacancy, send a short note anyway. We keep a small pipeline and reply when a seat is real. We do not list roles just to collect CVs.",
      },
      {
        id: "experience",
        question: "Do I need hosting experience?",
        answer:
          "Yes. Support needs to have used DNS, SSL or a hosting panel. Engineering needs shipped web software, ideally Next.js or Postgres. Writing needs samples that explain a real product step, not a generic “cloud benefits” article.",
      },
      {
        id: "languages",
        question: "Which languages do you need?",
        answer:
          "Written English is required for every public reply and every doc. Hindi or another language you can support customers in is useful. We will not put you on a queue for a language you cannot write clearly.",
      },
      {
        id: "trial",
        question: "Are trial tasks unpaid?",
        answer:
          "No. If we ask for a trial, the task is scoped and paid before you start. We do not use a free “test project” as the interview.",
      },
      {
        id: "stack",
        question: "What stack would I work in?",
        answer:
          "The public site and panel are Next.js. Data is in Postgres. Card payments are Stripe. Domain search and registration go through the registrar API configured for the live site. You do not need every layer on day one. You do need one of them for real.",
      },
      {
        id: "visa",
        question: "Do you sponsor visas?",
        answer:
          "Most seats are remote and do not include visa sponsorship. If a seat needs you in a specific country, that is stated when we reply. Do not assume sponsorship from this page.",
      },
      {
        id: "reply",
        question: "How fast do you reply to applications?",
        answer:
          "When a seat is open, we reply to relevant notes. When no seat is open, we may not reply to every message. A short, specific note is more likely to be kept than a bulk application.",
      },
    ],
  }),
  affiliates: page({
    seoTitle: "HostingBeyond Affiliate Program — Earn on Hosting & Domains",
    seoDescription:
      "Recommend HostingBeyond web hosting, domains and business email. Honest commission rules, cookie window, and what you cannot promote.",
    keywords:
      "hosting affiliate program, domain affiliate, HostingBeyond partners, web hosting referral",
    eyebrow: "Affiliates",
    heroTitle: "Earn when someone buys hosting or a domain for real.",
    heroLead:
      "The affiliate program pays on completed, paid orders — hosting plans, domain registrations, and business email. Refunds reverse the commission.",
    primaryCta: { label: "Apply as an affiliate", href: "/contact" },
    secondaryCta: { label: "See hosting plans", href: "/web-hosting" },
    sections: [
      {
        id: "what",
        title: "What counts",
        body: "A referred customer who creates an account and pays for a HostingBeyond product through your link. Wallet top-ups that are later refunded do not stay as commission.",
        bullets: [
          "Web hosting, WordPress, eCommerce and developer plans.",
          "Domain registrations and eligible transfers.",
          "Business email mailboxes on a domain they own.",
        ],
      },
      {
        id: "rules",
        title: "Rules that keep the program alive",
        body: "No cookie stuffing, no bidding on “HostingBeyond” brand terms, no fake scarcity, no claiming we are Hostinger. We will close accounts that refund-cycle or self-refer.",
        bullets: [
          "Disclose that you may earn a commission.",
          "Use current prices from the live site, not screenshots from last year.",
          "Payouts run after the refund window on the product.",
        ],
      },
      {
        id: "payout",
        title: "How payout works",
        body: "After you apply from the contact form we send a unique tracking link. Commission is calculated on paid invoices after the product refund window. Hosting annual plans pay once on the first invoice, not again on a later renewal unless the agreement says so. Domain years follow the same rule: the registration year that was paid through your link.",
        bullets: [
          "Minimum payout and method are in the affiliate agreement.",
          "Self-referrals and your own company accounts are excluded.",
          "We can pause a link if refund rates spike.",
        ],
      },
      {
        id: "creative",
        title: "What you can say in ads",
        body: "You may quote live plan names (Starter, Growth, Business, Professional) and the fact that annual billing is 10% off monthly. You may not invent datacenter maps, “unlimited” claims, or Hostinger comparisons that are not on this site. If a price on your landing page is older than the live catalog, take it down.",
        bullets: [],
      },
    ],
    faqs: [
      {
        id: "cookie",
        question: "How long does the referral cookie last?",
        answer:
          "Thirty days from the first click, last-click wins. Details are confirmed in the affiliate agreement we send after you apply.",
      },
    ],
  }),
  partners: page({
    seoTitle: "Partner with HostingBeyond — Agencies, Hosts & Registrars",
    seoDescription:
      "Agency, reseller and technology partnerships for HostingBeyond hosting, domains and email. Tell us what you need to resell or embed.",
    keywords:
      "hosting partner program, reseller hosting partner, agency hosting, HostingBeyond partners",
    eyebrow: "Partners",
    heroTitle: "If you already serve sites, plug into our stack.",
    heroLead:
      "Agencies, freelancers, and regional hosts can white-label or resell HostingBeyond plans where the catalog allows it. We do not partner for link exchanges.",
    primaryCta: { label: "Start a partner conversation", href: "/contact" },
    secondaryCta: { label: "Reseller hosting", href: "/web-hosting/reseller" },
    sections: [
      {
        id: "agency",
        title: "Agencies and freelancers",
        body: "Keep billing in your name or send clients to HostingBeyond checkout. We help with migrations, DNS, SSL and mailbox cutover so you are not stuck in WHM at midnight.",
        bullets: [
          "WordPress and WooCommerce launches.",
          "Client domain portfolios under one HostingBeyond login.",
          "Staging-friendly developer stacks on Pro and above.",
        ],
      },
      {
        id: "tech",
        title: "Technology partners",
        body: "We already connect Stripe, domain registrars, and Google sign-in. New integrations ship when they have a production owner — not a logo wall.",
        bullets: [],
      },
      {
        id: "reseller",
        title: "Reseller and regional hosts",
        body: "Reseller hosting is the product path for people who already sell sites. You get client accounts on HostingBeyond infrastructure; you still own the customer relationship. Custom nameserver branding and invoices in your legal name are partner-scope, not a checkbox on checkout.",
        bullets: [
          "Start from the Reseller hosting page for catalog limits.",
          "Migrations of a client portfolio are scheduled, not instant.",
          "Support tickets from your clients should say who the reseller is.",
        ],
      },
    ],
    faqs: [
      {
        id: "white",
        question: "Can I fully white-label the panel?",
        answer:
          "Reseller hosting covers client sites. Full white-label of the HostingBeyond customer panel is a custom partner deal, not a self-serve toggle.",
      },
    ],
  }),
  infrastructure: page({
    seoTitle: "HostingBeyond Infrastructure — Hosting, SSL, Panel & Payments",
    seoDescription:
      "How HostingBeyond runs web hosting, domains, SSL, the customer panel and Stripe checkout. What we operate, and what we do not invent.",
    keywords:
      "HostingBeyond infrastructure, NVMe hosting, SSL, customer panel, Stripe hosting payments",
    eyebrow: "Infrastructure",
    heroTitle: "The stack behind hosting.theglobalorbit.com.",
    heroLead:
      "This page describes the production HostingBeyond platform: public site, customer panel, Orbit CMS, domain orders, hosting checkout, and TLS on the live hostname. It is not a fake global PoP map.",
    primaryCta: { label: "Web hosting plans", href: "/web-hosting" },
    secondaryCta: { label: "System status", href: "/resources/status" },
    sections: [
      {
        id: "edge",
        title: "Public site and TLS",
        body: "The marketing site and customer panel are served at hosting.theglobalorbit.com with HTTPS. Certificates are monitored from Orbit. Mixed-content and expired certs are treated as incidents, not blog posts.",
        bullets: [
          "Forced HTTPS on the live hostname.",
          "Customer SSL inventory for domains you host with us.",
          "Let’s Encrypt-style free certs where hosting is active; premium SSL is a paid product.",
        ],
      },
      {
        id: "app",
        title: "Application layer",
        body: "The product is a Next.js application with a Postgres database, Stripe for card payments, and registrar APIs for domain search and lifecycle. Orbit is the staff CMS. The customer panel is the logged-in account at /account.",
        bullets: [
          "Hosting and domain orders are stored as real rows, not spreadsheets.",
          "Wallet top-ups are separate from invoice totals.",
          "AI Agent replies only when a model key is configured.",
        ],
      },
      {
        id: "host",
        title: "Hosting you buy",
        body: "Catalog plans — Starter through Ultimate, WordPress, eCommerce, Python, Node, Laravel, Django, Nest, Cloud and VPS — are the products we sell. Provisioning follows paid orders. We do not publish a fake “200 Tbps backbone” number.",
        bullets: [],
      },
    ],
    faqs: [
      {
        id: "dc",
        question: "Where are the servers?",
        answer:
          "Plan pages list the product you buy. Physical facility detail is given during provisioning and support, not as marketing fiction on this page.",
      },
    ],
  }),
  help: page({
    seoTitle: "Help Center — Hosting, Domains, Email & Billing | HostingBeyond",
    seoDescription:
      "Get help with HostingBeyond hosting, domain DNS, SSL, business email, invoices and the customer panel. Guides, tickets and live chat.",
    keywords:
      "HostingBeyond help, hosting support, domain DNS help, SSL help, business email support",
    eyebrow: "Help Center",
    heroTitle:
      "Start here when something on your site, domain or mail is stuck.",
    heroLead:
      "Most issues are DNS, SSL, nameservers, or a checkout that did not finish. Use the guides below, then open a ticket if you still cannot move.",
    primaryCta: { label: "Contact support", href: "/contact" },
    secondaryCta: { label: "Customer panel", href: "/login" },
    sections: [
      {
        id: "topics",
        title: "What we can actually help with",
        body: "Support covers products sold on this site: web hosting, WordPress, domains, transfers, SSL, business email, invoices, wallet, and the HostingBeyond panel.",
        bullets: [
          "Nameservers and DNS records for domains registered here.",
          "Free and premium SSL on hosted domains.",
          "Mailbox DNS (MX/SPF/DKIM) after you buy business email.",
          "Failed Stripe checkout, invoices, and wallet credit.",
        ],
      },
      {
        id: "path",
        title: "Fastest path to an answer",
        body: "Logged-in customers should use panel Support so the ticket is tied to the account. Guests can use the contact form. Live chat on the public site is the Beyond AI assistant — it will not invent mailbox prices or DNS records.",
        bullets: [
          "Knowledge Base for step-by-step checklists.",
          "Hosting guides for launch and migration.",
          "System status if the whole site looks down.",
        ],
      },
    ],
    faqs: [
      {
        id: "hours",
        question: "When is support available?",
        answer:
          "Tickets are handled every day. Emergency SSL and downtime tickets are prioritized over billing questions.",
      },
    ],
  }),
  status: page({
    seoTitle: "HostingBeyond System Status — Site, Panel, Checkout & DNS",
    seoDescription:
      "Status of the HostingBeyond website, customer panel, checkout and domain tools. How we report incidents without fake uptime badges.",
    keywords:
      "HostingBeyond status, hosting status page, panel outage, checkout down",
    eyebrow: "System status",
    heroTitle: "Status for HostingBeyond services we operate.",
    heroLead:
      "This is the status page for hosting.theglobalorbit.com, the customer panel, Orbit, Stripe checkout, and domain search. It does not invent a worldwide outage map for every customer origin server.",
    primaryCta: { label: "Report an incident", href: "/contact" },
    secondaryCta: { label: "Open the panel", href: "/login" },
    sections: [
      {
        id: "now",
        title: "How to read this page",
        body: "If this page loads, the public site is up. If login fails, the panel is the incident. If search returns no TLDs, check domain APIs. If pay buttons fail, check Stripe. We update this copy when there is a confirmed incident — we do not paint a green badge over a broken checkout.",
        bullets: [
          "Public website and this status page.",
          "Customer panel at /account.",
          "Hosting and domain checkout.",
          "Domain availability search.",
        ],
      },
      {
        id: "incident",
        title: "During an incident",
        body: "Contact support with the exact URL, the time in UTC, and the error text. Do not send passwords. If TLS looks wrong in the browser, include a screenshot of the certificate viewer.",
        bullets: [],
      },
    ],
    faqs: [
      {
        id: "sla",
        question: "Where is the 99.9% graph?",
        answer:
          "Plan terms cover hosting SLAs. This page reports platform incidents. We will not publish a decorative graph that is not wired to probes.",
      },
    ],
  }),
  "knowledge-base": page({
    seoTitle: "Knowledge Base — DNS, SSL, Email & Panel | HostingBeyond",
    seoDescription:
      "Step-by-step HostingBeyond articles for nameservers, DNS, SSL, WordPress, business email, invoices and account security.",
    keywords:
      "HostingBeyond knowledge base, DNS help, SSL setup, nameservers, business email DNS",
    eyebrow: "Knowledge Base",
    heroTitle: "Short checklists for the tasks customers actually hit.",
    heroLead:
      "These articles match the HostingBeyond panel. If a screenshot disagrees with the live UI, trust the panel and tell support — we will fix the article.",
    primaryCta: { label: "Help Center", href: "/resources/help" },
    secondaryCta: { label: "Developer docs", href: "/resources/docs" },
    sections: [
      {
        id: "dns",
        title: "Domains and DNS",
        body: "Point a domain at HostingBeyond by using the nameservers shown in Domain portfolio. A records, CNAME, MX and TXT are edited under DNS. Transfers need an EPP code from the current registrar.",
        bullets: [
          "Find nameservers on the domain in /account/my-domains.",
          "Wait for TTL before judging a failed cutover.",
          "Do not delete the apex A record until the new host answers.",
        ],
      },
      {
        id: "ssl",
        title: "SSL",
        body: "Free certificates are issued for domains on active hosting. Premium SSL is a separate product. Mixed content (http:// images on an https:// page) is a site issue, not a HostingBeyond outage.",
        bullets: [],
      },
      {
        id: "mail",
        title: "Business email",
        body: "After you buy a mailbox, add the MX and authentication records the panel shows. Gmail and Microsoft 365 will not receive mail on your domain until MX points here.",
        bullets: [],
      },
    ],
    faqs: [
      {
        id: "docs",
        question: "Is this the same as Developer Docs?",
        answer:
          "No. Developer Docs cover Node, Python, Laravel, Django and Nest runtimes. This knowledge base is for DNS, SSL, mail and the panel.",
      },
    ],
  }),
  guides: page({
    seoTitle: "Hosting Guides — Launch, Migrate & Secure | HostingBeyond",
    seoDescription:
      "Practical HostingBeyond hosting guides: launch a site, move WordPress, set SSL, connect a domain, and go live without guesswork.",
    keywords:
      "web hosting guides, migrate WordPress, connect domain to hosting, HostingBeyond tutorials",
    eyebrow: "Hosting guides",
    heroTitle: "Launch and move sites on HostingBeyond without folklore.",
    heroLead:
      "Follow the order: buy hosting, connect the domain, wait for DNS, issue SSL, then move files. Skipping SSL or flipping nameservers first is why sites “disappear” for a day.",
    primaryCta: { label: "Choose a hosting plan", href: "/web-hosting" },
    secondaryCta: { label: "Website migration", href: "/website-migration" },
    sections: [
      {
        id: "launch",
        title: "New site",
        body: "Register or transfer the domain, pick a web hosting or WordPress plan, and complete checkout. Use the panel Websites area once the order is paid. Do not change nameservers until the hosting order is Active.",
        bullets: [
          "Starter and Plus are PHP sites; Node and Python need Pro+ stacks.",
          "WordPress gets its own product page and installer path.",
          "Add business email after the domain is on our nameservers.",
        ],
      },
      {
        id: "move",
        title: "Moving an existing site",
        body: "Use Website Migration if you want us to copy files and database. Keep the old host until you have seen the site on HostingBeyond with a hosts-file test or a temporary URL.",
        bullets: [],
      },
    ],
    faqs: [
      {
        id: "ttl",
        question: "How long does DNS take?",
        answer:
          "Often minutes, sometimes up to the TTL on the old records (commonly 1 hour to 48 hours). We cannot flush Google’s resolver for you.",
      },
    ],
  }),
  security: page({
    seoTitle: "Website Security — SSL, Updates & Access | HostingBeyond",
    seoDescription:
      "How HostingBeyond helps lock down WordPress and PHP sites: TLS, updates, SSH, backups talk, and what still stays your job.",
    keywords:
      "website security, WordPress security, SSL HTTPS, HostingBeyond security",
    eyebrow: "Website security",
    heroTitle: "HTTPS is the start of security, not the whole job.",
    heroLead:
      "HostingBeyond issues SSL, isolates plans, and keeps the panel behind login and optional 2FA. Plugin patches, admin passwords, and application firewalls are still yours unless you buy a security add-on.",
    primaryCta: { label: "SSL certificates", href: "/web-hosting/ssl" },
    secondaryCta: {
      label: "Account security",
      href: "/account/profile/security",
    },
    sections: [
      {
        id: "tls",
        title: "Transport",
        body: "Every hosted site should redirect to HTTPS. Free certificates cover standard hostnames on active hosting. Wildcard and organisation-validated certs are premium products.",
        bullets: [],
      },
      {
        id: "app",
        title: "WordPress and PHP apps",
        body: "Keep core, themes and plugins updated. Remove unused admin users. Do not share the panel password in chat. Enable 2FA on the HostingBeyond account.",
        bullets: [
          "Unique admin URL and strong passwords.",
          "Disable file editing in wp-config when you can.",
          "Backups before every major plugin leap.",
        ],
      },
    ],
    faqs: [
      {
        id: "hack",
        question: "Do you malware-clean hacked sites?",
        answer:
          "Support can isolate a plan and restore from a backup you have. Full malware forensics is a billed incident, not a free chat.",
      },
    ],
  }),
  "wordpress-tutorials": page({
    seoTitle: "WordPress Tutorials — Hosting, SSL & Mail | HostingBeyond",
    seoDescription:
      "WordPress tutorials for HostingBeyond: install, connect a domain, SSL, email, WooCommerce sizing, and what belongs on WordPress hosting vs generic web hosting.",
    keywords:
      "WordPress tutorials, WordPress hosting guide, HostingBeyond WordPress, WooCommerce hosting",
    eyebrow: "WordPress tutorials",
    heroTitle: "WordPress on HostingBeyond, from first install to HTTPS.",
    heroLead:
      "Use WordPress Hosting when WordPress is the product. Generic web hosting can run PHP, but the WordPress path is the one we test for admin, permalinks and WooCommerce.",
    primaryCta: { label: "WordPress hosting", href: "/web-hosting/wordpress" },
    secondaryCta: { label: "Hosting guides", href: "/resources/guides" },
    sections: [
      {
        id: "install",
        title: "Install",
        body: "After a paid WordPress plan is Active, use the installer in the panel. Choose the domain that already points here. Do not install into a random subdomain you will throw away unless you like mixed certificates.",
        bullets: [],
      },
      {
        id: "https",
        title: "SSL and permalinks",
        body: "Issue SSL, set WordPress URLs to https://, then Settings → Permalinks. If the site loops, the siteurl in the database still says http://.",
        bullets: [],
      },
      {
        id: "woo",
        title: "WooCommerce",
        body: "Catalog size and checkout spikes belong on Commerce plans, not the smallest WordPress SKU. Object cache and PHP workers matter more than a decorative “Woo optimized” badge.",
        bullets: [],
      },
    ],
    faqs: [
      {
        id: "multi",
        question: "Multisite?",
        answer:
          "Ask support before enabling multisite. Domain mapping and SSL for extra sites are easy to get wrong on shared plans.",
      },
    ],
  }),
};
