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
    seoTitle:
      "HostingBeyond Affiliate Program — Web Hosting, Domains & Email Commissions",
    seoDescription:
      "Affiliate program for HostingBeyond web hosting, WordPress, domain registration, transfers and business email. Commission rules, cookie window, payouts and what you cannot promote.",
    keywords:
      "HostingBeyond affiliate program, web hosting affiliate, domain affiliate program, hosting referral commission, WordPress hosting affiliate, business email affiliate",
    eyebrow: "Affiliate program",
    heroTitle: "Earn when someone buys hosting or a domain for real.",
    heroLead:
      "The HostingBeyond affiliate program pays on completed, paid orders — web hosting, WordPress, developer stacks, domain registrations, transfers and business email. Wallet top-ups, refunds and chargebacks do not keep commission. This page is the full program brief; rates are in the agreement we send after you apply, not invented here.",
    primaryCta: { label: "Apply as an affiliate", href: "/contact" },
    secondaryCta: { label: "See hosting plans", href: "/web-hosting" },
    sections: [
      {
        id: "overview",
        title: "Program overview",
        body: "Affiliates recommend hosting.theglobalorbit.com with a tracking link. When a new customer signs up through that link and pays for an eligible product, you earn commission on that paid invoice after the product’s refund window. Renewals are not automatic commission unless your agreement says so. We track by account and invoice, not by a vague “lead form”.",
        bullets: [
          "For creators, reviewers, educators and comparison sites — not coupon farms.",
          "You must disclose that you may earn a commission (FTC-style).",
          "Agencies reselling client sites should look at Partners, not this page.",
        ],
      },
      {
        id: "eligible",
        title: "Eligible products",
        body: "Commission applies to catalog products sold on the live checkout: Starter through Professional web hosting, WordPress and eCommerce hosting, Python and Node developer plans, cloud and VPS where checkout is open, domain registrations and transfers we sell, SSL where it is a paid product, and business email mailboxes. Anything not sold on the site is not eligible.",
        bullets: [
          "Web hosting — monthly or annual billing.",
          "Domain years paid at registration or transfer.",
          "Business email on a domain the customer controls.",
          "No commission on wallet credit alone if it is later refunded.",
        ],
      },
      {
        id: "not-eligible",
        title: "What does not count",
        body: "Self-referrals, your own company accounts, coupon-only traffic with no real customer, and orders that are fully refunded or charged back do not keep commission. We do not pay on typosquatting, forced clicks, or hidden iframes. Bidding on the HostingBeyond brand name in paid search is not allowed unless we agree in writing.",
        bullets: [
          "Existing customers who were already in the panel before your link.",
          "Internal test accounts.",
          "Orders cancelled before the refund window closes.",
        ],
      },
      {
        id: "tracking",
        title: "Tracking and cookies",
        body: "After approval you get a unique referral URL. A cookie records the last click before signup for a limited window. Last-click attribution wins when multiple affiliates touched the same visitor. If the customer clears cookies and returns without your link, we cannot invent the referral.",
        bullets: [
          "Use the link we give you — do not edit the parameter.",
          "Deep-link to plan pages only if the link still carries the tag.",
          "UTM labels for your analytics are fine; they must not strip the affiliate id.",
        ],
      },
      {
        id: "payout",
        title: "Payouts",
        body: "Commission is calculated on the net paid amount on the invoice after tax and coupons, unless the agreement says otherwise. Payout runs after the refund period on that product. Hosting annual plans pay on the first paid invoice for that order. Domain commissions attach to the registration year paid through your link. Minimum payout threshold and payment method (bank, PayPal or similar) are in your agreement — this page does not publish a rate table.",
        bullets: [
          "We can hold payout while refund rate is investigated.",
          "Fraud or refund-cycling closes the affiliate account.",
          "Tax forms or VAT details may be required before payout.",
        ],
      },
      {
        id: "creative",
        title: "Approved messaging",
        body: "You may quote live plan names, NVMe storage where the plan page says it, free SSL on hosted sites, annual billing at 10% off monthly, and WHOIS privacy where the domain page says it applies. You may not claim unlimited bandwidth, fake uptime badges, worldwide datacenter maps, or “we are Hostinger” comparisons. Prices on your landing page must match the live catalog or link straight to our checkout.",
        bullets: [
          "Use screenshots from the current site, not last year’s pricing.",
          "Say “affiliate link” or “I may earn a commission” near the CTA.",
          "Do not promise support SLAs we do not publish.",
        ],
      },
      {
        id: "channels",
        title: "Channels that work",
        body: "Long-form YouTube reviews, course modules, migration guides, newsletter recommendations and honest comparison tables work. Spam comment drops, malware browser extensions and fake “HostingBeyond coupon” sites do not. If your entire channel is only discount codes with no content, we will decline or pause the account.",
        bullets: [
          "Blog posts that walk through DNS, SSL and first deploy.",
          "Regional language content is welcome when disclosure is clear.",
          "Paid ads on non-brand terms are allowed with honest copy.",
        ],
      },
      {
        id: "apply",
        title: "How to apply",
        body: "Use the contact page. Subject line: Affiliate application. Tell us your site or channel URL, audience geography, how you currently recommend hosting or domains, and whether you run paid ads. We reply with the agreement and your link when the fit is real. We do not auto-approve every application.",
        bullets: [
          "Include two examples of hosting or domain content you published.",
          "Say if you also run an agency — we may route you to Partners.",
          "We do not negotiate rates in the first email.",
        ],
      },
    ],
    faqs: [
      {
        id: "cookie",
        question: "How long does the referral cookie last?",
        answer:
          "Thirty days from the first qualifying click, last-click wins. Exact parameters are in the affiliate agreement we send after approval.",
      },
      {
        id: "rate",
        question: "What commission rate do affiliates get?",
        answer:
          "Rates are in your signed agreement. This public page does not list percentages because they can change by product and region. We will not ask you to promote a rate that is not in your agreement.",
      },
      {
        id: "paypal",
        question: "How are payouts sent?",
        answer:
          "Method and minimum threshold are in the agreement — commonly bank transfer or PayPal where supported. Payout is after the refund window on each product.",
      },
      {
        id: "renewal",
        question: "Do I earn on renewals?",
        answer:
          "Only if your agreement says so. Default is commission on the first paid invoice for the referred order, not every renewal year.",
      },
      {
        id: "coupon",
        question: "Can I share a private coupon code?",
        answer:
          "Only codes we issue to you for the program. Inventing “HOSTING50” style codes is not allowed. Public site pricing and official promos are what you should cite.",
      },
      {
        id: "brand",
        question: "Can I bid on “HostingBeyond” in Google Ads?",
        answer:
          "No, unless we agree in writing. You may bid on generic hosting and domain terms with honest copy and disclosure.",
      },
      {
        id: "partner",
        question: "Is this the same as the partner program?",
        answer:
          "No. Affiliates refer end customers with a link. Agencies and resellers who bill clients or need white-label setup should read the Partner page and contact us about reseller hosting.",
      },
      {
        id: "decline",
        question: "Why would an application be declined?",
        answer:
          "Coupon-only sites, brand-term bidding, missing disclosure, refund-cycling history, or an audience that does not match hosting and domains. A decline is not permanent — fix the channel and reapply.",
      },
    ],
  }),
  partners: page({
    seoTitle:
      "HostingBeyond Partner Program — Agencies, Resellers & Technology",
    seoDescription:
      "Partner with HostingBeyond for agency workflows, reseller hosting, client migrations, domains, business email and integrations. How billing, support and white-label work.",
    keywords:
      "HostingBeyond partner program, agency web hosting, reseller hosting partner, white label hosting, hosting migration partner, domain portfolio agency, WooCommerce agency hosting",
    eyebrow: "Partner program",
    heroTitle: "If you already serve sites, plug into our stack.",
    heroLead:
      "The HostingBeyond partner path is for agencies, freelancers and regional hosts who bill clients for web hosting, domains, SSL and business email — not for link exchanges or coupon sites. Reseller hosting is the self-serve catalog entry; custom white-label, nameserver branding and portfolio migrations are scoped in a partner conversation.",
    primaryCta: { label: "Start a partner conversation", href: "/contact" },
    secondaryCta: { label: "Reseller hosting", href: "/web-hosting/reseller" },
    sections: [
      {
        id: "overview",
        title: "Who the partner program is for",
        body: "You run client sites today — WordPress shops, business sites, mail on custom domains, or small portfolios you migrate off another host. Partners need predictable checkout, DNS and SSL that match the live catalog, and support that knows when a ticket came from a reseller’s client. If you only want a referral link and commission, use the Affiliate page instead.",
        bullets: [
          "Digital agencies and freelance developers.",
          "Regional hosts moving a client base to HostingBeyond.",
          "Integrators who need a stable API surface — not a logo swap.",
        ],
      },
      {
        id: "agency",
        title: "Agencies and freelancers",
        body: "You can bill clients yourself and provision on HostingBeyond, or send clients to our checkout under their own login. We help with launch checklists: DNS cutover, SSL issuance, mailbox migration, and staging on developer plans. You keep the relationship; we run the infrastructure behind the catalog you see on hosting.theglobalorbit.com.",
        bullets: [
          "WordPress, WooCommerce and marketing sites on managed plans.",
          "Staging and git-friendly stacks on Professional-tier developer hosting.",
          "One login per client — you are not forced to share your master password.",
        ],
      },
      {
        id: "reseller",
        title: "Reseller hosting path",
        body: "Reseller hosting is the productized way to sell HostingBeyond plans under your brand where the catalog allows it. Limits, plan tiers and included features are on the Reseller hosting page — we do not duplicate a moving price table here. You own onboarding and tier-one questions; escalations should identify the reseller account.",
        bullets: [
          "Read catalog limits on /web-hosting/reseller before you pitch clients.",
          "Client sites provision after paid orders, same as direct customers.",
          "Addons (domains, mailboxes, SSL) follow live checkout rules.",
        ],
      },
      {
        id: "migration",
        title: "Client migrations",
        body: "Portfolio moves are scheduled work, not a magic one-click. Send a domain list, current host, CMS type, and mailbox count. We plan DNS TTL reduction, file and database export, and mail cutover windows. Rush jobs need a real deadline — “go live Friday” without backups is not a migration plan.",
        bullets: [
          "Website migration guide and transfer flows on the public site apply.",
          "Large mailbox moves may need staged MX changes.",
          "Downtime risk is lowest when DNS and certs are prepared before cutover.",
        ],
      },
      {
        id: "domains",
        title: "Domains and email at scale",
        body: "Partners often manage dozens of domains for clients. Search, register, and transfer use the same NameSilo-backed flow as retail customers. Business email mailboxes attach to domains the client controls. WHOIS privacy and renewal reminders follow product pages — do not promise features that are not on the live domain or email catalog.",
        bullets: [
          "Portfolio transfers are per-domain orders, not a bulk fantasy form.",
          "DNS records are editable from the customer panel when the domain is here.",
          "Affiliate links do not replace partner billing — pick one model per client.",
        ],
      },
      {
        id: "support",
        title: "Support and escalation",
        body: "Direct customers open tickets from their login. Reseller clients should open tickets that name the reseller or use the process you agree in onboarding. We prioritize site-down and mail delivery failures. Design reviews and plugin conflicts are billable agency work unless your partner agreement says otherwise.",
        bullets: [
          "Status page at /resources/status for platform incidents.",
          "Help Center articles cover DNS, SSL, panel basics.",
          "Do not promise 24/7 phone support we do not publish.",
        ],
      },
      {
        id: "billing",
        title: "Billing models",
        body: "Three common patterns: client pays HostingBeyond directly; you pay and rebill on your invoice; reseller hosting bundles margin in your price. Stripe checkout on the site is for end-customer card payments. Wallet and invoices in the panel follow the same refund windows as retail — your contract with your client is yours to enforce.",
        bullets: [
          "Annual hosting is 10% off monthly on eligible plans — quote live prices.",
          "Refunds on our side can affect reseller margin — plan accordingly.",
          "Tax and VAT treatment depends on your entity and region.",
        ],
      },
      {
        id: "tech",
        title: "Technology and integrations",
        body: "Production integrations today include card payments (Stripe), domain registrar APIs, Google sign-in on the customer panel, and Orbit CMS for staff. New integrations ship when there is an owner and a security review — we do not add logos to the homepage without a live integration. If you need webhook or SSO scope, describe the production use case in your partner email.",
        bullets: [
          "AI Agent on the site requires configured model keys — not a partner perk.",
          "Do not embed the panel in an iframe without discussing security first.",
          "Sandbox or staging access is negotiated, not automatic.",
        ],
      },
      {
        id: "apply",
        title: "Start the conversation",
        body: "Contact us with subject Partner inquiry. Include your company site, countries you serve, approximate active client sites, current host stack, and whether you need reseller catalog only or custom white-label. We respond with fit, next steps, and whether to start on Reseller hosting or a scoped call.",
        bullets: [
          "Link one or two representative client projects (with permission).",
          "Say if you also publish affiliate content — we may route dual models.",
          "We do not sign NDAs before a basic fit check.",
        ],
      },
    ],
    faqs: [
      {
        id: "white",
        question: "Can I fully white-label the customer panel?",
        answer:
          "Reseller hosting covers branded client sites within catalog limits. A fully white-labeled HostingBeyond customer panel, custom domain on the panel, or your legal entity on every receipt is a custom partner scope — not a self-serve toggle.",
      },
      {
        id: "affiliate",
        question: "Partner program vs affiliate program?",
        answer:
          "Partners bill or provision for clients and may use reseller hosting. Affiliates earn commission on referred retail checkouts via a tracking link. Many agencies are partners only; creators and reviewers often fit affiliates better.",
      },
      {
        id: "minimum",
        question: "Is there a minimum number of clients?",
        answer:
          "Reseller hosting has catalog minimums on the product page. Custom partner deals expect a real client base or migration pipeline — we do not onboard empty “future reseller” accounts.",
      },
      {
        id: "migration-time",
        question: "How long does a portfolio migration take?",
        answer:
          "Depends on site count, mail volume, DNS control, and source host cooperation. Small sites can move in days; dozens of sites with mail need a written schedule. Rush without backups increases risk.",
      },
      {
        id: "ns",
        question: "Can we use custom nameservers?",
        answer:
          "Retail DNS uses HostingBeyond nameservers unless the product says otherwise. Custom NS branding for resellers is partner-scope — ask during onboarding with your domain list.",
      },
      {
        id: "client-support",
        question: "Who supports the end client?",
        answer:
          "By default you handle tier-one questions. Platform outages and provisioning failures escalate to HostingBeyond when the ticket identifies the reseller and affected service.",
      },
      {
        id: "woo",
        question: "Do you support WooCommerce agencies?",
        answer:
          "Yes on WordPress and eCommerce hosting plans sold on the site. Resource limits follow the plan page — load testing and custom plugin audits are your project scope.",
      },
      {
        id: "decline",
        question: "When do we decline a partner request?",
        answer:
          "Link-exchange pitches, no real clients, refusal to identify who owns support, or demands for unpublished SLAs and pricing. Fix the gap and reapply when the model is clear.",
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
