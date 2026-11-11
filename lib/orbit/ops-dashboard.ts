import os from "node:os";
import tls from "node:tls";

import { isDomainNameApiConfigured } from "@/lib/domains/providers/domain-name-api-config";
import { runtimeConfigFlags } from "@/lib/http/runtime-config";
import { isEnvPresent } from "@/lib/integrations/env-flags";
import {
  countMailBags,
  countSslBags,
  decimalToNumber,
  OPEN_HOSTING_STATUSES,
  PAID_DOMAIN_STATUSES,
} from "@/lib/orbit/ops-dashboard-math";
import type {
  OpsIntegration,
  OpsSnapshot,
} from "@/lib/orbit/ops-dashboard-types";
import { prisma } from "@/lib/prisma";

export type {
  OpsIntegration,
  OpsRow,
  OpsSnapshot,
} from "@/lib/orbit/ops-dashboard-types";

function moneyLabel(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function publicHost(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "hosting.theglobalorbit.com";
  try {
    return new URL(raw).hostname;
  } catch {
    return "hosting.theglobalorbit.com";
  }
}

function probeSiteTls(host: string): Promise<{
  ok: boolean;
  expiresAt: string | null;
  issuer: string | null;
  error: string | null;
}> {
  return new Promise((resolve) => {
    const done = (value: {
      ok: boolean;
      expiresAt: string | null;
      issuer: string | null;
      error: string | null;
    }) => {
      resolve(value);
    };
    const socket = tls.connect(
      { host, port: 443, servername: host, timeout: 2500 },
      () => {
        const cert = socket.getPeerCertificate();
        const expires = cert?.valid_to ? new Date(cert.valid_to) : null;
        const issuer =
          typeof cert?.issuer?.O === "string"
            ? cert.issuer.O
            : typeof cert?.issuer?.CN === "string"
              ? cert.issuer.CN
              : null;
        socket.end();
        done({
          ok: Boolean(cert && Object.keys(cert).length > 0),
          expiresAt:
            expires && !Number.isNaN(expires.getTime())
              ? expires.toISOString()
              : null,
          issuer,
          error: null,
        });
      },
    );
    socket.once("error", () => {
      socket.destroy();
      done({
        ok: false,
        expiresAt: null,
        issuer: null,
        error: "unreachable",
      });
    });
    socket.once("timeout", () => {
      socket.destroy();
      done({ ok: false, expiresAt: null, issuer: null, error: "timeout" });
    });
  });
}

function integrations(): OpsIntegration[] {
  const flags = runtimeConfigFlags();
  const google =
    isEnvPresent(process.env.GOOGLE_CLIENT_ID) &&
    isEnvPresent(process.env.GOOGLE_CLIENT_SECRET);
  const github =
    isEnvPresent(process.env.GITHUB_CLIENT_ID) &&
    isEnvPresent(process.env.GITHUB_CLIENT_SECRET);
  const gemini = isEnvPresent(process.env.GEMINI_API_KEY);
  const dna = isDomainNameApiConfigured();
  return [
    {
      id: "stripe",
      label: "Stripe",
      connected: flags.stripeSecretPresent && flags.stripeWebhookPresent,
      detail: flags.stripeSecretPresent
        ? flags.stripeWebhookPresent
          ? "Secret key and webhook secret are set"
          : "Secret key is set, webhook secret is missing"
        : "Not configured",
    },
    {
      id: "namesilo",
      label: "NameSilo",
      connected: flags.namesiloKeyPresent && flags.namesiloLifecycleEnabled,
      detail: flags.namesiloKeyPresent
        ? flags.namesiloLifecycleEnabled
          ? flags.namesiloBillableEnabled
            ? "Lifecycle and billable calls enabled"
            : "Key set, billable calls off"
          : "Key set, lifecycle off"
        : "Not configured",
    },
    {
      id: "dna",
      label: "Domain Name API",
      connected: dna,
      detail: dna ? "Registrar client configured" : "Not configured",
    },
    {
      id: "gemini",
      label: "Gemini",
      connected: gemini,
      detail: gemini ? "API key present" : "Not configured",
    },
    {
      id: "google",
      label: "Google sign-in",
      connected: google,
      detail: google ? "OAuth client configured" : "Not configured",
    },
    {
      id: "github",
      label: "GitHub sign-in",
      connected: github,
      detail: github ? "OAuth client configured" : "Not configured",
    },
    {
      id: "smtp",
      label: "Outbound email",
      connected: flags.smtpHostPresent && flags.emailDeliveryEnabled,
      detail: flags.smtpHostPresent
        ? flags.emailDeliveryEnabled
          ? "SMTP host set and delivery enabled"
          : "SMTP host set, delivery flag off"
        : "Not configured",
    },
    {
      id: "translate",
      label: "Google Translate",
      connected: flags.googleCloudTranslateEnabled,
      detail: flags.googleCloudTranslateEnabled
        ? "Project and credentials present"
        : "Not configured",
    },
  ];
}

export async function loadOpsSnapshot(now = new Date()): Promise<OpsSnapshot> {
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const host = publicHost();

  const [
    domainPaid,
    domainPending,
    hostingPaid,
    hostingPending,
    hostingByStatus,
    wallet,
    invoicesPaid,
    invoicesOpen,
    activeDomains,
    expiring,
    expired,
    autoRenew,
    transfersOpen,
    customers,
    sessions24h,
    tickets,
    sslRows,
    mailRows,
    recentDomains,
    recentHosting,
    recentInvoices,
    expiringList,
    siteTls,
  ] = await Promise.all([
    prisma.domainOrder.aggregate({
      where: { status: { in: [...PAID_DOMAIN_STATUSES] } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.domainOrder.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.hostingOrder.aggregate({
      where: { status: { in: [...OPEN_HOSTING_STATUSES] } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.hostingOrder.count({
      where: { status: { in: ["DRAFT", "PENDING_PAYMENT"] } },
    }),
    prisma.hostingOrder.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.walletPayment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.invoice.count({ where: { status: { in: ["DRAFT", "ISSUED"] } } }),
    prisma.domainRegistration.count({ where: { status: "ACTIVE" } }),
    prisma.domainRegistration.count({
      where: {
        status: "ACTIVE",
        expiresAt: { gte: now, lte: soon },
      },
    }),
    prisma.domainRegistration.count({ where: { status: "EXPIRED" } }),
    prisma.domainRegistration.count({
      where: { status: "ACTIVE", autoRenew: true },
    }),
    prisma.domainTransferRecord.count({
      where: {
        status: { in: ["PAID", "SUBMITTED", "IN_PROGRESS"] },
      },
    }),
    prisma.customerUser.count(),
    prisma.customerSession.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.beyondMasterTicket.count({
      where: { status: { notIn: ["resolved", "closed"] } },
    }),
    prisma.siteSettings.findMany({
      where: { id: { startsWith: "customer-ssl:" } },
      select: { data: true },
    }),
    prisma.siteSettings.findMany({
      where: { id: { startsWith: "customer-mail:" } },
      select: { data: true },
    }),
    prisma.domainOrder.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        domain: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
      },
    }),
    prisma.hostingOrder.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productSlug: true,
        planKey: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      where: { status: "PAID" },
      take: 6,
      orderBy: { paidAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        currency: true,
        paidAt: true,
      },
    }),
    prisma.domainRegistration.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gte: now, lte: soon },
      },
      take: 6,
      orderBy: { expiresAt: "asc" },
      select: { id: true, domain: true, expiresAt: true },
    }),
    probeSiteTls(host),
  ]);

  const ssl = countSslBags(sslRows, now);
  const memTotal = os.totalmem();
  const memFree = os.freemem();

  return {
    generatedAt: now.toISOString(),
    money: {
      domainPaidCount: domainPaid._count,
      domainPaidTotal: decimalToNumber(domainPaid._sum.total),
      domainPendingCount: domainPending,
      hostingPaidCount: hostingPaid._count,
      hostingPaidTotal: decimalToNumber(hostingPaid._sum.total),
      hostingPendingCount: hostingPending,
      walletTopupCount: wallet._count,
      walletTopupTotal: decimalToNumber(wallet._sum.amount),
      invoicesPaidCount: invoicesPaid._count,
      invoicesPaidTotal: decimalToNumber(invoicesPaid._sum.total),
      invoicesOpenCount: invoicesOpen,
      currency: "USD",
    },
    domains: {
      active: activeDomains,
      expiring30: expiring,
      expired,
      autoRenew,
      transfersOpen,
    },
    hosting: hostingByStatus
      .map((row) => ({
        status: row.status,
        count: row._count._all,
        total: decimalToNumber(row._sum.total),
      }))
      .sort((a, b) => b.count - a.count),
    email: {
      queuedMessages: countMailBags(mailRows),
      mailboxesStored: mailRows.length,
      openTickets: tickets,
    },
    ssl: {
      stored: ssl.total,
      active: ssl.active,
      expiring30: ssl.expiring,
      premium: ssl.premium,
      siteHost: host,
      siteOk: siteTls.ok,
      siteExpiresAt: siteTls.expiresAt,
      siteIssuer: siteTls.issuer,
      siteError: siteTls.error,
    },
    customers: { total: customers, sessions24h },
    integrations: integrations(),
    traffic: {
      connected: false,
      note: "No analytics provider is connected. Referrers and page views are not stored, so this dashboard does not invent traffic.",
    },
    server: {
      hostname: os.hostname(),
      platform: `${os.platform()} ${os.release()}`,
      node: process.version,
      load: os
        .loadavg()
        .map((n) => n.toFixed(2))
        .join(" / "),
      memoryUsedMb: Math.round((memTotal - memFree) / (1024 * 1024)),
      memoryTotalMb: Math.round(memTotal / (1024 * 1024)),
      hostUptimeHours: Math.round(os.uptime() / 3600),
      processUptimeHours: Math.round(process.uptime() / 3600),
    },
    recentDomains: recentDomains.map((row) => ({
      id: row.id,
      title: row.domain,
      meta: `${row.status} · ${row.createdAt.toLocaleString()}`,
      amount: moneyLabel(decimalToNumber(row.total), row.currency || "USD"),
      href: "/orbit/domain-orders",
    })),
    recentHosting: recentHosting.map((row) => ({
      id: row.id,
      title: `${row.productSlug} · ${row.planKey}`,
      meta: `${row.status} · ${row.createdAt.toLocaleString()}`,
      amount: moneyLabel(decimalToNumber(row.total), row.currency || "USD"),
      href: "/orbit/hosting-orders",
    })),
    recentInvoices: recentInvoices.map((row) => ({
      id: row.id,
      title: row.invoiceNumber,
      meta: row.paidAt ? row.paidAt.toLocaleString() : "Paid",
      amount: moneyLabel(decimalToNumber(row.total), row.currency || "USD"),
      href: "/orbit/invoices",
    })),
    expiringDomains: expiringList.map((row) => ({
      id: row.id,
      title: row.domain,
      meta: row.expiresAt ? row.expiresAt.toLocaleDateString() : "No date",
      amount: "Renew",
      href: "/orbit/customer-domains",
    })),
  };
}
