import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";

export type PlansTrustChipSlot = "support" | "activation" | "uptime" | "scale";

export type PlansTrustChipIcon =
  | "headphones"
  | "zap"
  | "shield"
  | "trending"
  | "cloud"
  | "server"
  | "code"
  | "shopping"
  | "users";

type TrustChipCopy = {
  supportLabel: string;
  supportHint: string;
  activationLabel: string;
  activationHint: string;
  uptimeLabel: string;
  uptimeHint: string;
  scaleLabel: string;
  scaleHint: string;
  icons?: Partial<Record<PlansTrustChipSlot, PlansTrustChipIcon>>;
};

const BASE_WEB: TrustChipCopy = {
  supportLabel: "24/7 Expert Support",
  supportHint: "Real people, always here",
  activationLabel: "Instant Activation",
  activationHint: "Get online in minutes",
  uptimeLabel: "99.9% Uptime",
  uptimeHint: "Your website, always online",
  scaleLabel: "Easy upgrades",
  scaleHint: "Scale plans without downtime",
  icons: {
    support: "headphones",
    activation: "zap",
    uptime: "shield",
    scale: "trending",
  },
};

const PRESETS: Record<string, TrustChipCopy> = {
  "web-hosting": BASE_WEB,
  "wordpress-hosting": {
    supportLabel: "24/7 WordPress support",
    supportHint: "WP specialists on chat",
    activationLabel: "One-click WordPress",
    activationHint: "Install in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Sites stay online",
    scaleLabel: "Room to grow",
    scaleHint: "Upgrade as traffic grows",
    icons: {
      support: "headphones",
      activation: "server",
      uptime: "shield",
      scale: "trending",
    },
  },
  "ecommerce-hosting": {
    supportLabel: "24/7 commerce support",
    supportHint: "Checkout & DNS help",
    activationLabel: "Instant store setup",
    activationHint: "Sell online in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Monitored NVMe stack",
    scaleLabel: "Upgrade as you sell",
    scaleHint: "More power when you need it",
    icons: {
      support: "headphones",
      activation: "shopping",
      uptime: "shield",
      scale: "trending",
    },
  },
  "business-hosting": {
    supportLabel: "24/7 cloud support",
    supportHint: "Cloud specialists on chat",
    activationLabel: "Instant provisioning",
    activationHint: "Live in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Monitored infrastructure",
    scaleLabel: "One-click upgrades",
    scaleHint: "Grow without downtime",
    icons: {
      support: "headphones",
      activation: "cloud",
      uptime: "shield",
      scale: "trending",
    },
  },
  "python-hosting": {
    supportLabel: "24/7 developer support",
    supportHint: "Python & deploy help",
    activationLabel: "Fast Python deploy",
    activationHint: "Apps live in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Production-grade stack",
    scaleLabel: "Scale your apps",
    scaleHint: "More CPU & RAM anytime",
    icons: {
      support: "headphones",
      activation: "code",
      uptime: "shield",
      scale: "trending",
    },
  },
  "nodejs-hosting": {
    supportLabel: "24/7 Node.js support",
    supportHint: "Runtime & deploy help",
    activationLabel: "Quick Node deploy",
    activationHint: "Start serving in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Always-on processes",
    scaleLabel: "Scale workloads",
    scaleHint: "Upgrade plans anytime",
    icons: {
      support: "headphones",
      activation: "code",
      uptime: "shield",
      scale: "trending",
    },
  },
  "laravel-hosting": {
    supportLabel: "24/7 Laravel support",
    supportHint: "PHP & queue help",
    activationLabel: "Laravel-ready stack",
    activationHint: "Deploy in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Stable PHP hosting",
    scaleLabel: "Grow your apps",
    scaleHint: "More resources on demand",
    icons: {
      support: "headphones",
      activation: "code",
      uptime: "shield",
      scale: "trending",
    },
  },
  "django-hosting": {
    supportLabel: "24/7 Django support",
    supportHint: "Python & WSGI help",
    activationLabel: "Django-ready hosting",
    activationHint: "Projects live fast",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Reliable production stack",
    scaleLabel: "Scale projects",
    scaleHint: "Upgrade without migration",
    icons: {
      support: "headphones",
      activation: "code",
      uptime: "shield",
      scale: "trending",
    },
  },
  "nestjs-hosting": {
    supportLabel: "24/7 NestJS support",
    supportHint: "Node & API help",
    activationLabel: "NestJS-friendly stack",
    activationHint: "Ship APIs faster",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Monitored infrastructure",
    scaleLabel: "Scale APIs",
    scaleHint: "More power when traffic spikes",
    icons: {
      support: "headphones",
      activation: "code",
      uptime: "shield",
      scale: "trending",
    },
  },
  "kvm-vps": {
    supportLabel: "24/7 VPS support",
    supportHint: "Root access experts",
    activationLabel: "Fast VPS provisioning",
    activationHint: "Servers online quickly",
    uptimeLabel: "99.9% uptime SLA",
    uptimeHint: "KVM infrastructure",
    scaleLabel: "Resize resources",
    scaleHint: "Upgrade VPS plans anytime",
    icons: {
      support: "headphones",
      activation: "server",
      uptime: "shield",
      scale: "trending",
    },
  },
  "nvme-vps": {
    supportLabel: "24/7 VPS support",
    supportHint: "NVMe & networking help",
    activationLabel: "NVMe VPS ready",
    activationHint: "Provision in minutes",
    uptimeLabel: "99.9% uptime SLA",
    uptimeHint: "All-NVMe storage",
    scaleLabel: "Scale NVMe VPS",
    scaleHint: "More disk & RAM on demand",
    icons: {
      support: "headphones",
      activation: "server",
      uptime: "shield",
      scale: "trending",
    },
  },
  "linux-vps": {
    supportLabel: "24/7 Linux VPS support",
    supportHint: "OS & stack help",
    activationLabel: "Linux VPS online",
    activationHint: "SSH access in minutes",
    uptimeLabel: "99.9% uptime SLA",
    uptimeHint: "Stable Linux hosts",
    scaleLabel: "Grow your server",
    scaleHint: "Plan upgrades anytime",
    icons: {
      support: "headphones",
      activation: "server",
      uptime: "shield",
      scale: "trending",
    },
  },
  "managed-vps": {
    supportLabel: "24/7 managed care",
    supportHint: "We handle the stack",
    activationLabel: "Managed provisioning",
    activationHint: "Hands-off setup",
    uptimeLabel: "99.9% uptime SLA",
    uptimeHint: "Monitored & patched",
    scaleLabel: "Managed scaling",
    scaleHint: "Upgrade with guidance",
    icons: {
      support: "headphones",
      activation: "server",
      uptime: "shield",
      scale: "trending",
    },
  },
  "reseller-hosting": {
    supportLabel: "24/7 reseller support",
    supportHint: "Billing & WHM help",
    activationLabel: "Instant reseller panel",
    activationHint: "Start selling in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "White-label reliability",
    scaleLabel: "Grow client base",
    scaleHint: "Upgrade reseller tiers",
    icons: {
      support: "headphones",
      activation: "users",
      uptime: "shield",
      scale: "trending",
    },
  },
  "agency-hosting": {
    supportLabel: "24/7 agency support",
    supportHint: "Multi-site experts",
    activationLabel: "Fast client onboarding",
    activationHint: "Sites live in minutes",
    uptimeLabel: "99.9% uptime",
    uptimeHint: "Client-ready stack",
    scaleLabel: "Scale client sites",
    scaleHint: "More sites & resources",
    icons: {
      support: "headphones",
      activation: "users",
      uptime: "shield",
      scale: "trending",
    },
  },
};

function presetForSlug(slug: string, productName: string): TrustChipCopy {
  const known = PRESETS[slug];
  if (known) return known;

  const short = productName.replace(/\s+hosting$/i, "").trim() || productName;
  return {
    supportLabel: "24/7 Expert Support",
    supportHint: `${short} specialists on chat`,
    activationLabel: "Instant activation",
    activationHint: "Get online in minutes",
    uptimeLabel: "99.9% Uptime",
    uptimeHint: "Monitored infrastructure",
    scaleLabel: "Easy upgrades",
    scaleHint: "Scale without downtime",
    icons: BASE_WEB.icons,
  };
}

export type CmsHostingPlansWithTrustIcons = CmsHostingPlansContent & {
  trustChipIcons?: Partial<Record<PlansTrustChipSlot, PlansTrustChipIcon>>;
};

/** Product-page pricing trust row — matches product name and plan cards below. */
export function applyProductPlansTrustChips(
  productSlug: string,
  productName: string,
  content: CmsHostingPlansContent,
): CmsHostingPlansWithTrustIcons {
  const preset = presetForSlug(productSlug, productName);
  return {
    ...content,
    supportLabel: preset.supportLabel,
    supportHint: preset.supportHint,
    activationLabel: preset.activationLabel,
    activationHint: preset.activationHint,
    uptimeLabel: preset.uptimeLabel,
    uptimeHint: preset.uptimeHint,
    scaleLabel: preset.scaleLabel,
    scaleHint: preset.scaleHint,
    trustChipIcons: preset.icons ?? BASE_WEB.icons,
  };
}
