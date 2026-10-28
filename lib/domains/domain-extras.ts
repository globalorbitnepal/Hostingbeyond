export const DEFAULT_DOMAIN_PROTECTION_USD = 9.99;

export type DomainExtras = {
  privacyFree: boolean;
  privacyLabel: string;
  privacyDetail: string;
  protectionEnabled: boolean;
  protectionPriceUsd: number;
  protectionLabel: string;
  protectionDetail: string;
};

const DEFAULTS: DomainExtras = {
  privacyFree: true,
  privacyLabel: "WHOIS privacy",
  privacyDetail: "Included free on eligible domains",
  protectionEnabled: true,
  protectionPriceUsd: DEFAULT_DOMAIN_PROTECTION_USD,
  protectionLabel: "Domain Protection",
  protectionDetail:
    "Registry lock and theft protection for one year — extra, not included with privacy.",
};

function money(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n * 100) / 100;
}

export function defaultDomainExtras(): DomainExtras {
  return { ...DEFAULTS };
}

export function mergeDomainExtras(
  stored?: Partial<DomainExtras> | null,
): DomainExtras {
  const base = defaultDomainExtras();
  if (!stored) return base;
  return {
    privacyFree: stored.privacyFree !== false,
    privacyLabel: stored.privacyLabel?.trim() || base.privacyLabel,
    privacyDetail: stored.privacyDetail?.trim() || base.privacyDetail,
    protectionEnabled: stored.protectionEnabled !== false,
    protectionPriceUsd: money(
      stored.protectionPriceUsd,
      base.protectionPriceUsd,
    ),
    protectionLabel: stored.protectionLabel?.trim() || base.protectionLabel,
    protectionDetail: stored.protectionDetail?.trim() || base.protectionDetail,
  };
}

export function extrasFromSiteSettings(settings: {
  domainPrivacyFree?: boolean;
  domainProtectionEnabled?: boolean;
  domainProtectionPriceUsd?: number;
  domainProtectionLabel?: string;
}): DomainExtras {
  return mergeDomainExtras({
    privacyFree: settings.domainPrivacyFree,
    protectionEnabled: settings.domainProtectionEnabled,
    protectionPriceUsd: settings.domainProtectionPriceUsd,
    protectionLabel: settings.domainProtectionLabel,
  });
}

export function protectionChargeUsd(extras: DomainExtras): number {
  if (!extras.protectionEnabled) return 0;
  if (extras.protectionPriceUsd <= 0) return 0;
  return extras.protectionPriceUsd;
}
