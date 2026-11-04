import { prisma } from "@/lib/prisma";
import { getPlanConfig, type BeyondAiPlanId } from "@/config/beyond-ai-product";
import {
  decideFreePlanCreditRefresh,
  nextMonthlyPeriodEnd,
} from "@/lib/beyond-ai/plan-policy";

export type BeyondAiSubscriptionView = {
  planId: string;
  planName: string;
  status: string;
  creditRemainingUsd: number;
  monthlyCreditUsd: number;
  onDemandEnabled: boolean;
  onDemandAccruedUsd: number;
  hostingIncluded: boolean;
};

function toView(row: {
  planId: string;
  status: string;
  creditRemainingUsd: number;
  monthlyCreditUsd: number;
  onDemandEnabled: boolean;
  onDemandAccruedUsd: number;
}): BeyondAiSubscriptionView {
  const plan = getPlanConfig(row.planId);
  return {
    planId: row.planId,
    planName: plan.name,
    status: row.status,
    creditRemainingUsd: row.creditRemainingUsd,
    monthlyCreditUsd: row.monthlyCreditUsd,
    onDemandEnabled: row.onDemandEnabled,
    onDemandAccruedUsd: row.onDemandAccruedUsd,
    hostingIncluded: plan.hosting.included,
  };
}

export async function getSubscriptionForUser(
  userId: string,
): Promise<BeyondAiSubscriptionView | null> {
  const row = await prisma.beyondAiSubscription.findUnique({
    where: { userId },
  });
  if (!row) return null;
  return toView(row);
}

/**
 * Free plan activation is idempotent inside a billing period: re-POSTing the
 * checkout route must not re-fill consumed credit or move the period end.
 */
export async function activateFreePlan(
  userId: string,
): Promise<BeyondAiSubscriptionView> {
  const plan = getPlanConfig("free");
  const now = new Date();
  const existing = await prisma.beyondAiSubscription.findUnique({
    where: { userId },
  });

  const decision = decideFreePlanCreditRefresh({
    existingPlanId: existing?.planId ?? null,
    existingStatus: existing?.status ?? null,
    existingPeriodEnd: existing?.currentPeriodEnd ?? null,
    targetPlanId: plan.id,
    now,
  });

  if (!decision.refresh && existing) {
    return toView(existing);
  }

  const row = await prisma.beyondAiSubscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status: "active",
      monthlyCreditUsd: plan.includedCreditUsd,
      creditRemainingUsd: plan.includedCreditUsd,
      currentPeriodEnd: nextMonthlyPeriodEnd(now),
    },
    update: {
      planId: plan.id,
      status: "active",
      monthlyCreditUsd: plan.includedCreditUsd,
      creditRemainingUsd: plan.includedCreditUsd,
      currentPeriodEnd: nextMonthlyPeriodEnd(now),
    },
  });
  return toView(row);
}

/**
 * Paid plans: assign credits after verified payment.
 * TODO: Wire Stripe webhook — never call from client without payment proof.
 */
export async function activatePaidPlan(
  userId: string,
  planId: BeyondAiPlanId,
  billingInterval: "monthly" | "yearly" = "monthly",
): Promise<BeyondAiSubscriptionView> {
  const plan = getPlanConfig(planId);
  if (plan.priceMonthly <= 0) {
    return activateFreePlan(userId);
  }
  const row = await prisma.beyondAiSubscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status: "active",
      monthlyCreditUsd: plan.includedCreditUsd,
      creditRemainingUsd: plan.includedCreditUsd,
      billingInterval,
      currentPeriodEnd: nextMonthlyPeriodEnd(),
    },
    update: {
      planId: plan.id,
      status: "active",
      monthlyCreditUsd: plan.includedCreditUsd,
      creditRemainingUsd: plan.includedCreditUsd,
      billingInterval,
      currentPeriodEnd: nextMonthlyPeriodEnd(),
    },
  });
  return toView(row);
}

/**
 * Returns false when the customer has no subscription row, so the route can
 * report a real state instead of echoing the requested flag.
 */
export async function setOnDemandEnabled(
  userId: string,
  enabled: boolean,
): Promise<boolean> {
  const result = await prisma.beyondAiSubscription.updateMany({
    where: { userId },
    data: { onDemandEnabled: enabled },
  });
  return result.count > 0;
}
