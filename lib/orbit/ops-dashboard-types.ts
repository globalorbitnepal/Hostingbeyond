export type OpsIntegration = {
  id: string;
  label: string;
  connected: boolean;
  detail: string;
};

export type OpsRow = {
  id: string;
  title: string;
  meta: string;
  amount: string;
  href: string;
};

export type OpsSnapshot = {
  generatedAt: string;
  money: {
    domainPaidCount: number;
    domainPaidTotal: number;
    domainPendingCount: number;
    hostingPaidCount: number;
    hostingPaidTotal: number;
    hostingPendingCount: number;
    walletTopupCount: number;
    walletTopupTotal: number;
    invoicesPaidCount: number;
    invoicesPaidTotal: number;
    invoicesOpenCount: number;
    currency: string;
  };
  domains: {
    active: number;
    expiring30: number;
    expired: number;
    autoRenew: number;
    transfersOpen: number;
  };
  hosting: Array<{ status: string; count: number; total: number }>;
  email: {
    queuedMessages: number;
    mailboxesStored: number;
    openTickets: number;
  };
  ssl: {
    stored: number;
    active: number;
    expiring30: number;
    premium: number;
    siteHost: string;
    siteOk: boolean;
    siteExpiresAt: string | null;
    siteIssuer: string | null;
    siteError: string | null;
  };
  customers: { total: number; sessions24h: number };
  integrations: OpsIntegration[];
  traffic: { connected: false; note: string };
  server: {
    hostname: string;
    platform: string;
    node: string;
    load: string;
    memoryUsedMb: number;
    memoryTotalMb: number;
    hostUptimeHours: number;
    processUptimeHours: number;
  };
  recentDomains: OpsRow[];
  recentHosting: OpsRow[];
  recentInvoices: OpsRow[];
  expiringDomains: OpsRow[];
};
