import { routes } from "@/config/routes";

import {
  type CmsHostingPageContent,
  mergeHostingPageContent,
} from "@/lib/orbit/hosting-page-content";

export function defaultPythonHostingPageContent(): CmsHostingPageContent {
  return {
    heroEyebrow: "Python hosting",
    heroTitle: "Python app hosting",
    heroTitleAccent: "on Linux NVMe.",
    heroDescription:
      "Deploy Flask, Django, FastAPI, and custom Python workloads on managed Linux — SSH, pip-friendly stacks, free SSL, and 24/7 support on Pro plans and above.",
    heroPrimaryLabel: "View Python-ready plans",
    heroPrimaryHref: "#plans",
    heroSecondaryLabel: "Need a VPS instead?",
    heroSecondaryHref: routes.vps,
    heroPromo: "PHP, Python & Node.js on Pro, Ultimate & Cloud",

    pricingEyebrow: "Python-ready plans",
    pricingTitle: "Choose your",
    pricingTitleAccent: "application plan",
    pricingDescription:
      "Start on shared hosting with Python enabled on higher tiers, or move to Cloud when you need dedicated RAM and vCPU.",
    pricingNote:
      "Promotional rates apply to the first term. Standard renewal rates are shown at checkout.",

    featuresEyebrow: "Built for developers",
    featuresHeading: "Run Python with confidence",
    featuresDescription:
      "Modern CPython runtimes, Git-friendly workflows, and HTTPS by default — without babysitting servers.",
    features: [
      {
        id: "runtime",
        visible: true,
        title: "CPython on Linux",
        description:
          "Run Flask, Django, FastAPI, and scripts on supported Pro+ plans.",
        icon: "server",
      },
      {
        id: "ssl",
        visible: true,
        title: "Free SSL",
        description:
          "Terminate HTTPS for APIs and apps with automatic certificates.",
        icon: "shield",
      },
      {
        id: "nvme",
        visible: true,
        title: "NVMe performance",
        description: "Fast disks for APIs, workers, and database-backed apps.",
        icon: "zap",
      },
      {
        id: "stack",
        visible: true,
        title: "Multi-language stack",
        description:
          "PHP, Python, and Node.js on the same account when you need hybrid apps.",
        icon: "sparkles",
      },
      {
        id: "deploy",
        visible: true,
        title: "Git & SSH workflows",
        description:
          "Deploy from repos and manage virtualenvs on supported plans.",
        icon: "globe",
      },
      {
        id: "support",
        visible: true,
        title: "24/7 app support",
        description:
          "Humans for DNS, SSL, migrations, and environment questions.",
        icon: "mail",
      },
    ],

    wordpressHeading: "Django, Flask & APIs",
    wordpressDescription:
      "Host admin panels, REST APIs, and background workers — pair with MariaDB, Redis-friendly stacks, and staging on higher tiers.",
    wordpressBullets: [
      "Python on Pro, Ultimate & commerce cloud tiers",
      "Free SSL for every app URL",
      "Upgrade to Cloud for dedicated vCPU",
      "Daily backups on eligible plans",
    ],
    wordpressCtaLabel: "Deploy Python hosting",
    wordpressCtaHref: routes.getStarted,
    wordpressImage: "",

    compareHeading: "Python hosting vs DIY VPS",
    compareDescription:
      "Managed panel, SSL, and support included — add Cloud when you outgrow shared resources.",
    compareBullets: [
      "No raw server admin on shared Pro+ plans",
      "Free SSL — not a paid add-on",
      "One dashboard for domains, mail & apps",
      "Scale to Cloud hosting without migrating vendors",
    ],

    faqHeading: "Python hosting FAQs",
    faqDescription:
      "Frameworks, versions, SSH, and billing — straight answers.",
    faqs: [
      {
        id: "frameworks",
        visible: true,
        question: "Which Python frameworks are supported?",
        answer:
          "Customers run Flask, Django, FastAPI, and custom WSGI/ASGI apps on plans that include Python. Use your panel to select the runtime and document root for each app.",
      },
      {
        id: "plans",
        visible: true,
        question: "Which plan includes Python?",
        answer:
          "Python, Node.js, and advanced PHP are included on Pro, Ultimate, and commerce Cloud tiers. Starter and Plus focus on WordPress and PHP sites — upgrade when you need Python.",
      },
      {
        id: "ssh",
        visible: true,
        question: "Do I get SSH access?",
        answer:
          "SSH is available on supported plans so you can deploy with Git, manage virtualenvs, and run pip installs within fair-use policy.",
      },
      {
        id: "cloud",
        visible: true,
        question: "When should I use Cloud instead?",
        answer:
          "Move to Cloud hosting when you need guaranteed RAM and vCPU for workers, queues, or consistent API latency under load.",
      },
      {
        id: "billing",
        visible: true,
        question: "Monthly vs annual billing?",
        answer:
          "Annual billing offers the lowest effective monthly rate. Toggle prices on this page before checkout — renewals are always shown upfront.",
      },
    ],

    closingHeading: "Ship your Python app",
    closingDescription:
      "Choose a Python-ready plan, point your domain, and go live with SSL and support included.",
    closingCtaLabel: "Get started",
    closingCtaHref: routes.getStarted,
  };
}

export function mergePythonHostingPageContent(
  stored?: Partial<CmsHostingPageContent> | null,
): CmsHostingPageContent {
  return mergeHostingPageContent(stored, defaultPythonHostingPageContent);
}
