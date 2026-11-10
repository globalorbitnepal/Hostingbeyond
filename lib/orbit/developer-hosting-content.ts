import { routes } from "@/config/routes";

/**
 * Developer hosting page content.
 *
 * Developer pages cannot reuse `CmsHostingPageContent` because that model is
 * WordPress-centric (WordPress spotlight, WooCommerce comparison copy). These
 * five routes previously rendered that shared content verbatim, which is why
 * every page advertised "Managed WordPress".
 *
 * Stored in `PageContent.sections` (JSON) — no schema migration required.
 */

export type DeveloperStackKey =
  | "nodejs-hosting"
  | "python-hosting"
  | "laravel-hosting"
  | "django-hosting"
  | "nestjs-hosting";

export type DeveloperFeatureIcon =
  | "zap"
  | "shield"
  | "globe"
  | "server"
  | "terminal"
  | "database"
  | "git"
  | "lock";

export type DeveloperFeature = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
  icon: DeveloperFeatureIcon;
  /** False when the capability is not yet available on the platform. */
  available?: boolean;
};

export type DeveloperUseCase = {
  id: string;
  visible: boolean;
  title: string;
  description: string;
};

export type DeveloperFaq = {
  id: string;
  visible: boolean;
  question: string;
  answer: string;
};

export type DeveloperPlanNote = {
  id: string;
  planKey: string;
  note: string;
};

export type CmsDeveloperHostingContent = {
  /** H1 supporting line above the title. */
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  heroPromo: string;
  heroHighlights: string[];

  /** Section 2 — technology-specific benefits. */
  benefitsEyebrow: string;
  benefitsHeading: string;
  benefitsDescription: string;
  benefits: DeveloperUseCase[];

  /** Section 3 — verified capabilities only. */
  featuresEyebrow: string;
  featuresHeading: string;
  featuresDescription: string;
  features: DeveloperFeature[];

  /** Section 4 — who this is for. */
  useCasesEyebrow: string;
  useCasesHeading: string;
  useCasesDescription: string;
  useCases: DeveloperUseCase[];

  /** Section 5 — pricing block headings (plan data comes from the catalog). */
  pricingEyebrow: string;
  pricingTitle: string;
  pricingTitleAccent: string;
  pricingDescription: string;
  pricingNote: string;
  planNotes: DeveloperPlanNote[];

  /** Section 6 — plan selection guidance. */
  comparisonEyebrow: string;
  comparisonHeading: string;
  comparisonDescription: string;
  comparisonBullets: string[];

  /** Section 7 — FAQ. */
  faqHeading: string;
  faqDescription: string;
  faqs: DeveloperFaq[];

  /** Section 8 — closing CTA. */
  closingHeading: string;
  closingDescription: string;
  closingCtaLabel: string;
  closingCtaHref: string;
};

const SUPPORT_LINE =
  "24/7 support from people who run Linux servers, not a script reading a flowchart.";

/** Honest capability statement reused across developer pages. */
const PROVISIONING_DISCLOSURE =
  'HostingBeyond does not yet automate developer account provisioning. When you order, your order is recorded and payment is verified, and our team provisions the account — the status stays "Paid — awaiting activation" until that work is complete. Nothing is marked active before it actually exists.';

function base(
  overrides: Pick<
    CmsDeveloperHostingContent,
    | "heroEyebrow"
    | "heroTitle"
    | "heroTitleAccent"
    | "heroDescription"
    | "heroPromo"
    | "heroHighlights"
    | "benefitsEyebrow"
    | "benefitsHeading"
    | "benefitsDescription"
    | "benefits"
    | "featuresEyebrow"
    | "featuresHeading"
    | "featuresDescription"
    | "features"
    | "useCasesEyebrow"
    | "useCasesHeading"
    | "useCasesDescription"
    | "useCases"
    | "pricingEyebrow"
    | "pricingTitle"
    | "pricingTitleAccent"
    | "pricingDescription"
    | "comparisonEyebrow"
    | "comparisonHeading"
    | "comparisonDescription"
    | "comparisonBullets"
    | "faqHeading"
    | "faqDescription"
    | "faqs"
    | "closingHeading"
    | "closingDescription"
  >,
): CmsDeveloperHostingContent {
  return {
    ...overrides,
    heroPrimaryLabel: "View plans",
    heroPrimaryHref: "#plans",
    heroSecondaryLabel: "Explore features",
    heroSecondaryHref: "#features",
    pricingNote:
      "Prices are in US dollars. The monthly rate shown is the first-term price; the renewal rate for your selected billing cycle is displayed at checkout before you pay.",
    planNotes: [],
    closingCtaLabel: "Compare plans",
    closingCtaHref: "#plans",
  };
}

/* ------------------------------------------------------------------ Node.js */

function nodejs(): CmsDeveloperHostingContent {
  return base({
    heroEyebrow: "Node.js hosting",
    heroTitle: "Ship Node.js apps",
    heroTitleAccent: "without managing a server.",
    heroDescription:
      "Host REST APIs, Express services, and full-stack JavaScript apps on Linux with NVMe storage, HTTPS by default, and the same account you use for domains and email.",
    heroPromo: "Node.js runtime available on Pro, Ultimate & Cloud plans",
    heroHighlights: [
      "Node.js runtime on Pro and above",
      "npm install over SSH",
      "Free SSL for every app domain",
      "NVMe storage for build-heavy apps",
    ],
    benefitsEyebrow: "Why Node.js on HostingBeyond",
    benefitsHeading: "One account for your API, domain and TLS",
    benefitsDescription:
      "Node.js workloads need a runtime, a process to keep them alive, and certificates that renew themselves. All three are handled on the same Linux account instead of three separate vendors.",
    benefits: [
      {
        id: "runtime",
        visible: true,
        title: "Node.js runtime on Pro and above",
        description:
          "The Node.js runtime is enabled on Pro, Ultimate, and Cloud plans. Entry plans run PHP only, so start at Pro if Node.js is your primary stack.",
      },
      {
        id: "npm",
        visible: true,
        title: "npm works the way you expect",
        description:
          "SSH access on Pro and above lets you run npm install and npm run build against your own package.json, then restart the app yourself.",
      },
      {
        id: "https",
        visible: true,
        title: "HTTPS without extra work",
        description:
          "Every domain gets a free SSL certificate that renews automatically, so API clients and browsers never hit a certificate warning.",
      },
      {
        id: "stack",
        visible: true,
        title: "Pair it with MySQL",
        description:
          "Keep application data in MySQL on the same account, or point the app at an external database if you already run one.",
      },
    ],
    featuresEyebrow: "Capabilities",
    featuresHeading: "What is actually included",
    featuresDescription:
      "Every item below is part of the current platform. Anything we do not provide is listed separately so you can plan around it.",
    features: [
      {
        id: "runtime",
        visible: true,
        title: "Node.js runtime",
        description:
          "Enabled on Pro, Ultimate, and Cloud plans. Entry plans are PHP-only.",
        icon: "server",
      },
      {
        id: "ssh",
        visible: true,
        title: "SSH access",
        description:
          "Included on Pro and above, so you can install dependencies and inspect logs.",
        icon: "terminal",
      },
      {
        id: "npm",
        visible: true,
        title: "npm & package.json",
        description:
          "Install and build from your own lockfile over SSH — no custom build server required.",
        icon: "git",
      },
      {
        id: "mysql",
        visible: true,
        title: "MySQL databases",
        description:
          "Create and manage MySQL databases from the control panel alongside your app.",
        icon: "database",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free automatic SSL",
        description:
          "Issued and renewed automatically for every domain on the account.",
        icon: "lock",
      },
      {
        id: "nvme",
        visible: true,
        title: "NVMe storage",
        description:
          "Faster dependency installs and log reads than SATA-backed shared hosting.",
        icon: "zap",
      },
      {
        id: "node-process-manager",
        visible: true,
        title: "Node process manager",
        description:
          "A Node.js application process manager is not enabled on this platform today. Apps are started and supervised over SSH, so you stay in control of restarts.",
        icon: "server",
        available: false,
      },
      {
        id: "git-deploy",
        visible: true,
        title: "Git push-to-deploy",
        description:
          "Automatic deploys on git push are not available. Clone or pull over SSH instead.",
        icon: "git",
        available: false,
      },
    ],
    useCasesEyebrow: "Is this a fit?",
    useCasesHeading: "Good fit for Node.js workloads",
    useCasesDescription:
      "HostingBeyond developer hosting suits small teams shipping focused services. It is not a replacement for a container platform or an autoscaling cluster.",
    useCases: [
      {
        id: "rest-api",
        visible: true,
        title: "REST and JSON APIs",
        description:
          "Express, Fastify, or a plain http server behind HTTPS, serving mobile apps or a separate frontend.",
      },
      {
        id: "fullstack",
        visible: true,
        title: "Full-stack JavaScript",
        description:
          "A server-rendered app that also serves its own static assets from the same account.",
      },
      {
        id: "webhooks",
        visible: true,
        title: "Webhook and integration endpoints",
        description:
          "Receive events from Stripe, GitHub, or internal tools on a stable public HTTPS URL.",
      },
      {
        id: "internal",
        visible: true,
        title: "Internal tools",
        description:
          "Small dashboards and admin panels for a team, where predictable monthly cost matters more than elastic scaling.",
      },
    ],
    pricingEyebrow: "Plans",
    pricingTitle: "Pick a plan with",
    pricingTitleAccent: "Node.js enabled",
    pricingDescription:
      "Every Node.js plan — Starter, Growth, Business, and Professional — includes the Node.js runtime, SSH, and Git. Pick RAM and storage for the apps you run.",
    comparisonEyebrow: "Choosing a plan",
    comparisonHeading: "Which plan do you need?",
    comparisonDescription:
      "Start from the runtime requirement, then check storage and memory headroom for your build step.",
    comparisonBullets: [
      "Starter runs one Node.js app on 1 GB RAM and 10 GB NVMe.",
      "Growth fits a few production apps on 2 GB RAM and 25 GB NVMe.",
      "Business is the usual pick: more RAM, daily backups, and room for several apps.",
      "Professional is for heavier builds — 4 GB RAM, 4 vCPU, and 100 GB NVMe.",
      "Upgrade any time; the plan change keeps your files, databases, and domains.",
    ],
    faqHeading: "Node.js hosting questions",
    faqDescription:
      "Straight answers about runtime, deployment and what happens after you order.",
    faqs: [
      {
        id: "which-plan",
        visible: true,
        question: "Which plan do I need to run Node.js?",
        answer:
          "All four Node.js plans include the runtime: Starter, Growth, Business, and Professional. You do not need a separate VPS.",
      },
      {
        id: "deploy",
        visible: true,
        question: "How do I deploy my application?",
        answer:
          "SSH into the account, clone or pull your repository, run npm install and your build, then start the process. Git deployment is included on every Node.js plan.",
      },
      {
        id: "process",
        visible: true,
        question: "Is there a Node.js process manager?",
        answer:
          "You start and restart the Node.js process over SSH on every plan. There is no separate VPS product — Professional is the highest shared Node.js tier.",
      },
      {
        id: "versions",
        visible: true,
        question: "Which Node.js versions can I run?",
        answer:
          "The Node.js runtime is installed on every Node.js plan. Confirm the exact version you need with support before you migrate a production app.",
      },
      {
        id: "ssl",
        visible: true,
        question: "Do I get SSL for my API domain?",
        answer:
          "Yes. Every domain on the account receives a free SSL certificate that renews automatically, including subdomains you point at the API.",
      },
      {
        id: "provisioning",
        visible: true,
        question: "What happens after I order?",
        answer: PROVISIONING_DISCLOSURE,
      },
      {
        id: "upgrade",
        visible: true,
        question: "Can I upgrade later?",
        answer:
          "Yes. You can move between plans without losing files, databases, or domains. Moving up takes effect on the same account, so there is no migration project.",
      },
    ],
    closingHeading: "Run Node.js on infrastructure you do not have to babysit",
    closingDescription: `NVMe storage, automatic HTTPS, and ${SUPPORT_LINE}`,
  });
}

/* ------------------------------------------------------------------- Python */

function python(): CmsDeveloperHostingContent {
  return base({
    heroEyebrow: "Python hosting",
    heroTitle: "Host Python apps",
    heroTitleAccent: "on managed Linux.",
    heroDescription:
      "Run Flask, Django, and FastAPI projects with pip, virtual environments, MySQL, and free SSL — on the same account as your domains and business email.",
    heroPromo: "Python runtime available on Pro, Ultimate & Cloud plans",
    heroHighlights: [
      "CPython on Linux, Pro and above",
      "pip and virtualenv over SSH",
      "MySQL databases included",
      "Free automatic SSL",
    ],
    benefitsEyebrow: "Why Python on HostingBeyond",
    benefitsHeading: "Virtual environments, not version roulette",
    benefitsDescription:
      "Python projects live or die on dependency isolation. You get SSH on Pro and above, so each app keeps its own virtual environment and its own pinned requirements file.",
    benefits: [
      {
        id: "venv",
        visible: true,
        title: "One virtual environment per app",
        description:
          "Create a venv per project over SSH and pin exact versions in requirements.txt, so two apps on one account never fight over a dependency.",
      },
      {
        id: "frameworks",
        visible: true,
        title: "Flask, Django and FastAPI",
        description:
          "These are the frameworks our team supports running on the platform. Any WSGI or ASGI app you can start over SSH is your call to make.",
      },
      {
        id: "mysql",
        visible: true,
        title: "MySQL for application data",
        description:
          "Django and SQLAlchemy work against MySQL databases you create from the control panel. PostgreSQL is not offered on shared developer hosting.",
      },
      {
        id: "cron",
        visible: true,
        title: "Scheduled tasks",
        description:
          "Run management commands and maintenance scripts on a schedule from the control panel cron manager.",
      },
    ],
    featuresEyebrow: "Capabilities",
    featuresHeading: "What is actually included",
    featuresDescription:
      "Confirmed platform capabilities for Python workloads, with the gaps called out explicitly.",
    features: [
      {
        id: "python",
        visible: true,
        title: "CPython on Linux",
        description:
          "Python runtime enabled on Pro, Ultimate, and Cloud plans.",
        icon: "server",
      },
      {
        id: "pip",
        visible: true,
        title: "pip and virtualenv",
        description:
          "Install packages into an isolated environment over SSH on Pro and above.",
        icon: "terminal",
      },
      {
        id: "mysql",
        visible: true,
        title: "MySQL databases",
        description:
          "Create and manage MySQL databases from the control panel.",
        icon: "database",
      },
      {
        id: "cron",
        visible: true,
        title: "Cron scheduling",
        description:
          "Schedule management commands and background maintenance tasks.",
        icon: "zap",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free automatic SSL",
        description:
          "Certificates issued and renewed automatically for every domain.",
        icon: "lock",
      },
      {
        id: "ssh",
        visible: true,
        title: "SSH access",
        description: "Included on Pro and above for deploys and debugging.",
        icon: "terminal",
      },
      {
        id: "postgres",
        visible: true,
        title: "PostgreSQL",
        description:
          "PostgreSQL is not offered on shared developer hosting. MySQL is the supported database; use a VPS or Cloud plan if you need PostgreSQL managed by you.",
        icon: "database",
        available: false,
      },
      {
        id: "asgi-manager",
        visible: true,
        title: "Managed ASGI/WSGI supervisor",
        description:
          "There is no platform-managed process supervisor for Python apps today. You start your WSGI or ASGI process over SSH.",
        icon: "server",
        available: false,
      },
    ],
    useCasesEyebrow: "Is this a fit?",
    useCasesHeading: "Good fit for Python workloads",
    useCasesDescription:
      "Well suited to focused web apps and internal services. Not intended for GPU work, heavy data pipelines, or long-running background clusters.",
    useCases: [
      {
        id: "flask",
        visible: true,
        title: "Flask APIs and small sites",
        description:
          "A focused JSON API or server-rendered site with a handful of routes.",
      },
      {
        id: "django",
        visible: true,
        title: "Django applications",
        description:
          "Content-driven Django projects using MySQL, the admin, and scheduled management commands.",
      },
      {
        id: "fastapi",
        visible: true,
        title: "FastAPI services",
        description:
          "Typed APIs with automatic OpenAPI docs, serving a frontend or mobile client.",
      },
      {
        id: "scripts",
        visible: true,
        title: "Scheduled Python jobs",
        description:
          "Data sync, reporting, and cleanup scripts that run from cron without a separate scheduler.",
      },
    ],
    pricingEyebrow: "Plans",
    pricingTitle: "Pick a plan with",
    pricingTitleAccent: "Python enabled",
    pricingDescription:
      "Python runs on Pro, Ultimate, and Cloud plans. Host your app, your marketing site, and your email under one account.",
    comparisonEyebrow: "Choosing a plan",
    comparisonHeading: "Which plan do you need?",
    comparisonDescription:
      "Match the plan to your dependency footprint and expected concurrency.",
    comparisonBullets: [
      "Python is not available on Beyond Essential or Beyond Plus — choose Pro or above.",
      "Beyond Pro (40 GB NVMe, 6 GB memory) covers typical Flask and Django projects.",
      "Beyond Ultimate (60 GB NVMe, 8 GB memory) gives more headroom for larger dependency sets.",
      "Cloud hosting adds dedicated RAM and vCPU for memory-hungry data work.",
      "Plan changes keep your files, databases, and domains intact.",
    ],
    faqHeading: "Python hosting questions",
    faqDescription: "Deployment, framework support, and account limitations.",
    faqs: [
      {
        id: "which-plan",
        visible: true,
        question: "Which plan do I need for Python?",
        answer:
          "Python is enabled on Beyond Pro, Beyond Ultimate, and Cloud hosting. Beyond Essential and Beyond Plus are PHP-only.",
      },
      {
        id: "frameworks",
        visible: true,
        question: "Do you support Django and Flask?",
        answer:
          "Yes. Django, Flask, and FastAPI are the frameworks our team supports running on the platform. You install them yourself with pip inside a virtual environment over SSH.",
      },
      {
        id: "postgres",
        visible: true,
        question: "Can I use PostgreSQL?",
        answer:
          "PostgreSQL is not offered on shared developer hosting. MySQL is the supported database on these plans. If you need PostgreSQL, a VPS or Cloud plan lets you install and manage it yourself.",
      },
      {
        id: "deploy",
        visible: true,
        question: "How do I deploy updates?",
        answer:
          "SSH in on Pro or above, pull your code, activate the virtual environment, install requirements, and restart your app process. Automatic git push-to-deploy is not available today.",
      },
      {
        id: "cron",
        visible: true,
        question: "Can I run scheduled tasks?",
        answer:
          "Yes. Cron scheduling is available from the control panel, which covers Django management commands and periodic scripts.",
      },
      {
        id: "provisioning",
        visible: true,
        question: "What happens after I order?",
        answer: PROVISIONING_DISCLOSURE,
      },
    ],
    closingHeading: "Bring your Python project to a host that speaks Linux",
    closingDescription: `NVMe storage, MySQL, and ${SUPPORT_LINE}`,
  });
}

/* ------------------------------------------------------------------ Laravel */

function laravel(): CmsDeveloperHostingContent {
  return base({
    heroEyebrow: "Laravel hosting",
    heroTitle: "Laravel hosting built on",
    heroTitleAccent: "real PHP and MySQL.",
    heroDescription:
      "Run Laravel applications with Composer, PHP, MySQL, cron for the scheduler, and free SSL — deployed over SSH on plans from Pro upward.",
    heroPromo: "Full SSH, Composer and cron on Pro, Ultimate & Cloud",
    heroHighlights: [
      "Composer over SSH",
      "MySQL for Eloquent",
      "Cron for the Laravel scheduler",
      "Free automatic SSL",
    ],
    benefitsEyebrow: "Why Laravel on HostingBeyond",
    benefitsHeading: "Everything the framework expects",
    benefitsDescription:
      "Laravel assumes Composer, a writable storage directory, a queue and a scheduler. Those are the things that actually break on cheap hosting, so they are what we focus on.",
    benefits: [
      {
        id: "composer",
        visible: true,
        title: "Composer without workarounds",
        description:
          "Run composer install over SSH on Pro and above, with your own composer.json and lockfile in the account.",
      },
      {
        id: "artisan",
        visible: true,
        title: "Artisan and migrations",
        description:
          "php artisan migrate and other console commands run from SSH, so schema changes stay in your control.",
      },
      {
        id: "scheduler",
        visible: true,
        title: "Cron for the scheduler",
        description:
          "Point one cron entry at schedule:run and Laravel's task scheduler behaves as documented.",
      },
      {
        id: "mysql",
        visible: true,
        title: "MySQL for Eloquent",
        description:
          "Create MySQL databases from the control panel and point your .env at them. PostgreSQL is not offered on these plans.",
      },
    ],
    featuresEyebrow: "Capabilities",
    featuresHeading: "What is actually included",
    featuresDescription:
      "Verified PHP stack capabilities, plus the two Laravel conveniences we do not provide.",
    features: [
      {
        id: "php",
        visible: true,
        title: "PHP runtime",
        description:
          "PHP with the extensions Laravel needs, selected from the control panel.",
        icon: "server",
      },
      {
        id: "composer",
        visible: true,
        title: "Composer",
        description:
          "Install and update dependencies over SSH on Pro and above.",
        icon: "terminal",
      },
      {
        id: "mysql",
        visible: true,
        title: "MySQL databases",
        description:
          "Create databases and users from the control panel for Eloquent.",
        icon: "database",
      },
      {
        id: "cron",
        visible: true,
        title: "Cron scheduling",
        description:
          "One cron entry drives the Laravel scheduler, including queued closures.",
        icon: "zap",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free automatic SSL",
        description:
          "Issued and renewed automatically for every domain on the account.",
        icon: "lock",
      },
      {
        id: "ssh",
        visible: true,
        title: "SSH & Git over SSH",
        description:
          "Included on Pro and above; clone or pull your repository directly.",
        icon: "git",
      },
      {
        id: "queue-worker",
        visible: true,
        title: "Managed queue worker",
        description:
          "There is no platform-managed supervisor for queue:work. Run workers under cron or your own process management; a VPS gives full control.",
        icon: "server",
        available: false,
      },
      {
        id: "postgres",
        visible: true,
        title: "PostgreSQL",
        description:
          "Not offered on shared developer hosting. MySQL is the supported database for Laravel here.",
        icon: "database",
        available: false,
      },
    ],
    useCasesEyebrow: "Is this a fit?",
    useCasesHeading: "Good fit for Laravel workloads",
    useCasesDescription:
      "Suits conventional Laravel applications and small SaaS products. If you need Horizon across multiple workers or Octane under sustained load, look at a managed VPS.",
    useCases: [
      {
        id: "saas",
        visible: true,
        title: "Small SaaS applications",
        description:
          "Multi-tenant Laravel apps with billing webhooks and a scheduled job or two.",
      },
      {
        id: "cms",
        visible: true,
        title: "Content platforms",
        description:
          "Editorial sites and admin dashboards driven by Eloquent and Blade.",
      },
      {
        id: "api",
        visible: true,
        title: "Laravel APIs",
        description:
          "Sanctum or Passport-protected JSON APIs for a mobile or JavaScript client.",
      },
      {
        id: "agency",
        visible: true,
        title: "Client projects",
        description:
          "Agency builds where each client gets its own account, database, and certificate.",
      },
    ],
    pricingEyebrow: "Plans",
    pricingTitle: "Pick a plan for",
    pricingTitleAccent: "your Laravel app",
    pricingDescription:
      "Every plan runs PHP. Choose Pro or above when you need SSH for Composer, artisan, and cron.",
    comparisonEyebrow: "Choosing a plan",
    comparisonHeading: "Which plan do you need?",
    comparisonDescription:
      "PHP runs on all plans; SSH, Composer and cron are what move you up the range.",
    comparisonBullets: [
      "All four web hosting plans run PHP and MySQL.",
      "Beyond Essential (1 site, 10 GB) is fine for a single small Laravel site.",
      "Beyond Plus (5 sites, 20 GB) suits a few client projects.",
      "Beyond Pro adds SSH, Composer and priority support — needed for real deployments.",
      "Beyond Ultimate adds storage and memory headroom for larger applications.",
    ],
    faqHeading: "Laravel hosting questions",
    faqDescription:
      "Composer, artisan, queues, and what to expect from the account.",
    faqs: [
      {
        id: "composer",
        visible: true,
        question: "Can I run Composer?",
        answer:
          "Yes, over SSH on Beyond Pro and above. On Essential and Plus you can upload a vendor directory, but running Composer itself requires SSH.",
      },
      {
        id: "scheduler",
        visible: true,
        question: "Does the Laravel scheduler work?",
        answer:
          "Yes. Add one cron entry that runs schedule:run every minute and Laravel handles the rest, exactly as described in its documentation.",
      },
      {
        id: "queues",
        visible: true,
        question: "Are queue workers supported?",
        answer:
          "There is no platform-managed supervisor for queue:work, so you run workers yourself via cron or a supervised process. For multi-worker Horizon setups, a VPS is the better fit.",
      },
      {
        id: "php-version",
        visible: true,
        question: "Can I choose my PHP version?",
        answer:
          "PHP versions are selectable from the control panel. Verify the specific minor version your project requires with support before migrating a production application.",
      },
      {
        id: "postgres",
        visible: true,
        question: "Do you support PostgreSQL?",
        answer:
          "Not on shared developer hosting. MySQL is supported here. A VPS or Cloud plan lets you install and manage PostgreSQL yourself.",
      },
      {
        id: "provisioning",
        visible: true,
        question: "What happens after I order?",
        answer: PROVISIONING_DISCLOSURE,
      },
    ],
    closingHeading: "Deploy Laravel somewhere that does not fight Composer",
    closingDescription: `SSH, MySQL, cron and ${SUPPORT_LINE}`,
  });
}

/* ------------------------------------------------------------------- Django */

function django(): CmsDeveloperHostingContent {
  return base({
    heroEyebrow: "Django hosting",
    heroTitle: "Django hosting with",
    heroTitleAccent: "the pieces it assumes.",
    heroDescription:
      "Run Django on managed Linux with a virtual environment, pip, MySQL, cron for management commands, and free SSL on every domain.",
    heroPromo: "Python runtime available on Pro, Ultimate & Cloud plans",
    heroHighlights: [
      "Virtualenv and pip over SSH",
      "MySQL for the Django ORM",
      "Cron for management commands",
      "Free automatic SSL",
    ],
    benefitsEyebrow: "Why Django on HostingBeyond",
    benefitsHeading: "Isolated dependencies, predictable deploys",
    benefitsDescription:
      "Django projects carry a lot of dependencies. An isolated virtual environment per project and SSH on Pro and above keep deployments repeatable instead of hopeful.",
    benefits: [
      {
        id: "venv",
        visible: true,
        title: "A virtual environment per project",
        description:
          "Pin Django and every dependency in requirements.txt inside its own venv over SSH.",
      },
      {
        id: "manage",
        visible: true,
        title: "manage.py where you need it",
        description:
          "Run migrate, collectstatic, and custom management commands from SSH on Pro and above.",
      },
      {
        id: "mysql",
        visible: true,
        title: "MySQL for the ORM",
        description:
          "Django's MySQL backend is supported directly. PostgreSQL is not offered on shared developer hosting.",
      },
      {
        id: "cron",
        visible: true,
        title: "Scheduled management commands",
        description:
          "Run periodic cleanup and reporting commands from the control panel cron manager.",
      },
    ],
    featuresEyebrow: "Capabilities",
    featuresHeading: "What is actually included",
    featuresDescription:
      "Confirmed Django-relevant capabilities, with unsupported pieces stated plainly.",
    features: [
      {
        id: "python",
        visible: true,
        title: "CPython on Linux",
        description:
          "Python runtime enabled on Pro, Ultimate, and Cloud plans.",
        icon: "server",
      },
      {
        id: "venv",
        visible: true,
        title: "virtualenv and pip",
        description:
          "Isolated environments with pinned requirements, managed over SSH.",
        icon: "terminal",
      },
      {
        id: "mysql",
        visible: true,
        title: "MySQL databases",
        description: "Create databases and users from the control panel.",
        icon: "database",
      },
      {
        id: "static",
        visible: true,
        title: "Static file serving",
        description:
          "Serve collectstatic output from the web server rather than through Python.",
        icon: "globe",
      },
      {
        id: "cron",
        visible: true,
        title: "Cron scheduling",
        description: "Schedule manage.py commands without a separate worker.",
        icon: "zap",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free automatic SSL",
        description: "Issued and renewed automatically for every domain.",
        icon: "lock",
      },
      {
        id: "postgres",
        visible: true,
        title: "PostgreSQL",
        description:
          "Not offered on shared developer hosting. MySQL is supported; a VPS or Cloud plan lets you manage PostgreSQL yourself.",
        icon: "database",
        available: false,
      },
      {
        id: "asgi",
        visible: true,
        title: "Managed ASGI supervisor",
        description:
          "No platform-managed process supervisor for ASGI or WSGI today. You start the app over SSH.",
        icon: "server",
        available: false,
      },
    ],
    useCasesEyebrow: "Is this a fit?",
    useCasesHeading: "Good fit for Django workloads",
    useCasesDescription:
      "Works well for conventional Django sites and admin-heavy internal tools. Not designed for Celery clusters or long-running background workers.",
    useCases: [
      {
        id: "cms",
        visible: true,
        title: "Django CMS and editorial sites",
        description:
          "Content sites using the Django admin, templates, and a MySQL backend.",
      },
      {
        id: "portal",
        visible: true,
        title: "Customer portals",
        description:
          "Authenticated dashboards with forms, permissions, and scheduled reports.",
      },
      {
        id: "api",
        visible: true,
        title: "Django REST Framework APIs",
        description:
          "DRF services backing a mobile app or a separate JavaScript frontend.",
      },
      {
        id: "internal",
        visible: true,
        title: "Internal business tools",
        description:
          "Back-office applications where the admin interface does most of the work.",
      },
    ],
    pricingEyebrow: "Plans",
    pricingTitle: "Pick a plan with",
    pricingTitleAccent: "Python enabled",
    pricingDescription:
      "Python and SSH are available from Beyond Pro upward. Essential and Plus remain PHP-only.",
    comparisonEyebrow: "Choosing a plan",
    comparisonHeading: "Which plan do you need?",
    comparisonDescription:
      "Choose based on runtime support first, then storage for media and static files.",
    comparisonBullets: [
      "Python is not available on Beyond Essential or Beyond Plus.",
      "Beyond Pro (40 GB NVMe, 6 GB memory) handles most Django projects.",
      "Beyond Ultimate (60 GB NVMe, 8 GB memory) suits media-heavy or multi-app accounts.",
      "Cloud hosting adds dedicated RAM and vCPU when memory becomes the limit.",
      "Upgrading keeps your files, databases and domains in place.",
    ],
    faqHeading: "Django hosting questions",
    faqDescription:
      "Environments, databases, static files, and post-order expectations.",
    faqs: [
      {
        id: "which-plan",
        visible: true,
        question: "Which plan supports Django?",
        answer:
          "Django runs on Beyond Pro, Beyond Ultimate, and Cloud hosting, because those plans enable Python and SSH.",
      },
      {
        id: "postgres",
        visible: true,
        question: "Can I use PostgreSQL with Django?",
        answer:
          "Not on shared developer hosting. MySQL is supported here. For PostgreSQL, choose a VPS or Cloud plan and manage the database server yourself.",
      },
      {
        id: "static",
        visible: true,
        question: "How do I serve static and media files?",
        answer:
          "Run collectstatic over SSH and let the web server serve that output. Uploaded media can live in the same account under a directory you control.",
      },
      {
        id: "celery",
        visible: true,
        question: "Are Celery workers supported?",
        answer:
          "There is no platform-managed supervisor for Celery. You can run workers via cron or your own process supervision, but for sustained multi-worker throughput a VPS is the better fit.",
      },
      {
        id: "provisioning",
        visible: true,
        question: "What happens after I order?",
        answer: PROVISIONING_DISCLOSURE,
      },
    ],
    closingHeading: "Run Django on a Linux account you can actually reach",
    closingDescription: `SSH, MySQL, cron and ${SUPPORT_LINE}`,
  });
}

/* ------------------------------------------------------------------- NestJS */

function nestjs(): CmsDeveloperHostingContent {
  return base({
    heroEyebrow: "NestJS hosting",
    heroTitle: "Host NestJS services",
    heroTitleAccent: "with TypeScript builds included.",
    heroDescription:
      "Run NestJS APIs and services on Node.js with npm, SSH, MySQL, and free SSL — the same account that hosts your domains and email.",
    heroPromo: "Node.js runtime available on Pro, Ultimate & Cloud plans",
    heroHighlights: [
      "NestJS on the Node.js runtime",
      "npm install and build over SSH",
      "MySQL for TypeORM or Prisma",
      "Free automatic SSL",
    ],
    benefitsEyebrow: "Why NestJS on HostingBeyond",
    benefitsHeading: "Room for a compiled TypeScript build",
    benefitsDescription:
      "NestJS compiles before it runs, which means bigger dependency trees and a build step. NVMe storage and SSH keep that cycle tolerable on shared infrastructure.",
    benefits: [
      {
        id: "build",
        visible: true,
        title: "Build step over SSH",
        description:
          "Run npm install and nest build on the account, so you deploy compiled output instead of committing dist.",
      },
      {
        id: "runtime",
        visible: true,
        title: "Node.js runtime",
        description:
          "Enabled on Pro, Ultimate, and Cloud plans. Entry plans are PHP-only.",
      },
      {
        id: "typeorm",
        visible: true,
        title: "MySQL for TypeORM and Prisma",
        description:
          "Create MySQL databases from the control panel and point your data layer at them.",
      },
      {
        id: "https",
        visible: true,
        title: "HTTPS for service endpoints",
        description:
          "Free certificates that renew automatically, including for API subdomains.",
      },
    ],
    featuresEyebrow: "Capabilities",
    featuresHeading: "What is actually included",
    featuresDescription:
      "The verified Node.js platform capabilities that a NestJS service depends on.",
    features: [
      {
        id: "node",
        visible: true,
        title: "Node.js runtime",
        description: "Enabled on Pro, Ultimate, and Cloud plans.",
        icon: "server",
      },
      {
        id: "npm",
        visible: true,
        title: "npm and TypeScript build",
        description:
          "Install dependencies and run your build command over SSH on Pro and above.",
        icon: "terminal",
      },
      {
        id: "mysql",
        visible: true,
        title: "MySQL databases",
        description:
          "Create databases from the control panel for your data layer.",
        icon: "database",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free automatic SSL",
        description: "Issued and renewed automatically for every domain.",
        icon: "lock",
      },
      {
        id: "nvme",
        visible: true,
        title: "NVMe storage",
        description: "Faster installs and builds than SATA-backed hosting.",
        icon: "zap",
      },
      {
        id: "ssh",
        visible: true,
        title: "SSH access",
        description: "Included on Pro and above for builds, logs and restarts.",
        icon: "terminal",
      },
      {
        id: "process",
        visible: true,
        title: "Managed process supervisor",
        description:
          "No platform-managed supervisor for Node.js services today. You start and restart the process over SSH.",
        icon: "server",
        available: false,
      },
      {
        id: "graphql-gateway",
        visible: true,
        title: "Managed GraphQL gateway",
        description:
          "Not provided as a platform feature. Run your own Apollo or Mercurius server inside your service.",
        icon: "globe",
        available: false,
      },
    ],
    useCasesEyebrow: "Is this a fit?",
    useCasesHeading: "Good fit for NestJS workloads",
    useCasesDescription:
      "Best for single-service APIs with modest traffic. If you need multiple services with independent scaling, a container platform is a better match.",
    useCases: [
      {
        id: "api",
        visible: true,
        title: "REST APIs",
        description:
          "Controller and service modules exposed over HTTPS for a web or mobile client.",
      },
      {
        id: "graphql",
        visible: true,
        title: "GraphQL services",
        description:
          "A single Apollo or Mercurius endpoint running inside your Nest application.",
      },
      {
        id: "microservice-small",
        visible: true,
        title: "Small service backends",
        description:
          "One or two NestJS services with their own database and a scheduled job.",
      },
      {
        id: "backend",
        visible: true,
        title: "Backends for separate frontends",
        description:
          "An admin API behind a static dashboard hosted on the same account.",
      },
    ],
    pricingEyebrow: "Plans",
    pricingTitle: "Pick a plan with",
    pricingTitleAccent: "Node.js enabled",
    pricingDescription:
      "NestJS requires the Node.js runtime, so start at Beyond Pro. Essential and Plus are PHP-only.",
    comparisonEyebrow: "Choosing a plan",
    comparisonHeading: "Which plan do you need?",
    comparisonDescription:
      "Compiled TypeScript projects need build headroom, so weigh memory as well as storage.",
    comparisonBullets: [
      "Node.js is not available on Beyond Essential or Beyond Plus — choose Pro or above.",
      "Beyond Pro (40 GB NVMe, 6 GB memory) suits most single-service NestJS APIs.",
      "Beyond Ultimate (60 GB NVMe, 8 GB memory) gives more room for large builds.",
      "Cloud hosting adds dedicated RAM and vCPU for heavier concurrency.",
      "Plan changes preserve your files, databases and domains.",
    ],
    faqHeading: "NestJS hosting questions",
    faqDescription:
      "Build steps, runtime support, databases, and what to expect after ordering.",
    faqs: [
      {
        id: "which-plan",
        visible: true,
        question: "Which plan do I need for NestJS?",
        answer:
          "NestJS needs Node.js, which is enabled on Beyond Pro, Beyond Ultimate, and Cloud hosting.",
      },
      {
        id: "build",
        visible: true,
        question: "Can I run a TypeScript build?",
        answer:
          "Yes, over SSH on Pro and above. Run npm install and your build command, then start the compiled output. Committing dist is not required.",
      },
      {
        id: "process",
        visible: true,
        question: "Is there a process manager for NestJS?",
        answer:
          "Not currently. You start and restart the process over SSH. A VPS or Cloud plan gives full control if you want to run a supervisor yourself.",
      },
      {
        id: "database",
        visible: true,
        question: "Which databases can I use?",
        answer:
          "MySQL is available on the account and works with both TypeORM and Prisma. PostgreSQL is not offered on shared developer hosting.",
      },
      {
        id: "provisioning",
        visible: true,
        question: "What happens after I order?",
        answer: PROVISIONING_DISCLOSURE,
      },
    ],
    closingHeading: "Give your NestJS service a stable home",
    closingDescription: `NVMe storage, MySQL and ${SUPPORT_LINE}`,
  });
}

/* ------------------------------------------------------------------ Factory */

const FACTORIES: Record<DeveloperStackKey, () => CmsDeveloperHostingContent> = {
  "nodejs-hosting": nodejs,
  "python-hosting": python,
  "laravel-hosting": laravel,
  "django-hosting": django,
  "nestjs-hosting": nestjs,
};

export function defaultDeveloperHostingContent(
  key: DeveloperStackKey,
): CmsDeveloperHostingContent {
  return FACTORIES[key]();
}

export const DEVELOPER_STACK_KEYS: DeveloperStackKey[] = [
  "nodejs-hosting",
  "python-hosting",
  "laravel-hosting",
  "django-hosting",
  "nestjs-hosting",
];

/* -------------------------------------------------------------------- Merge */

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

const STALE_PLAN_COPY =
  /\b(Beyond Essential|Beyond Plus|Beyond Pro|Beyond Ultimate|Commerce Essential|Commerce Plus|Plus, Pro, and Ultimate)\b/;

function currentPlanCopy(value: unknown, fallback: string) {
  const stored = typeof value === "string" ? value.trim() : "";
  if (!stored || STALE_PLAN_COPY.test(stored)) return fallback;
  return stored;
}

function textList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const clean = value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
  return clean.length ? clean : fallback;
}

function mergeList<T extends { id: string }>(
  defaults: T[],
  stored: unknown,
  merge: (item: Partial<T>, base: T) => T,
): T[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;
  const byId = new Map(defaults.map((row) => [row.id, row]));
  return stored.map((row, index) => {
    const partial = (row ?? {}) as Partial<T>;
    const base =
      (partial.id ? byId.get(partial.id) : undefined) ??
      defaults[index % defaults.length];
    return merge(partial, base);
  });
}

export function mergeDeveloperHostingContent(
  key: DeveloperStackKey,
  stored?: Partial<CmsDeveloperHostingContent> | null,
): CmsDeveloperHostingContent {
  const defaults = defaultDeveloperHostingContent(key);
  if (!stored) return defaults;

  return {
    ...defaults,
    heroEyebrow: text(stored.heroEyebrow, defaults.heroEyebrow),
    heroTitle: text(stored.heroTitle, defaults.heroTitle),
    heroTitleAccent: text(stored.heroTitleAccent, defaults.heroTitleAccent),
    heroDescription: text(stored.heroDescription, defaults.heroDescription),
    heroPrimaryLabel: text(stored.heroPrimaryLabel, defaults.heroPrimaryLabel),
    heroPrimaryHref: text(stored.heroPrimaryHref, defaults.heroPrimaryHref),
    heroSecondaryLabel: text(
      stored.heroSecondaryLabel,
      defaults.heroSecondaryLabel,
    ),
    heroSecondaryHref: text(
      stored.heroSecondaryHref,
      defaults.heroSecondaryHref,
    ),
    heroPromo: text(stored.heroPromo, defaults.heroPromo),
    heroHighlights: textList(stored.heroHighlights, defaults.heroHighlights),
    benefitsEyebrow: text(stored.benefitsEyebrow, defaults.benefitsEyebrow),
    benefitsHeading: text(stored.benefitsHeading, defaults.benefitsHeading),
    benefitsDescription: text(
      stored.benefitsDescription,
      defaults.benefitsDescription,
    ),
    benefits: mergeList(defaults.benefits, stored.benefits, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
      visible: item.visible !== false,
    })),
    featuresEyebrow: text(stored.featuresEyebrow, defaults.featuresEyebrow),
    featuresHeading: text(stored.featuresHeading, defaults.featuresHeading),
    featuresDescription: text(
      stored.featuresDescription,
      defaults.featuresDescription,
    ),
    features: mergeList(defaults.features, stored.features, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
      icon: (item.icon ?? base.icon) as DeveloperFeature["icon"],
      available:
        typeof item.available === "boolean" ? item.available : base.available,
      visible: item.visible !== false,
    })),
    useCasesEyebrow: text(stored.useCasesEyebrow, defaults.useCasesEyebrow),
    useCasesHeading: text(stored.useCasesHeading, defaults.useCasesHeading),
    useCasesDescription: text(
      stored.useCasesDescription,
      defaults.useCasesDescription,
    ),
    useCases: mergeList(defaults.useCases, stored.useCases, (item, base) => ({
      ...base,
      title: text(item.title, base.title),
      description: text(item.description, base.description),
      visible: item.visible !== false,
    })),
    pricingEyebrow: text(stored.pricingEyebrow, defaults.pricingEyebrow),
    pricingTitle: text(stored.pricingTitle, defaults.pricingTitle),
    pricingTitleAccent: text(
      stored.pricingTitleAccent,
      defaults.pricingTitleAccent,
    ),
    pricingDescription: text(
      stored.pricingDescription,
      defaults.pricingDescription,
    ),
    pricingNote: text(stored.pricingNote, defaults.pricingNote),
    planNotes: Array.isArray(stored.planNotes)
      ? stored.planNotes
          .filter(
            (note): note is DeveloperPlanNote =>
              Boolean(note) &&
              typeof note.planKey === "string" &&
              typeof note.note === "string",
          )
          .map((note) => ({
            id: note.id || note.planKey,
            planKey: note.planKey,
            note: note.note,
          }))
      : defaults.planNotes,
    comparisonEyebrow: text(
      stored.comparisonEyebrow,
      defaults.comparisonEyebrow,
    ),
    comparisonHeading: text(
      stored.comparisonHeading,
      defaults.comparisonHeading,
    ),
    comparisonDescription: text(
      stored.comparisonDescription,
      defaults.comparisonDescription,
    ),
    comparisonBullets: (() => {
      const storedBullets = textList(
        stored.comparisonBullets,
        defaults.comparisonBullets,
      );
      return storedBullets.some((line) => STALE_PLAN_COPY.test(line))
        ? defaults.comparisonBullets
        : storedBullets;
    })(),
    faqHeading: text(stored.faqHeading, defaults.faqHeading),
    faqDescription: text(stored.faqDescription, defaults.faqDescription),
    faqs: mergeList(defaults.faqs, stored.faqs, (item, base) => ({
      ...base,
      question: text(item.question, base.question),
      answer: currentPlanCopy(item.answer, base.answer),
      visible: item.visible !== false,
    })),
    closingHeading: text(stored.closingHeading, defaults.closingHeading),
    closingDescription: text(
      stored.closingDescription,
      defaults.closingDescription,
    ),
    closingCtaLabel: text(stored.closingCtaLabel, defaults.closingCtaLabel),
    closingCtaHref: text(stored.closingCtaHref, defaults.closingCtaHref),
  };
}

/** Canonical public path per developer stack. */
export const DEVELOPER_STACK_PATHS: Record<DeveloperStackKey, string> = {
  "nodejs-hosting": "/nodejs-hosting",
  "python-hosting": `${routes.hosting}/python`,
  "laravel-hosting": "/laravel-hosting",
  "django-hosting": "/django-hosting",
  "nestjs-hosting": "/nestjs-hosting",
};
