import { Prisma, type HostingOrder } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { hostingOrderCustomerReference } from "@/lib/hosting/customer-hosting-orders";
import { HOSTING_ORDER_STATUS_LABELS } from "@/lib/hosting/provisioning";

import {
  planSiteLimit,
  readHostingSites,
  type CustomerHostingPlan,
} from "./customer-hosting-sites";

type OrderSnapshot = {
  planName?: string;
  productName?: string;
  configuration?: { websites?: unknown } | null;
};

/** Everything a customer needs to see their own hosting, newest first. */
export async function listCustomerHostingPlans(
  userId: string,
): Promise<CustomerHostingPlan[]> {
  let orders: HostingOrder[];
  try {
    orders = await prisma.hostingOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
  } catch {
    return [];
  }

  return orders.map((order) => {
    const snapshot = (order.lineItemsSnapshot ?? {}) as OrderSnapshot;
    const configuration = (order.configuration ?? {}) as Record<
      string,
      unknown
    >;
    const sites = readHostingSites(configuration);
    const planName =
      snapshot.planName?.trim() || `${order.productSlug} · ${order.planKey}`;

    /**
     * The plan's website allowance is stored on the catalogue plan, not the
     * order, so we read it from the snapshot when the quote captured it.
     */
    const websitesSpec =
      (configuration.websites as string | undefined) ??
      (snapshot.configuration?.websites as string | undefined) ??
      null;

    return {
      orderId: order.id,
      orderReference: hostingOrderCustomerReference(order.id),
      status: order.status,
      statusLabel: HOSTING_ORDER_STATUS_LABELS[order.status] ?? order.status,
      productSlug: order.productSlug,
      productName: snapshot.productName?.trim() || order.productSlug,
      planKey: order.planKey,
      planName,
      billingCycle: order.billingCycle,
      total: Number(order.total),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      sites,
      readyForSites: order.status === "ACTIVE",
      siteLimit: planSiteLimit(websitesSpec),
      ctaHref:
        order.status === "DRAFT" || order.status === "PENDING_PAYMENT"
          ? `/checkout/hosting?product=${encodeURIComponent(order.productSlug)}&plan=${encodeURIComponent(order.planKey)}&billing=${encodeURIComponent(order.billingCycle)}`
          : null,
    };
  });
}

export type AddSiteResult =
  | { ok: true; siteId: string }
  | {
      ok: false;
      reason:
        | "order_not_found"
        | "plan_not_active"
        | "site_limit_reached"
        | "invalid_input";
    };

/**
 * Adds a website request to an ACTIVE hosting order.
 *
 * Everything is written with a single transactional read-modify-write so two
 * tabs cannot create the same slot twice, and no provider call happens here —
 * until a control-panel API exists this is an honest setup request for staff.
 */
export async function addHostingSite(input: {
  userId: string;
  orderId: string;
  type: string;
  name: string;
  domain: string | null;
}): Promise<AddSiteResult> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.hostingOrder.findFirst({
      where: { id: input.orderId, userId: input.userId },
    });
    if (!order) return { ok: false, reason: "order_not_found" };
    if (order.status !== "ACTIVE")
      return { ok: false, reason: "plan_not_active" };

    const configuration = (order.configuration ?? {}) as Record<
      string,
      unknown
    >;
    const existing = readHostingSites(configuration);
    const snapshot = (order.lineItemsSnapshot ?? {}) as OrderSnapshot;
    const websitesSpec =
      (configuration.websites as string | undefined) ??
      (snapshot.configuration?.websites as string | undefined) ??
      null;
    const limit = planSiteLimit(websitesSpec);
    if (limit != null && existing.length >= limit) {
      return { ok: false, reason: "site_limit_reached" };
    }

    const siteId = `site_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const nextSites = [
      ...existing,
      {
        id: siteId,
        type: input.type,
        name: input.name,
        domain: input.domain,
        status: "awaiting_setup" as const,
        externalId: null,
        createdAt: new Date().toISOString(),
      },
    ];

    await tx.hostingOrder.update({
      where: { id: order.id },
      data: {
        configuration: {
          ...configuration,
          sites: nextSites,
        } as Prisma.InputJsonValue,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "SETTINGS_UPDATE",
        resource: `HostingOrder:${order.id}`,
        details: JSON.stringify({
          kind: "hosting_site_requested",
          siteId,
          siteType: input.type,
          domain: input.domain,
        }),
      },
    });

    return { ok: true, siteId };
  });
}
