import type { HostingOrderStatus } from "@prisma/client";

/**
 * Hosting sites a customer can create once a hosting plan is active.
 *
 * The record lives inside `HostingOrder.configuration` (a JSON column we already
 * own) so shipping the customer-facing "My websites" flow needs no migration —
 * production migrations are gated and must stay manual. When a real control
 * panel API lands, `externalId` holds the provider site id; until then the site
 * is an honest `awaiting_setup` request that Orbit staff fulfil.
 */

export const HOSTING_SITE_TYPES = [
  "wordpress",
  "ai-builder",
  "web-apps",
  "php-html",
] as const;

export type HostingSiteType = (typeof HOSTING_SITE_TYPES)[number];

export const HOSTING_SITE_TYPE_LABELS: Record<HostingSiteType, string> = {
  wordpress: "WordPress",
  "ai-builder": "AI Builder",
  "web-apps": "Web Apps",
  "php-html": "PHP / HTML",
};

export const HOSTING_SITE_TYPE_DESCRIPTIONS: Record<HostingSiteType, string> = {
  wordpress:
    "A WordPress install with an admin login and a database, ready for themes and plugins.",
  "ai-builder":
    "Start with the AI builder — describe your business and get a first draft site.",
  "web-apps":
    "Node.js, Laravel, Django and other app runtimes deployed from a repository.",
  "php-html":
    "Upload plain PHP or static HTML files and connect your domain yourself.",
};

export type HostingSiteStatus = "awaiting_setup" | "provisioning" | "live";

export type HostingSiteRecord = {
  id: string;
  type: HostingSiteType;
  name: string;
  domain: string | null;
  status: HostingSiteStatus;
  /** Control-panel / provider identifier once a real API provisions the site. */
  externalId: string | null;
  createdAt: string;
};

type ConfigurationShape = Record<string, unknown>;

export function readHostingSites(configuration: unknown): HostingSiteRecord[] {
  if (!configuration || typeof configuration !== "object") return [];
  const raw = (configuration as ConfigurationShape).sites;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry): HostingSiteRecord[] => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const type = row.type;
    if (
      typeof type !== "string" ||
      !(HOSTING_SITE_TYPES as readonly string[]).includes(type)
    ) {
      return [];
    }
    const status = row.status;
    return [
      {
        id: typeof row.id === "string" ? row.id : "",
        type: type as HostingSiteType,
        name: typeof row.name === "string" ? row.name : "Website",
        domain: typeof row.domain === "string" ? row.domain : null,
        status:
          status === "live" || status === "provisioning"
            ? status
            : "awaiting_setup",
        externalId: typeof row.externalId === "string" ? row.externalId : null,
        createdAt:
          typeof row.createdAt === "string"
            ? row.createdAt
            : new Date(0).toISOString(),
      },
    ];
  });
}

export function validateSiteName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 60) return null;
  return name;
}

export function validateSiteDomain(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const domain = raw.trim().toLowerCase();
  if (!domain) return null;
  if (domain.length > 253) return null;
  if (
    !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(
      domain,
    )
  ) {
    return null;
  }
  return domain;
}

export type CustomerHostingPlan = {
  orderId: string;
  orderReference: string;
  status: HostingOrderStatus;
  statusLabel: string;
  productSlug: string;
  productName: string;
  planKey: string;
  planName: string;
  billingCycle: string;
  total: number;
  currency: string;
  createdAt: string;
  sites: HostingSiteRecord[];
  /** True only when the plan itself is live — sites can only be added then. */
  readyForSites: boolean;
  siteLimit: number | null;
  ctaHref: string | null;
};

export function planSiteLimit(websitesSpec: unknown): number | null {
  if (typeof websitesSpec !== "string") return null;
  if (/unlimited/i.test(websitesSpec)) return null;
  const match = websitesSpec.match(/(\d+)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
