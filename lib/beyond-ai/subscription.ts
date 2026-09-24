import { prisma } from "@/lib/prisma";
import { getPlanConfig, type BeyondAiPlanId } from "@/config/beyond-ai-product";

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

function periodEndMonthly(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

export async function getSubscriptionForUser(
  userId: string,
): Promise<BeyondAiSubscriptionView | null> {
  const row = await prisma.beyondAiSubscription.findUnique({
    where: { userId },
  });
  if (!row) return null;
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

export async function activateFreePlan(
  userId: string,
): Promise<BeyondAiSubscriptionView> {
  const plan = getPlanConfig("free");
  const row = await prisma.beyondAiSubscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status: "active",
      monthlyCreditUsd: plan.includedCreditUsd,
      creditRemainingUsd: plan.includedCreditUsd,
      currentPeriodEnd: periodEndMonthly(),
    },
    update: {
      planId: plan.id,
      status: "active",
      monthlyCreditUsd: plan.includedCreditUsd,
      creditRemainingUsd: plan.includedCreditUsd,
      currentPeriodEnd: periodEndMonthly(),
    },
  });
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
      currentPeriodEnd: periodEndMonthly(),
    },
    update: {
      planId: plan.id,
      status: "active",
      monthlyCreditUsd: plan.includedCreditUsd,
      creditRemainingUsd: plan.includedCreditUsd,
      billingInterval,
      currentPeriodEnd: periodEndMonthly(),
    },
  });
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

export async function setOnDemandEnabled(
  userId: string,
  enabled: boolean,
): Promise<void> {
  await prisma.beyondAiSubscription.updateMany({
    where: { userId },
    data: { onDemandEnabled: enabled },
  });
}
