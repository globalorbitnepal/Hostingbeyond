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
    seoTitle:
      "HostingBeyond Infrastructure — Platform, NVMe Hosting, SSL & Payments",
    seoDescription:
      "How HostingBeyond runs hosting.theglobalorbit.com: Next.js app, customer panel, Orbit CMS, Postgres, Stripe payments, domain APIs, SSL inventory and hosting provisioning. Honest scope, no fake PoP maps.",
    keywords:
      "HostingBeyond infrastructure, NVMe web hosting stack, hosting control panel, Stripe hosting payments, domain registrar API, SSL certificate management, HostingBeyond data center",
    eyebrow: "Platform & infrastructure",
    heroTitle: "The stack behind hosting.theglobalorbit.com.",
    heroLead:
      "This page explains the production HostingBeyond platform — public marketing site, logged-in customer panel, Orbit staff CMS, domain and hosting checkout, TLS, and the services behind the catalog. It is documentation for customers and partners, not a made-up global network diagram.",
    primaryCta: { label: "Web hosting plans", href: "/web-hosting" },
    secondaryCta: { label: "System status", href: "/resources/status" },
    sections: [
      {
        id: "overview",
        title: "What this page covers",
        body: "HostingBeyond is a web hosting, domain, SSL, and business email provider operated from the United States with customers worldwide. You interact with us through this site and the customer panel. Staff operate content, pricing, and operational tools through Orbit. Physical hosting for the plans you purchase is provisioned per product — details appear on plan pages and in support, not as generic marketing numbers here.",
        bullets: [
          "Live hostname: hosting.theglobalorbit.com.",
          "Customer panel at /account after sign-in.",
          "Status and incidents at /resources/status.",
        ],
      },
      {
        id: "edge",
        title: "Public site and TLS",
        body: "The marketing site and authenticated customer routes are served over HTTPS on the live hostname. Reverse proxy TLS terminates in front of the application. Certificate expiry and mixed-content issues are operational concerns — Orbit staff can monitor SSL inventory for customer domains hosted with us.",
        bullets: [
          "HTTPS enforced on the public hostname customers bookmark.",
          "Free SSL on active hosting where the product includes it.",
          "Premium SSL certificates are a paid catalog item when offered.",
        ],
      },
      {
        id: "app",
        title: "Application architecture",
        body: "The product is built as a modern web application (Next.js) with server-rendered and client-rendered routes. Business data for orders, accounts, domains, hosting entitlements, invoices, and wallet balances lives in a Postgres database. Background jobs and registrar calls run through the same codebase — not a separate “ghost” admin nobody maintains.",
        bullets: [
          "Public catalog pages and checkout share one deployment line.",
          "Orbit CMS powers staff edits to pages, pricing copy, and editorial content.",
          "AI Agent on the site responds only when an API key is configured in Orbit.",
        ],
      },
      {
        id: "auth",
        title: "Accounts and sign-in",
        body: "Customers create accounts with email and password or supported OAuth providers where enabled (for example Google sign-in when configured). Staff use separate Orbit authentication with role-based access. There is no shared password between your client sites and the HostingBeyond panel — panel login is for billing and services you bought here.",
        bullets: [
          "Session security follows current framework defaults and staff hardening.",
          "Orbit roles limit who can change prices, refunds, or customer data.",
          "Do not paste panel credentials into client WordPress admin.",
        ],
      },
      {
        id: "payments",
        title: "Payments, invoices, and wallet",
        body: "Card checkout uses Stripe. Paid invoices create entitlements — hosting packages, domain years, mailboxes, SSL orders — as rows you can see in the panel. Wallet top-ups are a separate balance path from line-item invoices; refunds follow product refund windows and can reverse dependent services.",
        bullets: [
          "Stripe webhooks reconcile payment success and failure.",
          "Invoice PDFs and history live in the customer account.",
          "We do not store full card numbers on HostingBeyond servers.",
        ],
      },
      {
        id: "domains",
        title: "Domains and DNS",
        body: "Domain search, registration, transfer, and lifecycle operations call registrar APIs (NameSilo-backed flows on the live site). DNS management for domains on file is exposed in the panel when the product allows it. WHOIS privacy and renewal behavior follow the domain product pages — not promises invented in sales email.",
        bullets: [
          "Bulk search is rate-limited to protect registrar API stability.",
          "Nameserver changes propagate at DNS TTL, not instantly.",
          "Transfers need auth codes and unlocked domains at the losing registrar.",
        ],
      },
      {
        id: "host",
        title: "Hosting and provisioning",
        body: "Catalog plans — Starter through Professional tiers, WordPress, eCommerce, Python, Node, Laravel, Django, Nest, cloud, VPS, and reseller — are defined on their product pages. After a paid hosting order, provisioning runs against our hosting stack; you receive panel credentials or onboarding email when the product is ready. NVMe and resource limits are stated per plan, not as one global unlimited banner.",
        bullets: [
          "No provisioning before payment clears.",
          "Developer stacks match the language pages in the main nav.",
          "Migrations from other hosts are projects — see the migration resources.",
        ],
      },
      {
        id: "email",
        title: "Business email",
        body: "Business email mailboxes are sold as mail on domains you control. DNS records for MX, SPF, and DKIM are part of cutover. Mail storage and anti-abuse limits follow the business email product page. We do not claim infinite mailbox storage unless the live catalog says so.",
        bullets: [
          "Mail requires correct MX pointing at our mail infrastructure.",
          "New mailboxes provision after paid orders like other products.",
          "Delivery issues often trace to DNS — check records before opening a ticket.",
        ],
      },
      {
        id: "ops",
        title: "Operations, monitoring, and honesty",
        body: "We maintain a status resource for platform-visible incidents. We do not publish fabricated Tbps figures, anonymous “Tier IV everywhere” badges, or maps of cities we do not actually serve from. When you need facility or network detail for compliance, ask support with your plan SKU and region; answers depend on what you purchased.",
        bullets: [
          "Incident communication prefers the status page over social rumors.",
          "Backups and retention follow plan and product documentation.",
          "Security reports: use contact with a clear reproduction path.",
        ],
      },
    ],
    faqs: [
      {
        id: "dc",
        question: "Where are the servers?",
        answer:
          "The product you buy on a plan page determines provisioning region and stack. This marketing page does not replace that detail. Support or provisioning email gives facility-specific answers when they apply to your order.",
      },
      {
        id: "nvme",
        question: "Is storage NVMe?",
        answer:
          "Plans that advertise NVMe on their product page use that storage class for the included disk. Cheaper tiers list their own limits. Read the plan card before you compare us to another host’s homepage.",
      },
      {
        id: "uptime",
        question: "What uptime do you guarantee?",
        answer:
          "We publish status during incidents. A formal uptime SLA, if any, is in your service terms or plan-specific agreement — not a number we invent on this infrastructure page.",
      },
      {
        id: "backups",
        question: "Are backups included?",
        answer:
          "Backup scope depends on the hosting product. Some plans include automated backups; others expect you to configure your own. Check the plan features list and help articles before assuming nightly snapshots.",
      },
      {
        id: "ddos",
        question: "Do you offer DDoS protection?",
        answer:
          "Edge and hosting providers may include baseline mitigation. We do not claim unmetered DDoS scrubbing on every tier. Ask support for what applies to your plan if you are under attack.",
      },
      {
        id: "data",
        question: "Where is customer data stored?",
        answer:
          "Account, billing, and order data live in our application database. Mail and website files reside on the hosting and mail systems tied to your products. Cross-border questions need your specific services listed.",
      },
      {
        id: "orbit",
        question: "What is Orbit?",
        answer:
          "Orbit is the internal staff CMS and operations console for HostingBeyond — content, pricing, editorial pages, SSL monitoring tools, and admin workflows. Customers use the public site and /account, not Orbit.",
      },
      {
        id: "status",
        question: "How do I check if the platform is down?",
        answer:
          "Start at /resources/status. If your site alone is down, the issue is often DNS, SSL, or your CMS — not a global outage.",
      },
    ],
  }),
  help: page({
    seoTitle:
      "HostingBeyond Help Center — Hosting, DNS, SSL, Email & Billing Support",
    seoDescription:
      "Help Center for HostingBeyond customers: web hosting, WordPress, domain DNS, transfers, SSL, business email MX/SPF/DKIM, invoices, wallet and the customer panel. Guides, tickets and AI chat scope.",
    keywords:
      "HostingBeyond help center, hosting support ticket, domain DNS help, SSL certificate help, business email MX setup, WordPress hosting support, billing and invoice help, customer panel login",
    eyebrow: "Help Center",
    heroTitle:
      "Start here when something on your site, domain or mail is stuck.",
    heroLead:
      "Most HostingBeyond support issues are DNS, nameservers, SSL, mailbox records, or checkout that never finished — not mystery “server outages.” This Help Center maps what we cover, where the step-by-step articles live, and how to open a ticket with the details engineers actually need.",
    primaryCta: { label: "Contact support", href: "/contact" },
    secondaryCta: { label: "Customer panel", href: "/login" },
    sections: [
      {
        id: "scope",
        title: "What support covers",
        body: "We help with products sold on hosting.theglobalorbit.com: web hosting and WordPress, developer stacks, domain registration and transfer, SSL on domains you host with us, business email, Stripe checkout failures, invoices, wallet balance, and navigation of the customer panel. We do not debug unrelated SaaS, third-party themes you bought elsewhere, or local ISP Wi‑Fi.",
        bullets: [
          "Hosting on plans listed in the main catalog.",
          "Domains and DNS when the domain is on your HostingBeyond account.",
          "Mail delivery when MX points at our mail product.",
          "Billing tied to invoices you can see in /account.",
        ],
      },
      {
        id: "dns",
        title: "DNS and nameservers",
        body: "“Site not found” usually means nameservers still point at the old host, an A record is wrong, or propagation has not finished. In the panel, open the domain and compare NS and A/AAAA to what your hosting plan email says. After you change DNS, wait for TTL — we cannot skip global resolver caches.",
        bullets: [
          "Use our nameservers when the domain is registered here and DNS is managed in-panel.",
          "www vs apex: both need records if you expect both to work.",
          "Transfers need unlock and auth code at the losing registrar first.",
        ],
      },
      {
        id: "ssl",
        title: "SSL and HTTPS errors",
        body: "Certificate errors in the browser come from expired certs, wrong hostname on the cert, or mixed HTTP content. Free SSL on eligible hosting renews when the product includes it; premium SSL is ordered like any other product. Send support the exact hostname, expiry date from the browser cert viewer, and whether you recently changed DNS.",
        bullets: [
          "Redirect HTTP to HTTPS in your CMS after the cert is valid.",
          "Let’s Encrypt-style failures often trace to DNS not pointing at us yet.",
          "Do not email private keys — use panel tools.",
        ],
      },
      {
        id: "hosting",
        title: "Web hosting and WordPress",
        body: "For blank pages, 500 errors, or disk limits, note the URL, when it started, and recent changes (plugin, theme, cron). We can verify provisioning and platform issues; custom plugin conflicts may need your developer. Staging on developer plans is the safe place to test upgrades.",
        bullets: [
          "Check /resources/status before assuming a global outage.",
          "Migration help starts at the website migration resource.",
          "Reseller clients should name the reseller in the ticket.",
        ],
      },
      {
        id: "email",
        title: "Business email",
        body: "New mailboxes need paid orders and correct MX, SPF, and DKIM. Mail “works in panel but not Gmail” is almost always DNS. After you add records, allow propagation before re-testing. We do not read your inbox content in tickets — describe bounces and headers when you have them.",
        bullets: [
          "Buy mailboxes on the business email page before asking for MX values.",
          "Remove duplicate MX records at old hosts.",
          "Autodiscover issues are usually DNS or client config.",
        ],
      },
      {
        id: "billing",
        title: "Checkout, invoices, and wallet",
        body: "If Stripe checkout failed, note the time in UTC and whether the bank declined. Paid orders should appear under invoices and services in the panel. Wallet top-ups are separate from cart checkout — refunds follow product windows and can reverse dependent services.",
        bullets: [
          "Do not send card numbers or CVV in email.",
          "PDF invoices download from the account billing area.",
          "Tax and receipt details come from the invoice row, not chat guesses.",
        ],
      },
      {
        id: "paths",
        title: "Where to go first",
        body: "Logged-in customers should open tickets from the panel so we see your services. Guests use /contact. Long checklists live in the Knowledge Base; launch and migration walkthroughs live in Hosting guides. AI chat on the site is the Beyond assistant — useful for routing, not authoritative for live prices or your private DNS.",
        bullets: [
          "Knowledge Base: /resources/knowledge-base",
          "Guides: /resources/guides",
          "Security tips: /resources/security",
          "Platform incidents: /resources/status",
        ],
      },
      {
        id: "ticket",
        title: "Writing a ticket we can act on",
        body: "Include account email, domain or site URL, error text (not “it’s broken”), and what you already tried. For downtime, state if only you are affected or many users. For SSL, attach cert dates. We prioritize site-down and mail delivery over general how-to questions already answered in the Knowledge Base.",
        bullets: [
          "Never paste passwords — reset in panel if needed.",
          "One issue per ticket keeps threads readable.",
          "Screenshot the browser error, not only the desktop.",
        ],
      },
      {
        id: "chat",
        title: "AI chat vs human support",
        body: "Public-site chat answers from configured models and site content. It can suggest articles and contact paths. It does not replace a ticket for account-specific DNS edits, refunds, or provisioning delays. When chat and the panel disagree, trust the panel and live catalog pages.",
        bullets: [
          "AI Agent does not run when no model key is configured.",
          "Do not share panel MFA codes in chat.",
          "Escalation always ends at a human via contact or panel.",
        ],
      },
    ],
    faqs: [
      {
        id: "hours",
        question: "When is support available?",
        answer:
          "Tickets are worked on every day. Site-down, SSL, and mail delivery failures are prioritized over general billing questions and how-to items covered in the Knowledge Base.",
      },
      {
        id: "panel",
        question: "Where do I open a ticket?",
        answer:
          "Sign in at /login and use Support in the customer panel so the ticket links to your services. If you cannot log in, use /contact with the account email and domain.",
      },
      {
        id: "phone",
        question: "Is there phone support?",
        answer:
          "We do not list a public phone line on this site unless the contact page shows one for your region. Tickets and email are the supported channels.",
      },
      {
        id: "response",
        question: "How fast will you reply?",
        answer:
          "Response time depends on queue and severity. Outages and TLS issues move ahead of policy questions. We do not promise a specific minute SLA on this page.",
      },
      {
        id: "refund",
        question: "Can support issue refunds?",
        answer:
          "Refunds follow product refund windows and invoice state. Support can explain eligibility; approved refunds appear on the payment method per Stripe rules.",
      },
      {
        id: "third",
        question: "Do you fix my WordPress plugin?",
        answer:
          "We verify hosting and platform health. Conflicts in third-party plugins or custom code are between you and your developer unless the issue is clearly server-side.",
      },
      {
        id: "not-customer",
        question: "I am not a customer yet — can I get help?",
        answer:
          "Pre-sales questions go through contact or sales paths on the site. We will not configure DNS for domains you have not ordered here.",
      },
      {
        id: "status",
        question: "Is HostingBeyond down right now?",
        answer:
          "Check /resources/status. If only your site fails, inspect DNS and SSL first.",
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
